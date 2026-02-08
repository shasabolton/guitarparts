// BassGenerator: Generates bass note events per bar
// Applies anchor → preference → embellishment logic

/**
 * Convert chord symbol to scale degree
 * @param {string} chordSymbol - e.g., "I7", "IV7", "V7", "vi", "IV"
 * @returns {string} Root degree (e.g., "1", "4", "5", "6")
 */
function chordSymbolToRootDegree(chordSymbol) {
  // Extract Roman numeral (I, II, III, IV, V, VI, VII)
  const romanMatch = chordSymbol.match(/^([ivxlcdm]+)/i);
  if (!romanMatch) return "1"; // Default to root

  const roman = romanMatch[1].toUpperCase();
  const romanToDegree = {
    'I': '1',
    'II': '2',
    'III': '3',
    'IV': '4',
    'V': '5',
    'VI': '6',
    'VII': '7'
  };

  return romanToDegree[roman] || '1';
}

/**
 * Get the 5th degree from a root degree
 * @param {string} rootDegree - Root degree (e.g., "1", "4", "5")
 * @returns {string} 5th degree
 */
function getFifthDegree(rootDegree) {
  const degreeMap = {
    '1': '5',
    '2': '6',
    '3': '7',
    '4': '1', // 4th to 1st (octave)
    '5': '2',
    '6': '3',
    '7': '4'
  };
  return degreeMap[rootDegree] || '5';
}

/**
 * Apply anchor rule to determine target tone
 * @param {Array} anchorRules - Anchor rules for this context
 * @param {string} currentChord - Current chord symbol
 * @returns {string} Target degree
 */
function applyAnchors(anchorRules, currentChord) {
  for (const rule of anchorRules) {
    if (rule.affectsSlot === 'targetTone') {
      if (rule.action.includes('root')) {
        return chordSymbolToRootDegree(currentChord);
      }
      if (rule.action.includes('fifth') || rule.action.includes('5th')) {
        const root = chordSymbolToRootDegree(currentChord);
        return getFifthDegree(root);
      }
    }
  }
  // Default: play root
  return chordSymbolToRootDegree(currentChord);
}

/**
 * Apply preference rules to choose from options
 * @param {Array} preferenceRules - Preference rules for this context
 * @param {string} anchorTone - The anchor tone (fallback)
 * @param {string} currentChord - Current chord symbol
 * @param {number} randomness - Randomness factor (0-100)
 * @returns {string} Chosen degree
 */
function applyPreferences(preferenceRules, anchorTone, currentChord, randomness) {
  if (preferenceRules.length === 0) return anchorTone;

  const options = [];

  for (const rule of preferenceRules) {
    if (rule.affectsSlot === 'targetTone') {
      const root = chordSymbolToRootDegree(currentChord);
      if (rule.action.includes('5th')) {
        const fifth = getFifthDegree(root);
        options.push({ degree: fifth, weight: rule.weight || 0.5 });
      }
      if (rule.action.includes('root')) {
        options.push({ degree: root, weight: rule.weight || 0.5 });
      }
    }
  }

  // If no specific options, use anchor tone
  if (options.length === 0) return anchorTone;

  // Apply randomness: higher randomness = more random choice
  const randomFactor = randomness / 100;
  if (Math.random() < randomFactor && options.length > 1) {
    // Random choice
    const randomOption = options[Math.floor(Math.random() * options.length)];
    return randomOption.degree;
  }

  // Weighted choice based on rule weights
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let random = Math.random() * totalWeight;
  for (const option of options) {
    random -= option.weight;
    if (random <= 0) {
      return option.degree;
    }
  }

  return options[0].degree;
}

/**
 * Generate bass line note events
 * @param {Object} selection - User selection
 * @param {Object} progression - Chord progression
 * @param {Array} allRules - All available rules
 * @returns {Array} Array of NoteEvent objects
 */
function generateBassLine(selection, progression, allRules) {
  // Get active rules
  const activeRules = getActiveRules(selection, allRules);
  const organizedRules = resolveConflicts(activeRules);

  const noteEvents = [];
  const appliedRules = [];

  // Process each bar
  progression.bars.forEach((chord, barIndex) => {
    const bar = barIndex + 1;
    const previousChord = barIndex > 0 ? progression.bars[barIndex - 1] : null;
    const currentChord = chord;

    // For Level 1, assume 4 beats per bar (quarter notes)
    // For Level 2, could have more complex rhythms
    const beatsPerBar = selection.level === 1 ? 4 : 4; // Start simple

    for (let beat = 1; beat <= beatsPerBar; beat++) {
      // Get rules for this context
      const contextRules = getRulesForContext(
        organizedRules,
        bar,
        beat,
        currentChord,
        previousChord
      );

      // Apply constraints (affect rhythm, not tone selection for now)
      let duration = 1.0; // Default: quarter note
      for (const constraint of contextRules.constraints) {
        if (constraint.affectsSlot === 'rhythm') {
          if (constraint.action.includes('quarter notes only')) {
            duration = 1.0;
          }
        }
      }

      // Apply anchors (must be satisfied)
      const anchorTone = applyAnchors(contextRules.anchors, currentChord);
      
      // Apply preferences (weighted choices)
      const chosenTone = applyPreferences(
        contextRules.preferences,
        anchorTone,
        currentChord,
        selection.randomness
      );

      // Embellishments are ignored for Level 1, could add passing tones for Level 2
      // For now, keep it simple

      // Create note event
      const noteEvent = {
        bar: bar,
        beat: beat,
        degree: chosenTone,
        octaveOffset: 0, // Default octave
        duration: duration,
        explanation: `Bar ${bar} Beat ${beat}: ${chosenTone} (chord: ${currentChord})`
      };

      noteEvents.push(noteEvent);

      // Track applied rules for this beat
      if (contextRules.anchors.length > 0 || contextRules.preferences.length > 0) {
        appliedRules.push({
          bar,
          beat,
          rules: [...contextRules.anchors, ...contextRules.preferences]
        });
      }
    }
  });

  return { noteEvents, appliedRules };
}

