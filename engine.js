// ============================================================================
// Parametric Riff Timeline Engine
// Stage 1: Core Engine + Stage 2: Pitch Resolver
// ============================================================================

// ============================================================================
// 1. Data Models
// ============================================================================

// Note: In vanilla JS, we use objects that match the TypeScript interfaces

// Chord degree to semitone mapping (for major keys)
const DEGREE_TO_SEMITONES = {
  "I": 0,
  "II": 2,
  "III": 4,
  "IV": 5,
  "V": 7,
  "VI": 9,
  "VII": 11
};

// Reverse mapping: semitones to scale degrees (for major scale)
const SEMITONES_TO_DEGREE = {
  0: "I",
  2: "II",
  4: "III",
  5: "IV",
  7: "V",
  9: "VI",
  11: "VII"
};

// ============================================================================
// 2. Timeline Construction
// ============================================================================

function buildTimeline(progression) {
  const timeline = {
    key: progression.key,
    bars: [],
    chordBoundaries: [] // [{ barIndex, chordIndex, startBeat }]
  };

  let currentBar = 0;
  let currentBeat = 1;
  let chordIndex = 0;

  for (let i = 0; i < progression.chords.length; i++) {
    const chord = progression.chords[i];
    const chordStartBar = currentBar;
    const chordStartBeat = currentBeat;

    // Create bars for this chord
    for (let b = 0; b < chord.bars; b++) {
      timeline.bars.push({
        index: currentBar,
        chordIndex: i,
        chordDegree: chord.degree,
        startBeat: currentBeat,
        beats: 4 // Assuming 4/4 time
      });
      currentBar++;
      currentBeat += 4;
    }

    timeline.chordBoundaries.push({
      barIndex: chordStartBar,
      chordIndex: i,
      startBeat: chordStartBeat,
      endBeat: currentBeat - 1
    });
  }

  return timeline;
}

// ============================================================================
// 3. Rule Slot Mapping
// ============================================================================

function getRuleSlots(timeline) {
  const slots = [];

  // Global slot
  slots.push({ type: "global" });

  // Per-bar slots
  for (let i = 0; i < timeline.bars.length; i++) {
    slots.push({ type: "bar", index: i });
  }

  // Per-chord slots
  for (let i = 0; i < timeline.chordBoundaries.length; i++) {
    slots.push({ type: "chord", index: i });
  }

  // Transition slots
  for (let i = 0; i < timeline.chordBoundaries.length - 1; i++) {
    slots.push({ type: "transition", from: i, to: i + 1 });
  }

  // Last chord slot
  if (timeline.chordBoundaries.length > 0) {
    slots.push({ type: "lastChord" });
  }

  return slots;
}

// ============================================================================
// 4. Chord Resolution
// ============================================================================

function getKeyRootSemitones(key) {
  // Key is stored but we only need it for context
  // The actual pitch resolution is relative to scale degrees
  // For now, we'll use 0 as the base (I degree)
  return 0;
}

function resolveChordDegree(degree, key) {
  // Return semitones relative to key root (I = 0)
  return DEGREE_TO_SEMITONES[degree] || 0;
}

function semitonesToScaleDegree(semitones) {
  // Convert semitones (0-11) to scale degree
  // For chromatic notes, find the nearest scale degree and show offset
  const normalizedSemitones = ((semitones % 12) + 12) % 12;
  
  // Check if it's a scale degree
  if (SEMITONES_TO_DEGREE[normalizedSemitones]) {
    return SEMITONES_TO_DEGREE[normalizedSemitones];
  }
  
  // For chromatic notes, find nearest scale degree
  // and show the offset
  const scaleSemitones = [0, 2, 4, 5, 7, 9, 11];
  let nearestDegree = "I";
  let minDistance = 12;
  
  for (const [deg, semis] of Object.entries(DEGREE_TO_SEMITONES)) {
    let distance = Math.abs(normalizedSemitones - semis);
    if (distance > 6) distance = 12 - distance; // Wrap around
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestDegree = deg;
    }
  }
  
  // Calculate offset
  const baseSemitones = DEGREE_TO_SEMITONES[nearestDegree];
  let offset = normalizedSemitones - baseSemitones;
  if (offset > 6) offset = offset - 12;
  if (offset < -6) offset = offset + 12;
  
  if (offset === 0) {
    return nearestDegree;
  } else if (offset > 0) {
    return `${nearestDegree}+${offset}`;
  } else {
    return `${nearestDegree}${offset}`;
  }
}

