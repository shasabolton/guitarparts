// RuleEngine: Filters applicable rules and resolves conflicts
// Applies rule priority order: constraints > anchors > preferences > embellishments

/**
 * Get active rules for a given selection
 * @param {Object} selection - User selection (genre, level, part)
 * @param {Array} allRules - All available rules
 * @returns {Array} Filtered rules
 */
export function getActiveRules(selection, allRules) {
  return allRules.filter(rule => {
    // Match part
    if (rule.part !== selection.part) return false;
    
    // Match genre
    if (!rule.genreTags.includes(selection.genre)) return false;
    
    // Match level
    if (selection.level < rule.minLevel) return false;
    if (rule.maxLevel !== Infinity && selection.level > rule.maxLevel) return false;
    
    return true;
  });
}

/**
 * Resolve conflicts and organize rules by role and priority
 * @param {Array} rules - Active rules
 * @returns {Object} Organized rules by role
 */
export function resolveConflicts(rules) {
  const organized = {
    constraints: [],
    anchors: [],
    preferences: [],
    embellishments: []
  };

  // Group rules by role
  rules.forEach(rule => {
    organized[rule.role + 's'].push(rule);
  });

  // Check for anchor-anchor conflicts (data errors)
  const anchorConflicts = findAnchorConflicts(organized.anchors);
  if (anchorConflicts.length > 0) {
    console.warn('Anchor conflicts detected (data errors):', anchorConflicts);
  }

  return organized;
}

/**
 * Find conflicts between anchor rules
 * Anchors should not conflict - if they do, it's a data error
 */
function findAnchorConflicts(anchors) {
  const conflicts = [];
  const slotMap = new Map(); // Map of (trigger, affectsSlot) -> rules

  anchors.forEach(rule => {
    const key = `${rule.trigger}:${rule.affectsSlot}`;
    if (slotMap.has(key)) {
      conflicts.push({
        slot: key,
        rules: [slotMap.get(key), rule]
      });
    } else {
      slotMap.set(key, rule);
    }
  });

  return conflicts;
}

/**
 * Get rules applicable to a specific beat/context
 * @param {Object} organizedRules - Rules organized by role
 * @param {number} bar - Current bar number (1-indexed)
 * @param {number} beat - Current beat number (1-indexed)
 * @param {string} currentChord - Current chord symbol
 * @param {string} previousChord - Previous chord symbol (null if first bar)
 * @returns {Object} Rules applicable to this context
 */
export function getRulesForContext(organizedRules, bar, beat, currentChord, previousChord) {
  const applicable = {
    constraints: [],
    anchors: [],
    preferences: [],
    embellishments: []
  };

  // Helper to check if trigger matches
  const matchesTrigger = (trigger) => {
    if (trigger === 'always') return true;
    if (trigger === 'beat1' && beat === 1) return true;
    if (trigger === 'beat3' && beat === 3) return true;
    if (trigger === 'chord change' && previousChord && currentChord !== previousChord) return true;
    return false;
  };

  // Filter each role
  Object.keys(organizedRules).forEach(role => {
    applicable[role] = organizedRules[role].filter(rule => matchesTrigger(rule.trigger));
  });

  return applicable;
}

