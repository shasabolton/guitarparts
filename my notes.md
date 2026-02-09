This may apply to the playing engine not note generation part
Play is restricted to 3 octaves, so 3 pitches a note could be played

Fret board is 12 frets and loops scrolable. But only 12 frets fit on screen. Scrolling the screen to other positions changes the key and also forces different note locations to become available.
Any givien note will end up having 6 visible loacations. One on each string. Each note will have an equivilent pitched partner on an adjacent string. So 6 notes, 2 of each pitch. low, mid and high. Rules shall define which of these 6 placements to choose.

Global rules that apply allways
A) must be on screen
C) pick closest to screen center. 

Local rule. Must be applied after global A and before Global C.
B) pick lowest, highest or mid

This will contrain only one string and fret to be chosen.

rule = {beat, scale degree, low mid high}
strategy = [rules]

Levels strategies

1) Bass Roots played only.
strategy = [{beat 1, scale degree 1, low}]

2) Bass root then octave 
strategy =
{beat 1, scale degree 1, low}.
{beat 3, scale degree 1, mid}

3) Bass root then 5th
strategy =
{beat 1, scale degree 1, low}.
{beat 3, scale degree 5, low}

3) Bass root then walk to next chord
strategy =
{beat 1, scale degree 1, low}.
{beat 4, next chord scale degree flattened, low}

Riffs--------------------------------------------
Can't use riffs everywhere. Eg when the next chord influences the riff such as a walk to. Riffs specify octave relative to lowest note in riff. Whole thing can be shiffted to other octaves by rules that state low mid high

NoteEvent {
  startBeat: number,
  duration: number,
  degree: string,
  octaveOffset: number,
  articulation?: string,
  preferredStrings?: number[]
}

Riff {
  id,
  genreTags,
  level,
  lengthBeats,
  events: NoteEvent[],
  explanation
}



{id: "blues_minor_major_3rd",
  genreTags: ["blues"],
  level: 2,
  notes: [
    { degree:"b3", octaveOffset:0, duration:0.5 },
    { degree:"3",  octaveOffset:0, duration:1.0 }
  ],
  explanation: "Minor-to-major third blues resolution."
}


---------------------------------
Should it all be framed as riffs with variables. eg next chord degree
So if I go from I to V  with 1,2,3