const RULES = {
  default_root_hold: {
    id: "default_root_hold",
    name: "Chord Root Hold",
    description: "Hold the chord root for the full bar.",
    riffId: "chord_root_hold",
    tags: ["basic", "foundation"],
    defaultRegister: "low"
  },

  oom_pah_rule: {
    id: "oom_pah_rule",
    name: "Oom-Pah (Root–Fifth)",
    description: "Play root on beat 1 and fifth on beat 3.",
    riffId: "oom_pah_I_V",
    tags: ["bass", "groove", "beginner"],
    defaultRegister: "low"
  },

  walk_to_target: {
    id: "walk_to_target",
    type: "rule",
    category: "walk",
    name: "Walk to Target Chord",
    description: "Connects a starting harmonic anchor to a target anchor using a fixed number of steps with deterministic resolution.",
    teachingSummary: "A walk moves stepwise from the current chord into the next chord using approach tones to create strong resolution.",
    riffId: null, // Walk rules are resolved dynamically
    tags: ["walk", "transition", "bass", "intermediate"],
    defaultRegister: "low",
    
    applicableTo: {
      partType: "any",
      timingScope: "bar"
    },

    parameters: {
      target: {
        type: "enum",
        values: ["nextChordRoot", "currentChordRoot"],
        default: "nextChordRoot",
        description: "Which harmonic anchor the walk resolves to."
      },

      steps: {
        type: "integer",
        min: 1,
        max: 5,
        default: 3,
        description: "Number of non-anchor notes used between start and target."
      },

      direction: {
        type: "enum",
        values: ["auto", "up", "down"],
        default: "auto",
        description: "Direction of motion. Auto chooses the smallest interval."
      },

      approachStrategy: {
        type: "enum",
        values: ["chromatic", "diatonic", "mixed"],
        default: "mixed",
        description: "How approach tones are selected near the target."
      },

      register: {
        type: "enum",
        values: ["low", "mid", "high", "inherit"],
        default: "inherit",
        description: "String/register preference for note placement."
      },

      genreProfile: {
        type: "enum",
        values: ["blues", "pop", "jazz", "custom"],
        default: "blues",
        description: "Genre-specific decision preferences applied during resolution."
      }
    },

    genreProfiles: {
      blues: {
        preferredApproach: "chromatic",
        preferFlat7: true,
        maxDiatonicLeap: 2,
        description: "Chromatic motion with strong semitone approaches."
      },
      pop: {
        preferredApproach: "diatonic",
        preferScaleSteps: true,
        maxDiatonicLeap: 3,
        description: "Mostly diatonic motion with minimal chromaticism."
      },
      jazz: {
        preferredApproach: "chromatic",
        allowEnclosures: true,
        maxDiatonicLeap: 2,
        description: "Chromatic approaches and decorative motion."
      },
      custom: {
        preferredApproach: "mixed",
        description: "No stylistic bias."
      }
    },

    timelineTemplate: {
      lengthBeats: 4,
      events: [
        {
          beat: 1,
          role: "startAnchor",
          noteSource: "currentChordRoot"
        },
        {
          beat: 2,
          role: "walkStep",
          stepIndex: 1
        },
        {
          beat: 3,
          role: "walkStep",
          stepIndex: 2
        },
        {
          beat: 4,
          role: "approachTone"
        },
        {
          beat: 1,
          barOffset: 1,
          role: "targetAnchor",
          noteSource: "targetChordRoot"
        }
      ]
    },

    resolutionRules: {
      approachTone: {
        up: "semitoneBelowTarget",
        down: "semitoneAboveTarget"
      },
      stepDistribution: "even",
      guaranteeResolution: true
    }
  }
};
