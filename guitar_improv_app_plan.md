# Guitar Looping & Improv Learning App — Implementation Plan

## 1. App Overview

A client-side web app that generates **bass lines and lead licks** for guitar practice and improvisation learning.

Users:
- Select a **genre** (initially Blues, Pop)
- Select a **complexity level** (Level 1, Level 2)
- Select a **chord progression**
- Choose **root string** (6th / 5th / 4th)
- Control **randomness / variation**

The app:
- Generates musical parts using **rule-based logic**
- Represents notes as **scale degrees + octave**
- Renders output initially as **text-based note events**
- Plays audio via **MIDI / Web Audio**
- Later maps notes to a **fretboard visualization**

This plan focuses on a **clean, extensible music engine**, not UI polish.

---

## 2. Architectural Principles

- **Client-side only** (Vanilla JS, HTML, CSS)
- **No frameworks**
- **Rules are behavior**
- **Musical data is declarative**
- **Explainability is built-in**
- **Degree-first, not note-name-first**

---

## 3. Core Data Structures

### 3.1 Musical Facts (Static Data)

#### ChordProgression
```js
{
  id: string,
  genreTags: string[],
  bars: string[], // e.g. ["I7","IV7","V7"]
  description: string
}
```

#### Scale
```js
{
  id: string,
  degrees: string[] // ["1","b3","4","5","b7"]
}
```

---

### 3.2 Rules (Behavior)

#### Rule
```js
{
  id: string,
  part: "bass" | "lead",
  genreTags: string[],
  minLevel: number,
  maxLevel: number,
  role: "constraint" | "anchor" | "preference" | "embellishment",
  affectsSlot: "rhythm" | "targetTone" | "motion" | "position" | "lickSelection",
  trigger: string,
  action: string,
  weight?: number
}
```

Rules are:
- Atomic
- Single-slot
- Declarative

---

### 3.3 Lead Licks (Musical Ideas)

#### Lick
```js
{
  id: string,
  genreTags: string[],
  level: number,
  notes: LickNote[],
  explanation: string
}
```

#### LickNote
```js
{
  degree: string,
  octaveOffset: number,
  duration: number,
  articulation?: string,
  preferredStrings?: number[]
}
```

---

### 3.4 Runtime Context

#### UserSelection
```js
{
  genre: string,
  level: number,
  progressionId: string,
  rootString: 6 | 5 | 4,
  randomness: number
}
```

#### PositionContext
```js
{
  rootString: number,
  rootFret: number,
  maxSpan: number,
  allowShifts: boolean
}
```

---

### 3.5 Generated Output

#### NoteEvent (text-stage output)
```js
{
  bar: number,
  beat: number,
  degree: string,
  octaveOffset: number,
  duration: number,
  explanation?: string
}
```

#### RenderedNote (future fretboard stage)
```js
{
  degree: string,
  string: number,
  fret: number,
  time: number,
  duration: number
}
```

---

## 4. Core Classes / Modules

### 4.1 Data Modules
- `progressions.js`
- `scales.js`
- `rules.js`
- `licks.js`

Pure data exports only.

---

### 4.2 Engine Modules

#### RuleEngine
Responsibilities:
- Filter applicable rules
- Resolve conflicts
- Apply rule priority order

Key functions:
```js
getActiveRules(selection)
resolveConflicts(rules, context)
```

---

#### BassGenerator
Responsibilities:
- Generate bass note events per bar
- Apply anchor → preference → embellishment logic

Key functions:
```js
generateBassLine(selection)
```

---

#### LeadGenerator
Responsibilities:
- Select compatible licks
- Apply transformations
- Emit note events

Key functions:
```js
generateLeadLine(selection)
```

---

#### ExplanationBuilder
Responsibilities:
- Collect applied rules
- Generate human-readable summaries

Key functions:
```js
buildExplanation(appliedRules, progression)
```

---

### 4.3 Audio (Optional Early Stage)

#### MidiPlayer
Responsibilities:
- Convert degree → pitch
- Play note events

Implementation:
- Web MIDI API or SoundFont via Web Audio

---

## 5. Generator Flow (Bass Example)

```text
UserSelection
   ↓
Select Chord Progression
   ↓
Filter Rules (genre, level, part)
   ↓
For each bar:
   - Apply constraints
   - Apply anchors
   - Choose preferences (weighted)
   - Add embellishments if allowed
   ↓
Emit NoteEvents
   ↓
Attach explanations
```

---

## 6. Conflict Resolution Strategy

Priority order:
1. Constraints
2. Anchors
3. Preferences
4. Embellishments

Rules conflict only if:
- Same beat
- Same decision slot
- Incompatible outcomes

Anchor–anchor conflicts are treated as data errors.

---

## 7. Implementation Stages (Recommended Order)

### Stage 1 — Skeleton
- Basic HTML UI
- Static data loading
- Console-based output

### Stage 2 — Bass Engine (Text Output)
- Implement RuleEngine
- Implement BassGenerator
- Output note events as text:
  ```
  Bar 1 Beat 1: 1
  Bar 1 Beat 2: b7
  ```

### Stage 3 — Explanations
- Track applied rules
- Render explanation text block

### Stage 4 — MIDI Playback
- Convert degree → MIDI note
- Play generated bass line

### Stage 5 — Lead Licks
- Implement Lick selection
- Render lead note events as text

### Stage 6 — Position Mapping
- Introduce PositionContext
- Map notes to string/fret (no graphics yet)

### Stage 7 — Fretboard Visualization
- Canvas or SVG fretboard
- Animate notes in real time

---

## 8. What Cursor AI Should Help With

Ask Cursor to:
- Author new **rules**
- Author **lick libraries**
- Add new **genres**
- Validate rule conflicts
- Write explanation text

Avoid using Cursor to:
- Generate notes at runtime
- Decide phrasing dynamically

---

## 9. Expansion Example (New Genre)

When adding a genre (e.g. Doo-Wop), ask Cursor to:
1. Add common chord progressions
2. Add genre-specific bass rules
3. Add beginner lead licks
4. Tag everything correctly
5. Do not modify engine logic

---

## 10. Guiding Mantras

- Rules are atoms
- Licks are ideas
- Degrees come before notes
- Fingers come last
- If it can’t be explained, it shouldn’t be generated

---

**End of Plan**
