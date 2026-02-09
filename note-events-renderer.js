// ============================================================================
// Note Events Renderer
// Renders note events as visual bars below rule slot cells
// ============================================================================

function renderNoteEventsInGrid(result, gridContainer) {
  if (!result || !result.noteEvents || !gridContainer) return;

  const timeline = result.timeline;
  if (!timeline || !timeline.bars) return;

  // Find all rule slot cells and add note event containers
  const partRows = gridContainer.querySelectorAll('.grid-row:not(.grid-header):not(.add-part-row)');
  
  partRows.forEach((partRow, partIndex) => {
    if (partIndex >= result.noteEvents.length) return;
    
    const partData = result.noteEvents[partIndex];
    if (!partData || !partData.events) return;

    // Get rule slot cells for this part (skip the part name cell)
    const slotCells = partRow.querySelectorAll('.rule-slot-cell');
    
    slotCells.forEach((slotCell, barIndex) => {
      if (barIndex >= timeline.bars.length) return;
      
      const bar = timeline.bars[barIndex];
      const barStartBeat = bar.startBeat;
      const barEndBeat = barStartBeat + 3; // 4 beats per bar
      
      // Find events that overlap with this bar
      const barEvents = partData.events.filter(event => {
        const eventEndBeat = event.startBeat + event.duration - 1;
        return event.startBeat <= barEndBeat && eventEndBeat >= barStartBeat;
      });

      // Create container for note events
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'note-events-container';
      
      barEvents.forEach(event => {
        // Calculate position and width relative to bar
        const relativeStart = Math.max(0, event.startBeat - barStartBeat);
        const relativeEnd = Math.min(4, event.startBeat + event.duration - barStartBeat);
        const width = relativeEnd - relativeStart;
        
        // Create event bar
        const eventBar = document.createElement('div');
        eventBar.className = 'note-event-bar';
        eventBar.textContent = event.degree;
        eventBar.style.left = `${(relativeStart / 4) * 100}%`;
        eventBar.style.width = `${(width / 4) * 100}%`;
        
        eventsContainer.appendChild(eventBar);
      });
      
      // Append events container to slot cell
      slotCell.appendChild(eventsContainer);
    });
  });
}

function clearNoteEventsFromGrid(gridContainer) {
  if (!gridContainer) return;
  
  const containers = gridContainer.querySelectorAll('.note-events-container');
  containers.forEach(container => container.remove());
}

