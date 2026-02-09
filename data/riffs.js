const RIFFS = {
  chord_root_hold: {
    id: "chord_root_hold",
    lengthBeats: 4,
    explanation: "Sustain the current chord root for the full bar.",
    events: [
      {
        startBeat: 1,
        duration: 4,
        pitchRef: {
          basis: "currentChord",
          offset: 0,
          degreeHint: "1"
        }
      }
    ]
  },

  
  oom_pah_I_V: {
    id: "oom_pah_I_V",
    lengthBeats: 4,
    explanation: "Classic oom-pah pattern: root on beat 1, fifth on beat 3.",
    events: [
      {
        startBeat: 1,
        duration: 1,
        pitchRef: {
          basis: "currentChord",
          offset: 0,
          degreeHint: "1"
        }
      },
      {
        startBeat: 3,
        duration: 1,
        pitchRef: {
          basis: "currentChord",
          offset: 7,
          degreeHint: "5"
        }
      }
    ]
  }
};

