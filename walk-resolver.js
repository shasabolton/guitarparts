// ============================================================================
// Walk Resolver
// Resolves walk rule parameters into parametric note events
// ============================================================================

function resolveWalkRule(walkRule, parameters, context) {
  const { timeline, currentChordIndex, nextChordIndex, currentBeat } = context;
  
  
  // Get genre profile
  const genreProfile = walkRule.genreProfiles[parameters.genreProfile] || walkRule.genreProfiles.custom;
  
  // Get start and target anchors
  const startAnchor = parameters.target === "currentChordRoot" 
    ? getChordRoot(currentChordIndex, timeline)
    : getChordRoot(currentChordIndex, timeline);
    
  const targetAnchor = parameters.target === "nextChordRoot"
    ? getChordRoot(nextChordIndex, timeline)
    : getChordRoot(currentChordIndex, timeline);


  // Calculate direction
  let direction = parameters.direction;
  if (direction === "auto") {
    const startSemitones = resolveChordDegree(startAnchor, timeline.key);
    const targetSemitones = resolveChordDegree(targetAnchor, timeline.key);
    const upDistance = (targetSemitones - startSemitones + 12) % 12;
    const downDistance = (startSemitones - targetSemitones + 12) % 12;
    direction = upDistance <= downDistance ? "up" : "down";
 
  }
  
  // Generate walk steps
  const steps = parameters.steps || 3;
  const walkNotes = generateWalkSteps(
    startAnchor,
    targetAnchor,
    steps,
    direction,
    genreProfile,
    parameters.approachStrategy,
    timeline
  );
  console.log("walkNotes", walkNotes);
  
  // Create events from timeline template
  const events = [];
  let eventIndex = 0;
  
  for (const templateEvent of walkRule.timelineTemplate.events) {
    console.log("templateEvent", templateEvent);
    const beat = templateEvent.barOffset 
      ? currentBeat + templateEvent.barOffset * 4 + templateEvent.beat - 1
      : currentBeat + templateEvent.beat - 1;
    
    let noteDegree;
    
    switch (templateEvent.role) {
      case "startAnchor":
        noteDegree = startAnchor;
        break;
        
      case "targetAnchor":
        noteDegree = targetAnchor;
        break;
        
      case "walkStep":
        const stepIndex = templateEvent.stepIndex - 1;
        if (stepIndex < walkNotes.length) {
          noteDegree = walkNotes[stepIndex];
        } else {
          // Fallback to interpolated step
          noteDegree = interpolateStep(startAnchor, targetAnchor, stepIndex, steps, timeline);
        }
        break;
        
      case "approachTone":
        noteDegree = getApproachTone(targetAnchor, direction, genreProfile, timeline);
        break;
        
      default:
        noteDegree = startAnchor;
    }
    
    // Convert degree to pitch reference
    const pitchRef = degreeToPitchRef(noteDegree, templateEvent.noteSource, context);
    events.push({
      startBeat: beat,
      duration: 1, // Each step is 1 beat
      pitchRef: pitchRef
    });
    
    eventIndex++;
  }
  
  return {
    id: walkRule.id + "_resolved",
    lengthBeats: walkRule.timelineTemplate.lengthBeats,
    events: events,
    explanation: `Walk from ${startAnchor} to ${targetAnchor} using ${steps} steps`
  };
}

function getChordRoot(chordIndex, timeline) {
  if (chordIndex < 0 || chordIndex >= timeline.chordBoundaries.length) {
    return "I";
  }
  const bar = timeline.bars.find(b => b.chordIndex === chordIndex);
  return bar ? bar.chordDegree : "I";
}

function generateWalkSteps(startDegree, targetDegree, numSteps, direction, genreProfile, approachStrategy, timeline) {

  const startSemitones = resolveChordDegree(startDegree, timeline.key);
  const targetSemitones = resolveChordDegree(targetDegree, timeline.key);
  
  
  // Calculate total distance
  let totalDistance;
  if (direction === "up") {
    totalDistance = (targetSemitones - startSemitones + 12) % 12;
    if (totalDistance === 0) totalDistance = 12;
  } else {
    totalDistance = (startSemitones - targetSemitones + 12) % 12;
    if (totalDistance === 0) totalDistance = 12;
  }
  
  const steps = [];
  const stepSize = totalDistance / (numSteps + 1); // +1 because we have approach tone before target
  

  for (let i = 1; i <= numSteps; i++) {
    let stepSemitones;
    if (direction === "up") {
      stepSemitones = (startSemitones + Math.round(stepSize * i)) % 12;
    } else {
      stepSemitones = (startSemitones - Math.round(stepSize * i) + 12) % 12;
    }
    
    // Apply genre preferences
    if (genreProfile.preferredApproach === "diatonic" && approachStrategy !== "chromatic") {
      // Prefer scale degrees
      stepSemitones = snapToScaleDegree(stepSemitones, timeline.key);
    } else if (genreProfile.preferredApproach === "chromatic" && approachStrategy !== "diatonic") {
      // Allow chromatic steps
      // stepSemitones is already chromatic
    }
    
    const degree = semitonesToScaleDegree(stepSemitones);
    steps.push(degree);
  }
  
  return steps;
}

function interpolateStep(startDegree, targetDegree, stepIndex, numSteps, timeline) {
  const startSemitones = resolveChordDegree(startDegree, timeline.key);
  const targetSemitones = resolveChordDegree(targetDegree, timeline.key);
  
  const progress = (stepIndex + 1) / (numSteps + 1);
  const interpolated = Math.round(startSemitones + (targetSemitones - startSemitones) * progress);
  const normalized = ((interpolated % 12) + 12) % 12;
  
  return semitonesToScaleDegree(normalized);
}

function getApproachTone(targetDegree, direction, genreProfile, timeline) {
  const targetSemitones = resolveChordDegree(targetDegree, timeline.key);
  
  let approachSemitones;
  if (direction === "up") {
    // Semitone below target
    approachSemitones = (targetSemitones - 1 + 12) % 12;
  } else {
    // Semitone above target
    approachSemitones = (targetSemitones + 1) % 12;
  }
  
  if (genreProfile.preferredApproach === "diatonic") {
    approachSemitones = snapToScaleDegree(approachSemitones, timeline.key);
  }
  
  return semitonesToScaleDegree(approachSemitones);
}

function snapToScaleDegree(semitones, key) {
  // Snap to nearest scale degree
  const scaleDegrees = [0, 2, 4, 5, 7, 9, 11]; // Major scale
  let nearest = 0;
  let minDistance = 12;
  
  for (const degree of scaleDegrees) {
    const distance = Math.abs(semitones - degree);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = degree;
    }
  }
  console.log(semitones, "snapped to", nearest);
  return nearest;
}

function degreeToPitchRef(degree, noteSource, context) {
  // For now, treat degree as a chord degree reference
  // In a full implementation, we'd need to handle different note sources
  return {
    basis: noteSource === "targetChordRoot" ? "nextChord" : "currentChord",
    offset: 0,
    degreeHint: degree
  };
}

