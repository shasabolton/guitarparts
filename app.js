// Main application logic
// Loads static data and generates bass/lead lines with rule toggling

import { progressions } from './data/progressions.js';
import { scales } from './data/scales.js';
import { rules } from './data/rules.js';
import { licks } from './data/licks.js';
import { generateBassLine } from './engine/BassGenerator.js';

// Application state
let appState = {
  genre: '',
  progressionId: '',
  rootString: '',
  randomness: 50,
  enabledRules: {
    chords: new Set(),
    bass: new Set(),
    lead: new Set()
  }
};

// Initialize the app
function init() {
  console.log('=== Guitar Looping & Improv Learning App ===');
  console.log('Rule-based generation with manual rule toggling');
  console.log('');

  // Log loaded data
  console.log('Loaded data:');
  console.log(`- Progressions: ${progressions.length}`);
  console.log(`- Scales: ${scales.length}`);
  console.log(`- Rules: ${rules.length}`);
  console.log(`- Licks: ${licks.length}`);
  console.log('');

  // Populate UI
  populateGenres();
  populateProgressions();
  setupEventListeners();

  console.log('App initialized. Select genre and levels to see rules.');
}

// Extract unique genres from progressions
function getAvailableGenres() {
  const genreSet = new Set();
  progressions.forEach(prog => {
    prog.genreTags.forEach(tag => genreSet.add(tag));
  });
  return Array.from(genreSet).sort();
}

// Populate genre dropdown
function populateGenres() {
  const genreSelect = document.getElementById('genre');
  const genres = getAvailableGenres();
  
  genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
    genreSelect.appendChild(option);
  });
}

// Populate progression dropdown based on selected genre
function populateProgressions() {
  const progressionSelect = document.getElementById('progression');
  const genre = appState.genre;
  
  // Clear existing options except the first one
  while (progressionSelect.children.length > 1) {
    progressionSelect.removeChild(progressionSelect.lastChild);
  }

  // Filter progressions by genre
  const filteredProgressions = genre 
    ? progressions.filter(p => p.genreTags.includes(genre))
    : progressions;

  filteredProgressions.forEach(prog => {
    const option = document.createElement('option');
    option.value = prog.id;
    option.textContent = `${prog.id} - ${prog.description}`;
    progressionSelect.appendChild(option);
  });
}

// Get rules for a specific part, genre, and level
function getRulesForPart(part, genre, level) {
  if (!genre || !level) return [];
  
  const levelNum = parseInt(level);
  return rules.filter(rule => {
    return rule.part === part &&
           rule.genreTags.includes(genre) &&
           levelNum >= rule.minLevel &&
           (rule.maxLevel === Infinity || levelNum <= rule.maxLevel);
  });
}

// Populate rules list for a part
function populateRulesList(part) {
  const genre = appState.genre;
  const levelSelect = document.getElementById(`${part}Level`);
  const level = levelSelect ? levelSelect.value : '';
  const rulesContainer = document.getElementById(`${part}Rules`);
  const selectAllCheckbox = document.getElementById(`${part}SelectAll`);

  if (!rulesContainer) return;

  // Clear existing rules
  rulesContainer.innerHTML = '';

  if (!genre || !level) {
    rulesContainer.innerHTML = '<p class="no-rules">Select genre and level to see rules</p>';
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    return;
  }

  const applicableRules = getRulesForPart(part, genre, level);

  if (applicableRules.length === 0) {
    rulesContainer.innerHTML = '<p class="no-rules">No rules available for this combination</p>';
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    return;
  }

  // Create rule items
  applicableRules.forEach(rule => {
    const ruleItem = document.createElement('div');
    ruleItem.className = 'rule-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `rule-${rule.id}`;
    checkbox.checked = appState.enabledRules[part].has(rule.id);
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        appState.enabledRules[part].add(rule.id);
      } else {
        appState.enabledRules[part].delete(rule.id);
      }
      updateSelectAllState(part);
    });

    const ruleInfo = document.createElement('div');
    ruleInfo.className = 'rule-info';
    
    const ruleId = document.createElement('div');
    ruleId.className = 'rule-id';
    ruleId.textContent = rule.id;

    const ruleDetails = document.createElement('div');
    ruleDetails.className = 'rule-details';
    
    const roleBadge = document.createElement('span');
    roleBadge.className = `rule-role ${rule.role}`;
    roleBadge.textContent = rule.role;
    
    const actionText = document.createTextNode(` ${rule.action} | ${rule.trigger} | ${rule.affectsSlot}`);
    
    ruleDetails.appendChild(roleBadge);
    ruleDetails.appendChild(actionText);
    
    ruleInfo.appendChild(ruleId);
    ruleInfo.appendChild(ruleDetails);
    
    ruleItem.appendChild(checkbox);
    ruleItem.appendChild(ruleInfo);
    rulesContainer.appendChild(ruleItem);
  });

  // Update select all state
  updateSelectAllState(part);
}

