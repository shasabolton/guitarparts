// ============================================================================
// UI Controller
// Stage 4: UI Skeleton
// ============================================================================

let currentProgression = null;
let currentParts = [];
let currentAppliedRules = [];
let currentResult = null;

// ============================================================================
// Initialization
// ============================================================================

function initUI() {
  setupProgressionSelector();
  setupPartManagement();
  setupRuleSlotGrid();
  setupRuleDialog();
  setupPartEditDialog();
  updateDisplay();
}

// ============================================================================
// Progression Selector
// ============================================================================

function setupProgressionSelector() {
  const selector = document.getElementById('progression-selector');
  if (!selector) return;

  // Populate progression options
  for (const [key, progression] of Object.entries(PROGRESSIONS)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${progression.id} (${progression.key})`;
    selector.appendChild(option);
  }

  // Set default
  if (Object.keys(PROGRESSIONS).length > 0) {
    selector.value = Object.keys(PROGRESSIONS)[0];
    currentProgression = PROGRESSIONS[selector.value];
    selector.dispatchEvent(new Event('change'));
  }

  selector.addEventListener('change', (e) => {
    currentProgression = PROGRESSIONS[e.target.value];
    currentAppliedRules = []; // Reset rules when progression changes
    updateDisplay();
  });
}

// ============================================================================
// Part Management
// ============================================================================

function setupPartManagement() {
  // Initialize with default parts
  if (currentParts.length === 0) {
    currentParts = [
      { id: 'bass', name: 'Bass', muted: false, defaultRegister: 'low' },
      { id: 'rhythm', name: 'Rhythm', muted: false, defaultRegister: 'mid' }
    ];
  }
}

function addNewPart() {
  const newPart = {
    id: `part-${Date.now()}`,
    name: `Part ${currentParts.length + 1}`,
    muted: false,
    defaultRegister: 'mid'
  };

  currentParts.push(newPart);
  updateDisplay();
}

function removePart(partId) {
  currentParts = currentParts.filter(p => p.id !== partId);
  // Remove rules for this part
  currentAppliedRules = currentAppliedRules.filter(r => r.partId !== partId);
  updateDisplay();
}

function togglePartMute(partId) {
  const part = currentParts.find(p => p.id === partId);
  if (part) {
    part.muted = !part.muted;
    updateDisplay();
  }
}

// ============================================================================
// Rule Slot Grid
// ============================================================================

function setupRuleSlotGrid() {
  // Grid will be dynamically generated in updateDisplay
}

function updateRuleSlotGrid() {
  const gridContainer = document.getElementById('rule-slot-grid');
  if (!gridContainer || !currentProgression) return;

  // Build timeline to get bars
  const timeline = buildTimeline(currentProgression);

  // Clear grid
  gridContainer.innerHTML = '';

  // Create header row with bar numbers
  const headerRow = document.createElement('div');
  headerRow.className = 'grid-row grid-header';
  
  const partHeader = document.createElement('div');
  partHeader.className = 'grid-cell grid-header-cell';
  partHeader.textContent = 'Parts / Bars';
  headerRow.appendChild(partHeader);

  for (let i = 0; i < timeline.bars.length; i++) {
    const barCell = document.createElement('div');
    barCell.className = 'grid-cell grid-header-cell';
    barCell.textContent = `Bar ${i + 1}\n${timeline.bars[i].chordDegree}`;
    headerRow.appendChild(barCell);
  }
  gridContainer.appendChild(headerRow);

  // Create row for each part
  for (const part of currentParts) {
    const partRow = document.createElement('div');
    partRow.className = 'grid-row';
    if (part.muted) partRow.classList.add('muted');

    // Part name cell
    const partNameCell = document.createElement('div');
    partNameCell.className = 'grid-cell part-name-cell';
    
    const partNameDiv = document.createElement('div');
    partNameDiv.className = 'part-name-display';
    partNameDiv.textContent = `${part.name} (${part.defaultRegister || 'mid'})`;
    partNameDiv.style.cursor = 'pointer';
    partNameDiv.onclick = () => openPartEditDialog(part.id);
    partNameCell.appendChild(partNameDiv);

    const partControls = document.createElement('div');
    partControls.className = 'part-controls';
    
    const muteBtn = document.createElement('button');
    muteBtn.innerHTML = part.muted ? '<span style="text-decoration: line-through; opacity: 0.5;">🔊</span>' : '🔊';
    muteBtn.className = 'icon-btn mute-btn';
    muteBtn.title = part.muted ? 'Unmute' : 'Mute';
    muteBtn.onclick = () => togglePartMute(part.id);
    partControls.appendChild(muteBtn);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'icon-btn';
    removeBtn.onclick = () => removePart(part.id);
    partControls.appendChild(removeBtn);

    partNameCell.appendChild(partControls);
    partRow.appendChild(partNameCell);

      // Rule slot cells for each bar
      for (let i = 0; i < timeline.bars.length; i++) {
        const slotCell = document.createElement('div');
        slotCell.className = 'grid-cell rule-slot-cell';
        
        // Find rule for this slot
        const bar = timeline.bars[i];
        const slot = { type: 'bar', index: i };
        const appliedRule = findAppliedRuleForSlot(slot, part.id);
        
        if (appliedRule) {
          const rule = RULES[appliedRule.ruleId];
          if (rule) {
            slotCell.textContent = rule.name;
            slotCell.classList.add('has-rule');
            if (appliedRule.registerOverride) {
              slotCell.textContent += ` (${appliedRule.registerOverride})`;
            }
          }
        } else {
          slotCell.textContent = '—';
          slotCell.classList.add('no-rule');
        }

        slotCell.onclick = () => openRuleDialog(slot, part.id);
        partRow.appendChild(slotCell);
      }

    gridContainer.appendChild(partRow);
  }

  // Add "+" button row at the bottom
  const addPartRow = document.createElement('div');
  addPartRow.className = 'grid-row add-part-row';
  
  const addPartCell = document.createElement('div');
  addPartCell.className = 'grid-cell add-part-cell';
  addPartCell.textContent = '+';
  addPartCell.onclick = addNewPart;
  addPartRow.appendChild(addPartCell);
  
  // Add empty cells to match bar columns
  for (let i = 0; i < timeline.bars.length; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'grid-cell';
    emptyCell.style.borderRight = '1px solid #3a3a3a';
    addPartRow.appendChild(emptyCell);
  }
  
  gridContainer.appendChild(addPartRow);
}

function findAppliedRuleForSlot(slot, partId) {
  // Find the most specific rule for this slot
  // Check for bar-specific rules first, then chord-specific, then global
  const partRules = currentAppliedRules.filter(r => r.partId === partId);
  
  // Check for bar-specific rule
  if (slot.type === 'bar' && slot.index !== undefined) {
    const barRule = partRules.find(r => 
      r.slot.type === 'bar' && r.slot.index === slot.index
    );
    if (barRule) return barRule;
  }
  
  // Check for chord-specific rule (if this bar belongs to a chord)
  if (currentProgression) {
    const timeline = buildTimeline(currentProgression);
    if (slot.type === 'bar' && slot.index !== undefined) {
      const bar = timeline.bars[slot.index];
      if (bar) {
        const chordRule = partRules.find(r => 
          r.slot.type === 'chord' && r.slot.index === bar.chordIndex
        );
        if (chordRule) return chordRule;
      }
    }
  }
  
  // Check for global rule
  const globalRule = partRules.find(r => r.slot.type === 'global');
  if (globalRule) return globalRule;
  
  return null;
}

// ============================================================================
// Rule Dialog
// ============================================================================

let currentDialogSlot = null;
let currentDialogPartId = null;

function setupRuleDialog() {
  const dialog = document.getElementById('rule-dialog');
  const closeBtn = document.getElementById('rule-dialog-close');
  const applyBtn = document.getElementById('rule-dialog-apply');
  const applyToAllBtn = document.getElementById('rule-dialog-apply-all');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (dialog) dialog.style.display = 'none';
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      applySelectedRule();
    });
  }

  if (applyToAllBtn) {
    applyToAllBtn.addEventListener('click', () => {
      applySelectedRule(true);
    });
  }

  // Close on outside click
  if (dialog) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.style.display = 'none';
      }
    });
  }

  setupRuleFilters();
}

function setupRuleFilters() {
  const genreFilter = document.getElementById('rule-filter-genre');
  const tagFilter = document.getElementById('rule-filter-tags');
  const ruleList = document.getElementById('rule-list');

  if (tagFilter) {
    tagFilter.addEventListener('input', () => {
      updateRuleList();
    });
  }

  updateRuleList();
}

function updateRuleList() {
  const ruleList = document.getElementById('rule-list');
  if (!ruleList) return;

  const tagFilter = document.getElementById('rule-filter-tags');
  const filterText = tagFilter ? tagFilter.value.toLowerCase() : '';

  ruleList.innerHTML = '';

  for (const [key, rule] of Object.entries(RULES)) {
    // Filter by tags
    if (filterText) {
      const matches = rule.tags.some(tag => tag.toLowerCase().includes(filterText));
      if (!matches) continue;
    }

    const ruleItem = document.createElement('div');
    ruleItem.className = 'rule-list-item';
    ruleItem.dataset.ruleId = key;

    const ruleName = document.createElement('div');
    ruleName.className = 'rule-name';
    ruleName.textContent = rule.name;
    ruleItem.appendChild(ruleName);

    const ruleDesc = document.createElement('div');
    ruleDesc.className = 'rule-description';
    ruleDesc.textContent = rule.description;
    ruleItem.appendChild(ruleDesc);

    const ruleTags = document.createElement('div');
    ruleTags.className = 'rule-tags';
    ruleTags.textContent = rule.tags.join(', ');
    ruleItem.appendChild(ruleTags);

    ruleItem.addEventListener('click', () => {
      // Highlight selected
      document.querySelectorAll('.rule-list-item').forEach(item => {
        item.classList.remove('selected');
      });
      ruleItem.classList.add('selected');
      
      // Show/hide parameters based on rule type
      const rule = RULES[key];
      const paramSection = document.getElementById('rule-parameters-section');
      if (paramSection && rule.category === 'walk') {
        paramSection.style.display = 'block';
        updateWalkParameters(rule);
      } else if (paramSection) {
        paramSection.style.display = 'none';
      }
    });

    ruleList.appendChild(ruleItem);
  }
}

function openRuleDialog(slot, partId) {
  const dialog = document.getElementById('rule-dialog');
  if (!dialog) return;

  currentDialogSlot = slot;
  currentDialogPartId = partId;

  // Reset register selector
  const registerSelect = document.getElementById('rule-register-select');
  if (registerSelect) {
    registerSelect.value = 'default';
  }

  // Update rule list
  updateRuleList();

  // Hide parameter section initially
  const paramSection = document.getElementById('rule-parameters-section');
  if (paramSection) {
    paramSection.style.display = 'none';
  }

  // Show dialog
  dialog.style.display = 'flex';
}

function applySelectedRule(applyToAll = false) {
  const ruleList = document.getElementById('rule-list');
  const selectedItem = ruleList ? ruleList.querySelector('.rule-list-item.selected') : null;
  if (!selectedItem) {
    alert('Please select a rule');
    return;
  }

  const ruleId = selectedItem.dataset.ruleId;
  const rule = RULES[ruleId];
  const registerSelect = document.getElementById('rule-register-select');
  const registerValue = registerSelect ? registerSelect.value : 'default';

  const registerOverride = registerValue !== 'default' ? registerValue : undefined;

  // Collect walk parameters if it's a walk rule
  let parameters = undefined;
  if (rule && rule.category === 'walk') {
    parameters = collectWalkParameters(rule);
  }

  if (applyToAll) {
    // Apply globally
    const newRule = {
      ruleId: ruleId,
      slot: { type: 'global' },
      registerOverride: registerOverride,
      parameters: parameters,
      partId: currentDialogPartId
    };

    // Remove existing global rule for this part
    currentAppliedRules = currentAppliedRules.filter(r => 
      !(r.partId === currentDialogPartId && r.slot.type === 'global')
    );

    currentAppliedRules.push(newRule);
  } else {
    // Apply to specific slot
    const newRule = {
      ruleId: ruleId,
      slot: currentDialogSlot,
      registerOverride: registerOverride,
      parameters: parameters,
      partId: currentDialogPartId
    };

    // Remove existing rule for this slot and part
    currentAppliedRules = currentAppliedRules.filter(r => 
      !(r.partId === currentDialogPartId && 
        r.slot.type === currentDialogSlot.type &&
        (currentDialogSlot.index === undefined || r.slot.index === currentDialogSlot.index))
    );

    currentAppliedRules.push(newRule);
  }

  // Close dialog
  const dialog = document.getElementById('rule-dialog');
  if (dialog) dialog.style.display = 'none';

  updateDisplay();
}

function updateWalkParameters(rule) {
  if (!rule.parameters) return;
  
  const container = document.getElementById('walk-parameters-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  for (const [key, param] of Object.entries(rule.parameters)) {
    const paramDiv = document.createElement('div');
    paramDiv.className = 'walk-parameter';
    
    const label = document.createElement('label');
    label.textContent = param.description || key;
    label.setAttribute('for', `walk-param-${key}`);
    paramDiv.appendChild(label);
    
    let input;
    if (param.type === 'enum') {
      input = document.createElement('select');
      input.id = `walk-param-${key}`;
      for (const value of param.values) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        if (value === param.default) option.selected = true;
        input.appendChild(option);
      }
    } else if (param.type === 'integer') {
      input = document.createElement('input');
      input.type = 'number';
      input.id = `walk-param-${key}`;
      input.min = param.min;
      input.max = param.max;
      input.value = param.default;
    }
    
    if (input) {
      paramDiv.appendChild(input);
      container.appendChild(paramDiv);
    }
  }
}

function collectWalkParameters(rule) {
  if (!rule.parameters) return {};
  
  const parameters = {};
  for (const key of Object.keys(rule.parameters)) {
    const input = document.getElementById(`walk-param-${key}`);
    if (input) {
      if (input.type === 'number') {
        parameters[key] = parseInt(input.value, 10);
      } else {
        parameters[key] = input.value;
      }
    }
  }
  return parameters;
}

// ============================================================================
// Display Update
// ============================================================================

function updateDisplay() {
  updateRuleSlotGrid();
  updateOutputDisplay();
}

function updateOutputDisplay() {
  const outputContainer = document.getElementById('output-display');
  if (!outputContainer || !currentProgression || currentParts.length === 0) {
    if (outputContainer) outputContainer.textContent = 'Configure progression and parts to see output.';
    return;
  }

  // Execute pipeline
  const result = executePipeline(currentProgression, currentParts, currentAppliedRules);
  currentResult = result;

  // Format and display text output
  const textOutput = formatNoteEventsAsText(result);
  outputContainer.textContent = textOutput;

  // Render note events in grid
  const gridContainer = document.getElementById('rule-slot-grid');
  if (gridContainer) {
    clearNoteEventsFromGrid(gridContainer);
    renderNoteEventsInGrid(result, gridContainer);
  }
}

// ============================================================================
// Part Edit Dialog
// ============================================================================

function setupPartEditDialog() {
  const dialog = document.getElementById('part-edit-dialog');
  const closeBtn = document.getElementById('part-edit-dialog-close');
  const saveBtn = document.getElementById('part-edit-save');

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dialog) dialog.style.display = 'none';
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      savePartEdit();
    });
  }

  // Close on outside click
  if (dialog) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.style.display = 'none';
      }
    });
  }

  // Prevent clicks inside dialog-content from closing the dialog
  const dialogContent = dialog ? dialog.querySelector('.dialog-content') : null;
  if (dialogContent) {
    dialogContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

let currentEditPartId = null;

function openPartEditDialog(partId) {
  const dialog = document.getElementById('part-edit-dialog');
  if (!dialog) return;

  const part = currentParts.find(p => p.id === partId);
  if (!part) return;

  currentEditPartId = partId;

  const nameInput = document.getElementById('part-edit-name');
  const registerSelect = document.getElementById('part-edit-register');

  if (nameInput) nameInput.value = part.name;
  if (registerSelect) registerSelect.value = part.defaultRegister || 'mid';

  dialog.style.display = 'flex';
}

function savePartEdit() {
  if (!currentEditPartId) return;

  const part = currentParts.find(p => p.id === currentEditPartId);
  if (!part) return;

  const nameInput = document.getElementById('part-edit-name');
  const registerSelect = document.getElementById('part-edit-register');

  if (nameInput) {
    const newName = nameInput.value.trim();
    if (newName) {
      part.name = newName;
    }
  }

  if (registerSelect) {
    part.defaultRegister = registerSelect.value;
  }

  const dialog = document.getElementById('part-edit-dialog');
  if (dialog) dialog.style.display = 'none';

  updateDisplay();
}

// ============================================================================
// Export for global access
// ============================================================================

if (typeof window !== 'undefined') {
  window.initUI = initUI;
  window.updateDisplay = updateDisplay;
}

