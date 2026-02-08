// Main application logic
// Loads static data and generates bass/lead lines

import { progressions } from './data/progressions.js';
import { scales } from './data/scales.js';
import { rules } from './data/rules.js';
import { licks } from './data/licks.js';
import { generateBassLine } from './engine/BassGenerator.js';

// Application state
let appState = {
  genre: '',
  level: '',
  progressionId: '',
  rootString: '',
  randomness: 50
};

// Initialize the app
function init() {
  console.log('=== Guitar Looping & Improv Learning App ===');
  console.log('Stage 2: Bass Engine with Text Output');
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

  console.log('App initialized. Select options and generate a line.');
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

// Setup event listeners
function setupEventListeners() {
  // Genre selection
  document.getElementById('genre').addEventListener('change', (e) => {
    appState.genre = e.target.value;
    populateProgressions();
    logState();
  });

  // Progression selection
  document.getElementById('progression').addEventListener('change', (e) => {
    appState.progressionId = e.target.value;
    logState();
  });

  // Level selection
  document.getElementById('level').addEventListener('change', (e) => {
    appState.level = e.target.value;
    logState();
  });

  // Root string selection
  document.getElementById('rootString').addEventListener('change', (e) => {
    appState.rootString = parseInt(e.target.value) || '';
    logState();
  });

  // Randomness slider
  const randomnessSlider = document.getElementById('randomness');
  const randomnessValue = document.getElementById('randomnessValue');
  
  randomnessSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    appState.randomness = value;
    randomnessValue.textContent = value;
    logState();
  });

  // Generate buttons
  document.getElementById('generateBass').addEventListener('click', () => {
    handleGenerateBassLine();
  });

  document.getElementById('generateLead').addEventListener('click', () => {
    generateLeadLine();
  });
}

// Log current state to console
function logState() {
  console.log('Current selection:', appState);
}

// Generate bass line (Stage 2 implementation)
function handleGenerateBassLine() {
  console.log('\n=== Generating Bass Line ===');
  
  if (!validateSelection()) {
    return;
  }

  const selection = {
    genre: appState.genre,
    level: parseInt(appState.level),
    progressionId: appState.progressionId,
    rootString: appState.rootString,
    randomness: appState.randomness,
    part: 'bass' // Required for rule filtering
  };

  console.log('User Selection:', selection);

  // Find selected progression
  const progression = progressions.find(p => p.id === selection.progressionId);
  if (!progression) {
    console.error('Progression not found');
    return;
  }

  console.log('Selected Progression:', progression);
  console.log('Bars:', progression.bars);

  // Generate bass line using BassGenerator
  const { noteEvents, appliedRules } = generateBassLine(selection, progression, rules);

  console.log(`\nGenerated ${noteEvents.length} note events:`);
  
  // Format output as text (Stage 2 requirement)
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

// Generate lead line (placeholder for Stage 1)
function generateLeadLine() {
  console.log('\n=== Generating Lead Line ===');
  
  if (!validateSelection()) {
    return;
  }

  const selection = {
    genre: appState.genre,
    level: parseInt(appState.level),
    progressionId: appState.progressionId,
    rootString: appState.rootString,
    randomness: appState.randomness
  };

  console.log('User Selection:', selection);

  // Find selected progression
  const progression = progressions.find(p => p.id === selection.progressionId);
  if (!progression) {
    console.error('Progression not found');
    return;
  }

  console.log('Selected Progression:', progression);

  // Filter applicable rules
  const applicableRules = rules.filter(rule => {
    return rule.part === 'lead' &&
           rule.genreTags.includes(selection.genre) &&
           selection.level >= rule.minLevel &&
           selection.level <= rule.maxLevel;
  });

  console.log(`Found ${applicableRules.length} applicable lead rules:`);
  applicableRules.forEach(rule => {
    console.log(`  - ${rule.id} (${rule.role}): ${rule.action}`);
  });

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

  // Stage 1: Just log what would be generated
  console.log('\n[Stage 1: Generation logic will be implemented in Stage 5]');
  console.log('Would select and transform licks based on rules above.');

  updateOutputArea('Lead line generation triggered. Check console for details.');
}

// Validate that all required fields are selected
function validateSelection() {
  if (!appState.genre) {
    console.error('Please select a genre');
    updateOutputArea('Error: Please select a genre');
    return false;
  }
  if (!appState.level) {
    console.error('Please select a level');
    updateOutputArea('Error: Please select a level');
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

