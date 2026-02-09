# Parametric Riff Timeline – Project Plan

## 1. Project Goal

Build a **deterministic guitar learning web app** that demonstrates *musical rules* applied over a chord progression using **parametric riffs placed on a timeline**.

The app is **not generative or random**.  
Every sound the user hears is the direct, predictable result of an explicitly selected rule.

The system teaches:
- how riffs relate to harmony
- how the same idea works in different registers
- how musical structure (bars, chords, transitions) drives note choice

Initial output is **text-based note events**.  
Fretboard visualization and MIDI playback come later.

---

## 2. Core Design Principles

- Deterministic (no randomness)
- Parametric (no absolute notes)
- Time-based (events anchored to beats/bars)
- Rule-driven (rules schedule riffs)
- Register-aware (low / mid / high per rule slot)
- Instrument-agnostic (parts are just lanes)

---

## 3. High-Level Architecture

```
Chord Progression
      ↓
Timeline (bars & chord boundaries)
      ↓
Parts (user-defined lanes)
      ↓
Rule Slots (per bar / chord)
      ↓
Rules → Riffs
      ↓
Parametric Note Events
      ↓
Resolved Note Events (text output)
```

---

## 4. Core Data Structures

### 4.1 Chord Progression

```ts
Chord = {
  degree: string,      // "I", "IV", "V"
  bars: number         // duration
}

Progression = {
  key: string,
  chords: Chord[]
}
```

---

### 4.2 Part (Lane)

```ts
Part = {
  id: string,
  name: string,
  muted: boolean,
  defaultRegister?: "low" | "mid" | "high"
}
```

Parts contain no musical logic.

---

### 4.3 Rule Slot

Represents a structural location.

```ts
RuleSlot =
  | { type: "global" }
  | { type: "bar", index: number }
  | { type: "chord", index: number }
  | { type: "transition", from: number, to: number }
  | { type: "lastChord" }
```

---

### 4.4 Rule Application

```ts
AppliedRule = {
  ruleId: string,
  slot: RuleSlot,
  registerOverride?: "low" | "mid" | "high"
}
```

---

### 4.5 Rule

Rules schedule riffs.  
They do **not** emit notes directly.

```ts
Rule = {
  id: string,
  name: string,
  description: string,
  riffId: string,
  tags: string[],
  defaultRegister?: "low" | "mid" | "high"
}
```

---

### 4.6 Riff (Parametric)

```ts
Riff = {
  id: string,
  lengthBeats: number,
  events: ParamNoteEvent[],
  explanation: string
}
```

---

### 4.7 Parametric Note Event

```ts
ParamNoteEvent = {
  startBeat: number,
  duration: number,
  pitchRef: PitchRef,
  octaveStrategy?: "nearest" | "above" | "below"
}
```

---

### 4.8 Pitch Reference

```ts
PitchRef = {
  basis: "keyRoot" | "currentChord" | "nextChord" | "chordTone",
  offset: number,            // chromatic semitones
  degreeHint?: string
}
```

---

### 4.9 Resolved Note Event (Output)

```ts
NoteEvent = {
  startBeat: number,
  duration: number,
  degree: string,
  octave: number,
  string?: number,
  fret?: number
}
```

---

## 5. Register Resolution Rules

Register is resolved in this order:

1. Rule slot override
2. Part default register
3. Rule default register
4. System fallback ("mid")

Register influences:
- octave choice
- string range

---

## 6. Execution Pipeline

```txt
Progression
 → Build timeline (bars & beats)
 → For each part:
     → Apply global rules
     → Apply per-slot rules
     → Instantiate riffs
 → Resolve parametric pitches
 → Emit NoteEvents
 → Render as text
```

---

## 7. UI Plan (Phase 1)

### 7.1 Setup
- Select genre
- Select chord progression
- Add parts (lanes)

### 7.2 Timeline View
- Rows = parts
- Columns = bars
- Each cell = rule slot

Default rule shown as:
```
Chord Root Hold
```

---

### 7.3 Rule Slot Interaction
Click slot → dialog:
- Rule list
- Filters (genre, level, tags)
- Register selector (low / mid / high)
- “Apply to all” (global)

Concrete riff rules open a riff selector.

---

## 8. Initial Implementation Stages

### Stage 1 – Core Engine
- Data models
- Timeline construction
- Rule slot mapping
- Riff instantiation

### Stage 2 – Pitch Resolver
- PitchRef resolution
- Register handling
- Octave selection

### Stage 3 – Text Output
- Print note events per part
- Show bar & beat numbers

### Stage 4 – UI Skeleton
- Progression selector
- Part lanes
- Rule slot grid
- Rule dialog (no MIDI yet)

---

## 9. Explicit Non-Goals (for now)

- Random generation
- AI composition
- Audio realism
- Fretboard graphics
- MIDI export

---

## 10. Cursor Agent Instructions

- Use client side vanilla JavaScript no server or ES6 modules
- No frameworks
- Keep logic deterministic
- Follow data structures exactly
- Start with text output
- Do not add randomness or “smart” behavior

---

## 11. Design Philosophy Summary

This app does not compose music.  
It **executes musical rules** so humans can understand them.

Every sound must be explainable.