// Update select all checkbox state
function updateSelectAllState(part) {
  const selectAllCheckbox = document.getElementById(`${part}SelectAll`);
  if (!selectAllCheckbox) return;

  const genre = appState.genre;
  const levelSelect = document.getElementById(`${part}Level`);
  const level = levelSelect ? levelSelect.value : '';
  
  if (!genre || !level) {
    selectAllCheckbox.checked = false;
    return;
  }

  const applicableRules = getRulesForPart(part, genre, level);
  const enabledCount = applicableRules.filter(r => appState.enabledRules[part].has(r.id)).length;
  
  selectAllCheckbox.checked = enabledCount === applicableRules.length && applicableRules.length > 0;
  selectAllCheckbox.indeterminate = enabledCount > 0 && enabledCount < applicableRules.length;
}

// Handle select all checkbox
function setupSelectAll(part) {
  const selectAllCheckbox = document.getElementById(`${part}SelectAll`);
  if (!selectAllCheckbox) return;

  selectAllCheckbox.addEventListener('change', (e) => {
    const genre = appState.genre;
    const levelSelect = document.getElementById(`${part}Level`);
    const level = levelSelect ? levelSelect.value : '';
    
    if (!genre || !level) return;

    const applicableRules = getRulesForPart(part, genre, level);
    
    if (e.target.checked) {
      // Enable all
      applicableRules.forEach(rule => {
        appState.enabledRules[part].add(rule.id);
        const checkbox = document.getElementById(`rule-${rule.id}`);
        if (checkbox) checkbox.checked = true;
      });
    } else {
      // Disable all
      applicableRules.forEach(rule => {
        appState.enabledRules[part].delete(rule.id);
        const checkbox = document.getElementById(`rule-${rule.id}`);
        if (checkbox) checkbox.checked = false;
      });
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Genre selection
  document.getElementById('genre').addEventListener('change', (e) => {
    appState.genre = e.target.value;
    populateProgressions();
    // Refresh all rule lists
    ['chords', 'bass', 'lead'].forEach(part => populateRulesList(part));
  });

  // Progression selection
  document.getElementById('progression').addEventListener('change', (e) => {
    appState.progressionId = e.target.value;
  });

  // Root string selection
  document.getElementById('rootString').addEventListener('change', (e) => {
    appState.rootString = parseInt(e.target.value) || '';
  });

  // Randomness slider
  const randomnessSlider = document.getElementById('randomness');
  const randomnessValue = document.getElementById('randomnessValue');
  
  randomnessSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    appState.randomness = value;
    randomnessValue.textContent = value;
  });

  // Level selectors for each part
  ['chords', 'bass', 'lead'].forEach(part => {
    const levelSelect = document.getElementById(`${part}Level`);
    if (levelSelect) {
      levelSelect.addEventListener('change', () => {
        populateRulesList(part);
      });
    }
    setupSelectAll(part);
  });

  // Generate buttons
  document.getElementById('generateBass').addEventListener('click', () => {
    handleGenerateBassLine();
  });

  document.getElementById('generateLead').addEventListener('click', () => {
    handleGenerateLeadLine();
  });
}

// Get enabled rules for a part
function getEnabledRules(part) {
  return rules.filter(rule => 
    rule.part === part && appState.enabledRules[part].has(rule.id)
  );
}

// Generate bass line
function handleGenerateBassLine() {
  console.log('\n=== Generating Bass Line ===');
  
  if (!validateSelection('bass')) {
    return;
  }

  const levelSelect = document.getElementById('bassLevel');
  const level = parseInt(levelSelect.value);

  const selection = {
    genre: appState.genre,
    level: level,
    progressionId: appState.progressionId,
    rootString: appState.rootString,
    randomness: appState.randomness,
    part: 'bass'
  };

  console.log('User Selection:', selection);

  // Find selected progression
  const progression = progressions.find(p => p.id === selection.progressionId);
  if (!progression) {
    console.error('Progression not found');
    updateOutputArea('Error: Progression not found');
    return;
  }

  console.log('Selected Progression:', progression);
  console.log('Bars:', progression.bars);

  // Get enabled rules for bass
  const enabledRules = getEnabledRules('bass');
  console.log(`Using ${enabledRules.length} enabled bass rules:`);
  enabledRules.forEach(rule => {
    console.log(`  - ${rule.id} (${rule.role}): ${rule.action}`);
  });

  if (enabledRules.length === 0) {
    console.warn('No rules enabled for bass generation');
    updateOutputArea('Error: No bass rules enabled. Please enable at least one rule.');
    return;
  }

  // Generate bass line using BassGenerator
  const { noteEvents, appliedRules } = generateBassLine(selection, progression, enabledRules);

  console.log(`\nGenerated ${noteEvents.length} note events:`);
  
  // Format output as text
  let outputText = '';
  noteEvents.forEach(event => {
    const line = `Bar ${event.bar} Beat ${event.beat}: ${event.degree}`;
    console.log(line);
    outputText += line + '\n';
  });

  // Display in UI
  updateOutputArea(outputText || 'No notes generated.');

  // Log applied rules summary
  if (appliedRules.length > 0) {
    console.log('\nApplied rules:');
    appliedRules.forEach(({ bar, beat, rules: ruleList }) => {
      console.log(`  Bar ${bar} Beat ${beat}:`);
      ruleList.forEach(rule => {
        console.log(`    - ${rule.id} (${rule.role})`);
      });
    });
  }
}

// Generate lead line
function handleGenerateLeadLine() {
  console.log('\n=== Generating Lead Line ===');
  
  if (!validateSelection('lead')) {
    return;
  }

  const levelSelect = document.getElementById('leadLevel');
  const level = parseInt(levelSelect.value);

  const selection = {
    genre: appState.genre,
    level: level,
    progressionId: appState.progressionId,
    rootString: appState.rootString,
    randomness: appState.randomness,
    part: 'lead'
  };

  console.log('User Selection:', selection);

  // Find selected progression
  const progression = progressions.find(p => p.id === selection.progressionId);
  if (!progression) {
    console.error('Progression not found');
    updateOutputArea('Error: Progression not found');
    return;
  }

  console.log('Selected Progression:', progression);

  // Get enabled rules for lead
  const enabledRules = getEnabledRules('lead');
  console.log(`Using ${enabledRules.length} enabled lead rules:`);
  enabledRules.forEach(rule => {
    console.log(`  - ${rule.id} (${rule.role}): ${rule.action}`);
  });

  if (enabledRules.length === 0) {
    console.warn('No rules enabled for lead generation');
    updateOutputArea('Error: No lead rules enabled. Please enable at least one rule.');
    return;
  }

  // Filter applicable licks
  const applicableLicks = licks.filter(lick => {
    return lick.genreTags.includes(selection.genre) &&
           lick.level === selection.level;
  });

  console.log(`Found ${applicableLicks.length} applicable licks:`);
  applicableLicks.forEach(lick => {
    console.log(`  - ${lick.id}: ${lick.explanation}`);
    console.log(`    Notes: ${lick.notes.map(n => n.degree).join(', ')}`);
  });

  // Stage 5 placeholder: Lead generation will be implemented later
  console.log('\n[Lead generation logic will be implemented in Stage 5]');
  console.log('Would select and transform licks based on enabled rules above.');

  updateOutputArea('Lead line generation triggered. Check console for details.\n\nLead generation will be implemented in Stage 5.');
}

// Validate selection for a specific part
function validateSelection(part) {
  if (!appState.genre) {
    console.error('Please select a genre');
    updateOutputArea('Error: Please select a genre');
    return false;
  }

  const levelSelect = document.getElementById(`${part}Level`);
  if (!levelSelect || !levelSelect.value) {
    console.error(`Please select a level for ${part}`);
    updateOutputArea(`Error: Please select a level for ${part}`);
    return false;
  }

  if (!appState.progressionId) {
    console.error('Please select a chord progression');
    updateOutputArea('Error: Please select a chord progression');
    return false;
  }

  if (!appState.rootString) {
    console.error('Please select a root string');
    updateOutputArea('Error: Please select a root string');
    return false;
  }

  return true;
}

// Update the output area in the UI
function updateOutputArea(message) {
  const outputArea = document.getElementById('outputArea');
  outputArea.textContent = message + '\n\nCheck the browser console (F12) for detailed output.';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