// ============================================================================
// 5. Pitch Reference Resolution
// ============================================================================

function resolvePitchRef(pitchRef, context) {
  const { basis, offset, degreeHint } = pitchRef;
  const { timeline, currentChordIndex, currentBeat, nextChordIndex } = context;

  let baseSemitones = 0;

  switch (basis) {
    case "keyRoot":
      baseSemitones = getKeyRootSemitones(timeline.key);
      break;

    case "currentChord":
      if (currentChordIndex !== undefined && currentChordIndex < timeline.chordBoundaries.length) {
        const chordBoundary = timeline.chordBoundaries[currentChordIndex];
        const bar = timeline.bars.find(b => b.chordIndex === currentChordIndex);
        if (bar) {
          baseSemitones = resolveChordDegree(bar.chordDegree, timeline.key);
        }
      }
      break;

    case "nextChord":
      if (nextChordIndex !== undefined && nextChordIndex < timeline.chordBoundaries.length) {
        const chordBoundary = timeline.chordBoundaries[nextChordIndex];
        const bar = timeline.bars.find(b => b.chordIndex === nextChordIndex);
        if (bar) {
          baseSemitones = resolveChordDegree(bar.chordDegree, timeline.key);
        }
      }
      break;

    case "chordTone":
      // For chordTone, we need to interpret degreeHint
      // For now, assume it's relative to current chord
      if (currentChordIndex !== undefined && currentChordIndex < timeline.chordBoundaries.length) {
        const bar = timeline.bars.find(b => b.chordIndex === currentChordIndex);
        if (bar) {
          // degreeHint like "1", "3", "5" means root, third, fifth
          const chordRoot = resolveChordDegree(bar.chordDegree, timeline.key);
          if (degreeHint === "1") {
            baseSemitones = chordRoot;
          } else if (degreeHint === "3") {
            baseSemitones = (chordRoot + 4) % 12; // Major third
          } else if (degreeHint === "5") {
            baseSemitones = (chordRoot + 7) % 12; // Perfect fifth
          } else {
            baseSemitones = chordRoot;
          }
        }
      }
      break;

    default:
      baseSemitones = 0;
  }

  // Apply offset
  const finalSemitones = (baseSemitones + offset) % 12;
  return finalSemitones;
}

// ============================================================================
// 6. Register and Octave Resolution
// ============================================================================

function resolveRegister(appliedRule, part, rule) {
  // Priority: 1. Rule slot override, 2. Part default, 3. Rule default, 4. System fallback
  if (appliedRule.registerOverride) {
    return appliedRule.registerOverride;
  }
  if (part.defaultRegister) {
    return part.defaultRegister;
  }
  if (rule && rule.defaultRegister) {
    return rule.defaultRegister;
  }
  return "mid"; // System fallback
}

function getOctaveForRegister(register, noteSemitones) {
  // Octave ranges (middle C = C4)
  // low: octaves 2-3
  // mid: octaves 3-4
  // high: octaves 4-5

  const baseOctave = {
    "low": 2,
    "mid": 3,
    "high": 4
  }[register] || 3;

  // For simplicity, use base octave
  // In a more sophisticated system, we'd consider the note's position
  return baseOctave;
}

// ============================================================================
// 7. Riff Instantiation
// ============================================================================

function instantiateRiff(riff, startBeat, context) {
  const instantiatedEvents = [];

  for (const paramEvent of riff.events) {
    const absoluteStartBeat = startBeat + paramEvent.startBeat - 1; // Convert relative to absolute

    instantiatedEvents.push({
      startBeat: absoluteStartBeat,
      duration: paramEvent.duration,
      pitchRef: paramEvent.pitchRef,
      octaveStrategy: paramEvent.octaveStrategy || "nearest"
    });
  }

  return instantiatedEvents;
}

// ============================================================================
// 8. Note Event Resolution
// ============================================================================

