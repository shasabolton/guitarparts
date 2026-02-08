# Guitar Looping & Improv Learning App

A client-side web app for generating bass lines and lead licks for guitar practice and improvisation learning.

## Rule-Based Generation with Manual Rule Control

This implementation includes:
- Separate UI sections for Chords, Bass, and Lead
- Individual level selectors for each part
- Manual rule toggling - enable/disable specific rules
- "Select All" functionality for each part
- **RuleEngine**: Filters and resolves rules by priority
- **BassGenerator**: Generates bass note events per bar
- Text-based output showing generated notes
- Rules use `Infinity` for maxLevel to apply to all levels

## Getting Started

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, etc.)
2. Open the browser's developer console (F12) to see detailed output
3. Select global options:
   - **Genre**: Blues or Pop
   - **Chord Progression**: Select from available progressions
   - **Root String**: 6th, 5th, or 4th string
   - **Randomness**: Adjust the slider (0-100)
4. For each part (Chords, Bass, Lead):
   - Select a **Level** (Level 1 or Level 2)
   - Rules will appear based on genre and level
   - Toggle rules on/off individually or use "Select All"
5. Click "Generate Bass Line" or "Generate Lead Line"
6. Check the console for detailed information about generation

## Current Features

- ✅ Separate UI sections for Chords, Bass, and Lead
- ✅ Individual level selectors for each part
- ✅ Dynamic rule lists filtered by genre, part, and level
- ✅ Manual rule toggling - enable/disable specific rules
- ✅ "Select All" checkbox for each part
- ✅ Rules with `Infinity` maxLevel apply to all levels
- ✅ Static data modules loaded
- ✅ Genre-based progression filtering
- ✅ RuleEngine: Filters applicable rules and resolves conflicts
- ✅ BassGenerator: Generates bass note events using only enabled rules
- ✅ Text output: Displays generated notes as "Bar X Beat Y: degree"
- ✅ Rule priority system: Constraints → Anchors → Preferences → Embellishments
- ✅ Console logging of applied rules and generation process
- ✅ Validation ensures rules are enabled before generation

## Next Steps (Future Stages)

- **Stage 3**: Add explanation text generation
- **Stage 4**: Add MIDI playback
- **Stage 5**: Implement LeadGenerator with lick selection
- **Stage 6**: Position mapping to string/fret
- **Stage 7**: Fretboard visualization

## Project Structure

```
guitarparts/
├── index.html          # Main HTML file
├── style.css           # Styling
├── app.js              # Main application logic
├── data/
│   ├── progressions.js # Chord progression data
│   ├── scales.js      # Scale definitions
│   ├── rules.js       # Rule definitions
│   └── licks.js       # Lead lick patterns
├── engine/
│   ├── RuleEngine.js  # Rule filtering and conflict resolution
│   └── BassGenerator.js # Bass line generation logic
└── README.md          # This file
```

## Notes

- This is a client-side only application (no backend server required)
- Works with regular script tags (no ES6 modules) - can be opened directly via file:// protocol
- Also works on GitHub Pages, local web servers, or any static file hosting

