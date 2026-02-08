# Guitar Looping & Improv Learning App

A client-side web app for generating bass lines and lead licks for guitar practice and improvisation learning.

## Stage 2: Bass Engine Implementation

This implementation includes:
- Basic HTML UI with all control elements
- Static data loading (progressions, scales, rules, licks)
- **RuleEngine**: Filters and resolves rules by priority
- **BassGenerator**: Generates bass note events per bar
- Text-based output showing generated notes

## Getting Started

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, etc.)
2. Open the browser's developer console (F12) to see detailed output
3. Select your options:
   - **Genre**: Blues or Pop
   - **Complexity Level**: Level 1 or Level 2
   - **Chord Progression**: Select from available progressions
   - **Root String**: 6th, 5th, or 4th string
   - **Randomness**: Adjust the slider (0-100)
4. Click "Generate Bass Line" or "Generate Lead Line"
5. Check the console for detailed information about what would be generated

## Current Features

- ✅ UI with all control elements
- ✅ Static data modules loaded
- ✅ Genre-based progression filtering
- ✅ RuleEngine: Filters applicable rules and resolves conflicts
- ✅ BassGenerator: Generates bass note events using rule-based logic
- ✅ Text output: Displays generated notes as "Bar X Beat Y: degree"
- ✅ Rule priority system: Constraints → Anchors → Preferences → Embellishments
- ✅ Console logging of applied rules and generation process
- ✅ Basic validation of user selections

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

- This is a client-side only application (no server required)
- Uses ES6 modules (requires a web server or opening via file:// may have CORS issues)
- For best results, serve via a local web server (e.g., `python -m http.server` or VS Code Live Server)