function resolveNoteEvent(paramEvent, context, register) {
  const pitchSemitones = resolvePitchRef(paramEvent.pitchRef, context);
  const octave = getOctaveForRegister(register, pitchSemitones);

  // Convert semitones to scale degree
  // The pitch is relative to key root (I = 0 semitones)
  const normalizedSemitones = ((pitchSemitones % 12) + 12) % 12;
  const degree = semitonesToScaleDegree(normalizedSemitones);

  return {
    startBeat: paramEvent.startBeat,
    duration: paramEvent.duration,
    degree: degree,
    octave: octave
  };
}

// ============================================================================
// 9. Main Execution Pipeline
// ============================================================================

function executePipeline(progression, parts, appliedRules) {
  // Build timeline
  const timeline = buildTimeline(progression);

  // Get all rule slots
  const ruleSlots = getRuleSlots(timeline);

  // Process each part
  const allNoteEvents = [];

  for (const part of parts) {
    if (part.muted) continue;

    const partEvents = [];

    // Filter rules for this part
    const partRules = appliedRules.filter(r => !r.partId || r.partId === part.id);

    // Organize rules by specificity and determine their beat ranges
    // Priority: bar > chord > transition > lastChord > global
    const ruleApplications = [];

    for (const appliedRule of partRules) {
      const rule = RULES[appliedRule.ruleId];
      if (!rule) continue;

      // Handle walk rules differently (they're resolved dynamically)
      let riff;
      if (rule.category === "walk") {
        // Walk rules are resolved later with parameters
        // For now, skip if no parameters provided
        if (!appliedRule.parameters) continue;
        // We'll resolve this in the application loop
      } else {
        riff = RIFFS[rule.riffId];
        if (!riff) continue;
      }

      const slot = appliedRule.slot;
      let startBeat = 1;
      let endBeat = timeline.bars.length * 4; // Total beats
      let specificity = 0; // Higher = more specific
      let currentChordIndex = 0;
      let nextChordIndex = 1;

      if (slot.type === "bar") {
        const bar = timeline.bars[slot.index];
        if (bar) {
          startBeat = bar.startBeat;
          endBeat = bar.startBeat + 3; // 4 beats per bar
          specificity = 4;
          currentChordIndex = bar.chordIndex;
          nextChordIndex = currentChordIndex + 1;
        } else {
          continue; // Invalid bar index
        }
      } else if (slot.type === "chord") {
        const chordBoundary = timeline.chordBoundaries[slot.index];
        if (chordBoundary) {
          startBeat = chordBoundary.startBeat;
          endBeat = chordBoundary.endBeat;
          specificity = 3;
          currentChordIndex = slot.index;
          nextChordIndex = currentChordIndex + 1;
        } else {
          continue; // Invalid chord index
        }
      } else if (slot.type === "transition") {
        const fromBoundary = timeline.chordBoundaries[slot.from];
        const toBoundary = timeline.chordBoundaries[slot.to];
        if (fromBoundary && toBoundary) {
          startBeat = toBoundary.startBeat;
          endBeat = toBoundary.startBeat + riff.lengthBeats - 1;
          specificity = 2;
          currentChordIndex = slot.from;
          nextChordIndex = slot.to;
        } else {
          continue;
        }
      } else if (slot.type === "lastChord") {
        const lastBoundary = timeline.chordBoundaries[timeline.chordBoundaries.length - 1];
        if (lastBoundary) {
          startBeat = lastBoundary.startBeat;
          endBeat = lastBoundary.endBeat;
          specificity = 1;
          currentChordIndex = timeline.chordBoundaries.length - 1;
          nextChordIndex = currentChordIndex;
        } else {
          continue;
        }
      } else if (slot.type === "global") {
        startBeat = 1;
        endBeat = timeline.bars.length * 4;
        specificity = 0;
        currentChordIndex = 0;
        nextChordIndex = 1;
      }

      ruleApplications.push({
        appliedRule: appliedRule,
        rule: rule,
        riff: riff,
        startBeat: startBeat,
        endBeat: endBeat,
        specificity: specificity,
        currentChordIndex: currentChordIndex,
        nextChordIndex: nextChordIndex,
        isWalkRule: rule.category === "walk"
      });
    }

    // Sort by specificity (highest first), then by startBeat
    ruleApplications.sort((a, b) => {
      if (b.specificity !== a.specificity) {
        return b.specificity - a.specificity;
      }
      return a.startBeat - b.startBeat;
    });

    // Track which beats are covered by more specific rules
    // Map from beat number to the specificity of the rule covering it
    const beatCoverage = new Map();

    // Apply rules in order of specificity
    for (const ruleApp of ruleApplications) {
      const { appliedRule, rule, riff, startBeat, endBeat, currentChordIndex, nextChordIndex, specificity } = ruleApp;

      // Determine register
      const register = resolveRegister(appliedRule, part, rule);

      // For global rules, apply to each bar
      if (specificity === 0 && appliedRule.slot.type === "global") {
        // Apply the riff to each bar in the timeline
        for (const bar of timeline.bars) {
          const barStartBeat = bar.startBeat;
          const barChordIndex = bar.chordIndex;
          const barNextChordIndex = barChordIndex + 1 < timeline.chordBoundaries.length ? barChordIndex + 1 : barChordIndex;

          // Create context for this bar
          const context = {
            timeline: timeline,
            currentChordIndex: barChordIndex,
            currentBeat: barStartBeat,
            nextChordIndex: barNextChordIndex
          };

          // Resolve walk rules or use regular riff
          let instantiatedEvents;
          if (ruleApp.isWalkRule) {
            const parameters = appliedRule.parameters || getDefaultWalkParameters(rule);
            const resolvedWalk = resolveWalkRule(rule, parameters, context);
            instantiatedEvents = instantiateRiff(resolvedWalk, barStartBeat, context);
          } else {
            instantiatedEvents = instantiateRiff(riff, barStartBeat, context);
          }

          // Resolve each event
          for (const paramEvent of instantiatedEvents) {
            const eventBeat = paramEvent.startBeat;
            
            // Check if this beat is already covered by a more specific rule
            const existingSpecificity = beatCoverage.get(eventBeat);
            if (existingSpecificity !== undefined && existingSpecificity > specificity) {
              // Skip this event - a more specific rule already covers this beat
              continue;
            }

            // Mark this beat as covered by this rule's specificity
            beatCoverage.set(eventBeat, specificity);

            // Determine which chord this event belongs to based on its beat
            let eventChordIndex = barChordIndex;
            for (let i = 0; i < timeline.chordBoundaries.length; i++) {
              const boundary = timeline.chordBoundaries[i];
              if (eventBeat >= boundary.startBeat && 
                  eventBeat <= boundary.endBeat) {
                eventChordIndex = i;
                break;
              }
            }

            // Determine next chord
            let eventNextChordIndex = eventChordIndex + 1;
            if (eventNextChordIndex >= timeline.chordBoundaries.length) {
              eventNextChordIndex = eventChordIndex;
            }

            // Update context for this specific event
            const eventContext = {
              timeline: timeline,
              currentChordIndex: eventChordIndex,
              currentBeat: eventBeat,
              nextChordIndex: eventNextChordIndex
            };

            const resolvedEvent = resolveNoteEvent(paramEvent, eventContext, register);
            partEvents.push({
              ...resolvedEvent,
              partId: part.id,
              partName: part.name
            });
          }
        }
      } else {
        // For non-global rules, apply once as before
        // Create context for pitch resolution
        const context = {
          timeline: timeline,
          currentChordIndex: currentChordIndex,
          currentBeat: startBeat,
          nextChordIndex: nextChordIndex < timeline.chordBoundaries.length ? nextChordIndex : currentChordIndex
        };

        // Resolve walk rules or use regular riff
        let instantiatedEvents;
        if (ruleApp.isWalkRule) {
          const parameters = appliedRule.parameters || getDefaultWalkParameters(rule);
          const resolvedWalk = resolveWalkRule(rule, parameters, context);
          instantiatedEvents = instantiateRiff(resolvedWalk, startBeat, context);
        } else {
          instantiatedEvents = instantiateRiff(riff, startBeat, context);
        }

        // Resolve each event, but only if the beat isn't already covered by a more specific rule
        for (const paramEvent of instantiatedEvents) {
          const eventBeat = paramEvent.startBeat;
          
          // Check if this beat is already covered by a more specific rule
          const existingSpecificity = beatCoverage.get(eventBeat);
          if (existingSpecificity !== undefined && existingSpecificity > specificity) {
            // Skip this event - a more specific rule already covers this beat
            continue;
          }

          // Mark this beat as covered by this rule's specificity
          beatCoverage.set(eventBeat, specificity);

          // Determine which chord this event belongs to based on its beat
          let eventChordIndex = currentChordIndex;
          for (let i = 0; i < timeline.chordBoundaries.length; i++) {
            const boundary = timeline.chordBoundaries[i];
            if (eventBeat >= boundary.startBeat && 
                eventBeat <= boundary.endBeat) {
              eventChordIndex = i;
              break;
            }
          }

          // Determine next chord
          let eventNextChordIndex = eventChordIndex + 1;
          if (eventNextChordIndex >= timeline.chordBoundaries.length) {
            eventNextChordIndex = eventChordIndex;
          }

          // Update context for this specific event
          const eventContext = {
            timeline: timeline,
            currentChordIndex: eventChordIndex,
            currentBeat: eventBeat,
            nextChordIndex: eventNextChordIndex
          };

          const resolvedEvent = resolveNoteEvent(paramEvent, eventContext, register);
          partEvents.push({
            ...resolvedEvent,
            partId: part.id,
            partName: part.name
          });
        }
      }
    }

    // Sort events by startBeat
    partEvents.sort((a, b) => a.startBeat - b.startBeat);

    allNoteEvents.push({
      part: part,
      events: partEvents
    });
  }

  return {
    timeline: timeline,
    noteEvents: allNoteEvents
  };
}

