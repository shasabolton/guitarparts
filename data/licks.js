// Static lick data
// Licks are musical ideas that can be selected and transformed

const licks = [
  {
    id: "blues-l1-lick1",
    genreTags: ["blues"],
    level: 1,
    notes: [
      { degree: "1", octaveOffset: 0, duration: 0.5 },
      { degree: "b3", octaveOffset: 0, duration: 0.5 },
      { degree: "4", octaveOffset: 0, duration: 0.5 },
      { degree: "5", octaveOffset: 0, duration: 0.5 }
    ],
    explanation: "Simple ascending minor pentatonic pattern"
  },
  {
    id: "blues-l1-lick2",
    genreTags: ["blues"],
    level: 1,
    notes: [
      { degree: "5", octaveOffset: 0, duration: 0.5 },
      { degree: "b7", octaveOffset: 0, duration: 0.5 },
      { degree: "1", octaveOffset: 1, duration: 1.0 }
    ],
    explanation: "Descending pattern resolving to octave"
  },
  {
    id: "blues-l2-lick1",
    genreTags: ["blues"],
    level: 2,
    notes: [
      { degree: "1", octaveOffset: 0, duration: 0.25 },
      { degree: "b3", octaveOffset: 0, duration: 0.25 },
      { degree: "4", octaveOffset: 0, duration: 0.25 },
      { degree: "b5", octaveOffset: 0, duration: 0.25 },
      { degree: "5", octaveOffset: 0, duration: 0.5 }
    ],
    explanation: "Blues scale run with blue note"
  },
  {
    id: "pop-l1-lick1",
    genreTags: ["pop"],
    level: 1,
    notes: [
      { degree: "1", octaveOffset: 0, duration: 0.5 },
      { degree: "3", octaveOffset: 0, duration: 0.5 },
      { degree: "5", octaveOffset: 0, duration: 1.0 }
    ],
    explanation: "Simple major triad arpeggio"
  }
];

