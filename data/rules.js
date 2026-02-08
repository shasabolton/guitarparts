// Static rule data
// Rules are atomic, single-slot, declarative behaviors

export const rules = [
  // Bass rules for Blues
  {
    id: "bass-blues-anchor-beat1",
    part: "bass",
    genreTags: ["blues"],
    minLevel: 1,
    maxLevel: Infinity,
    role: "anchor",
    affectsSlot: "targetTone",
    trigger: "beat1",
    action: "play root of current chord"
  },
  {
    id: "bass-blues-preference-beat3",
    part: "bass",
    genreTags: ["blues"],
    minLevel: 1,
    maxLevel: Infinity,
    role: "preference",
    affectsSlot: "targetTone",
    trigger: "beat3",
    action: "prefer 5th or root",
    weight: 0.7
  },
  {
    id: "bass-blues-constraint-rhythm",
    part: "bass",
    genreTags: ["blues"],
    minLevel: 1,
    maxLevel: Infinity,
    role: "constraint",
    affectsSlot: "rhythm",
    trigger: "always",
    action: "quarter notes only"
  },
  {
    id: "bass-blues-embellishment-walk",
    part: "bass",
    genreTags: ["blues"],
    minLevel: 2,
    maxLevel: Infinity,
    role: "embellishment",
    affectsSlot: "motion",
    trigger: "chord change",
    action: "allow walking bass line",
    weight: 0.5
  },
  
  // Bass rules for Pop
  {
    id: "bass-pop-anchor-beat1",
    part: "bass",
    genreTags: ["pop"],
    minLevel: 1,
    maxLevel: Infinity,
    role: "anchor",
    affectsSlot: "targetTone",
    trigger: "beat1",
    action: "play root of current chord"
  },
  {
    id: "bass-pop-preference-beat3",
    part: "bass",
    genreTags: ["pop"],
    minLevel: 1,
    maxLevel: Infinity,
    role: "preference",
    affectsSlot: "targetTone",
    trigger: "beat3",
    action: "prefer 5th",
    weight: 0.8
  },
  
  // Lead rules for Blues
  {
    id: "lead-blues-constraint-scale",
    part: "lead",
    genreTags: ["blues"],
    minLevel: 1,
    maxLevel: Infinity,
    role: "constraint",
    affectsSlot: "targetTone",
    trigger: "always",
    action: "use minor pentatonic scale"
  },
  {
    id: "lead-blues-preference-resolution",
    part: "lead",
    genreTags: ["blues"],
    minLevel: 1,
    maxLevel: Infinity,
    role: "preference",
    affectsSlot: "targetTone",
    trigger: "chord change",
    action: "prefer chord tones",
    weight: 0.6
  }
];