// ============================================================================
// 10. Text Output
// ============================================================================

function formatNoteEventsAsText(result) {
  let output = "";
  output += "=".repeat(60) + "\n";
  output += "RESOLVED NOTE EVENTS\n";
  output += "=".repeat(60) + "\n\n";

  output += `Key: ${result.timeline.key}\n`;
  output += `Total Bars: ${result.timeline.bars.length}\n\n`;

  // Show timeline structure
  output += "Timeline Structure:\n";
  output += "-".repeat(60) + "\n";
  for (const bar of result.timeline.bars) {
    output += `Bar ${bar.index + 1} (beats ${bar.startBeat}-${bar.startBeat + 3}): ${bar.chordDegree}\n`;
  }
  output += "\n";

  // Show note events per part
  for (const partData of result.noteEvents) {
    output += `\nPart: ${partData.part.name} (${partData.part.id})\n`;
    output += "-".repeat(60) + "\n";

    if (partData.events.length === 0) {
      output += "  (no events)\n";
    } else {
      for (const event of partData.events) {
        const barNum = Math.floor((event.startBeat - 1) / 4) + 1;
        const beatInBar = ((event.startBeat - 1) % 4) + 1;
        output += `  Beat ${event.startBeat} (Bar ${barNum}, Beat ${beatInBar}): `;
        output += `${event.degree} (octave ${event.octave}) `;
        output += `[duration: ${event.duration} beat${event.duration !== 1 ? 's' : ''}]\n`;
      }
    }
  }

  output += "\n" + "=".repeat(60) + "\n";

  return output;
}

// ============================================================================
// Helper: Get default walk parameters
// ============================================================================

function getDefaultWalkParameters(rule) {
  if (!rule.parameters) return {};
  const defaults = {};
  for (const [key, param] of Object.entries(rule.parameters)) {
    defaults[key] = param.default;
  }
  return defaults;
}

// ============================================================================
// 11. Example Usage
// ============================================================================

// Example setup
const exampleProgression = PROGRESSIONS.I_IV_V_I;

const exampleParts = [
  {
    id: "bass",
    name: "Bass",
    muted: false,
    defaultRegister: "low"
  },
  {
    id: "rhythm",
    name: "Rhythm",
    muted: false,
    defaultRegister: "mid"
  }
];

const exampleAppliedRules = [
  /*{
    ruleId: "default_root_hold",
    slot: { type: "global" }
  },*/
  {
    ruleId: "oom_pah_rule",
    slot: { type: "global" },//{ type: "chord", index: 0 },
    registerOverride: "low"
  }
];

// Execute
const result = executePipeline(exampleProgression, exampleParts, exampleAppliedRules);
const textOutput = formatNoteEventsAsText(result);

// Output to console and make available globally for HTML
console.log(textOutput);
if (typeof window !== 'undefined') {
  window.textOutput = textOutput;
}

