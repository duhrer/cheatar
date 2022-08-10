/*

    A series of major, minor, and 7th chords expressed in terms of the fret held on each string.  -1 indicates that a
    string is not played, 0 indicates that the open string is played.  A positive number indicates the fret that is held.

    These can be used both to generate chord images onscreen and to set up the nano cheatar to play the correct pitch
    for each string.

    Adapted from sites like:

        https://www.wikihow.com/images/sampledocs/a/Guitar-Chord-Chart.pdf
        https://jguitar.com/chordsearch
 */
(function (fluid) {
    "use strict";
    var cheatar = fluid.registerNamespace("cheatar");
    fluid.registerNamespace("cheatar.nano");

    cheatar.nano.chords = {
        "Amaj":  [-1,  0,  2,  2,  2,  0],
        "Amin":  [-1,  0,  2,  2,  1,  0],
        "Adim":  [-1, -1,  1,  2,  1,  2],
        "A#maj": [-1,  1,  3,  3,  3,  1],
        "A#min": [-1,  1,  3,  3,  1,  1],
        "A#dim": [-1, -1,  2,  3,  2,  3],
        "Bmaj":  [-1,  2,  4,  4,  4,  2],
        "Bmin":  [-1,  2,  4,  4,  3,  2],
        "Bdim":  [-1,  2,  3,  4,  3, -1],
        "Cmaj":  [-1,  3,  2,  0,  1,  0],
        "Cmin":  [-1,  3,  5,  5,  4,  3],
        "Cdim":  [-1,  3,  4,  5,  4, -1],
        "C#maj": [-1,  4,  3,  1,  1,  1],
        "C#min": [-1, -1,  2,  1,  2,  0],
        "C#dim": [-1,  4,  5,  6,  5, -1],
        "Dmaj":  [-1, -1,  0,  2,  3,  2],
        "Dmin":  [-1, -1,  0,  2,  3,  1],
        "Ddim":  [-1,  5,  6,  7,  6, -1],
        "D#maj": [-1, -1,  3,  1,  2,  1],
        "D#min": [-1, -1,  4,  3,  4,  2],
        "D#dim": [-1, -1,  1,  2,  4,  2],
        "Emaj":  [ 0,  2,  2,  1,  0,  0],
        "Emin":  [ 0,  2,  2,  0,  0,  0],
        "Edim":  [-1, -1,  2,  3,  5,  3],
        "Fmaj":  [ 1,  3,  3,  2,  1,  1],
        "Fmin":  [ 1,  3,  3,  1,  1,  1],
        "Fdim":  [ 1,  2,  3,  1,  0, -1],
        "F#maj": [ 2,  4,  4,  3,  2,  2],
        "F#min": [ 2,  4,  4,  2,  2,  2],
        "F#dim": [-1, -1,  4,  2,  1,  2],
        "Gmaj":  [ 3,  2,  0,  0,  0,  3],
        "Gmin":  [ 3,  5,  5,  3,  3,  3],
        "Gdim":  [-1, -1,  5,  3,  2,  3],
        "G#maj": [ 4,  6,  6,  5,  4,  4],
        "G#min": [ 1,  3,  3,  1,  1,  1],
        "G#dim": [ 4,  5,  6,  4, -1, -1]
    };

    cheatar.nano.keyChords = {
        "Cmaj": {
            C: "maj",
            D: "min",
            E: "min",
            F: "maj",
            G: "maj",
            A: "min",
            B: "dim"
        },
        "C#maj": {
            "C#": "maj",
            "D#": "min",
            "F":  "min",
            "F#": "maj",
            "G":  "maj",
            "G#": "min",
            "C":  "dim"
        },
        "Dmaj": {
            "D":  "maj",
            "E":  "min",
            "F#": "min",
            "G":  "maj",
            "A":  "maj",
            "B":  "min",
            "C#": "dim"
        },
        "D#maj": {
            "D#": "maj",
            "F":  "min",
            "G":  "min",
            "G#": "maj",
            "A#": "maj",
            "C":  "min",
            "D":  "dim"
        },
        "Emaj": {
            "E":  "maj",
            "F#": "min",
            "G#": "min",
            "A":  "maj",
            "B":  "maj",
            "C#": "min",
            "D#": "dim"
        },
        "Fmaj": {
            "F":  "maj",
            "G":  "min",
            "A":  "min",
            "A#": "maj",
            "C":  "maj",
            "D":  "min",
            "E":  "dim"
        },
        "F#maj": {
            "F#": "maj",
            "G#": "min",
            "A#": "maj",
            "B":  "maj",
            "C#": "maj",
            "D#": "min",
            "F":  "dim"
        },
        "Gmaj": {
            "G":  "maj",
            "A":  "min",
            "B":  "min",
            "C":  "maj",
            "D":  "maj",
            "E":  "min",
            "F#": "dim"
        },
        "G#maj": {
            "G#": "maj",
            "A#": "min",
            "C":  "min",
            "C#": "maj",
            "D#": "maj",
            "F":  "min",
            "G":  "dim"
        },
        "Amaj": {
            "A":  "maj",
            "B":  "min",
            "C#": "min",
            "D":  "maj",
            "E":  "maj",
            "F#": "min",
            "G#": "dim"
        },
        "A#maj": {
            "A#": "maj",
            "C":  "min",
            "D":  "min",
            "D#": "maj",
            "F":  "maj",
            "G":  "min",
            "A":  "dim"
        },
        "Bmaj": {
            "B":  "maj",
            "C#": "min",
            "D#": "min",
            "E":  "maj",
            "F#": "maj",
            "G#": "min",
            "A#": "dim"
        },
        "A#min": {
            // according to: https://www.piano-keyboard-guide.com/key-of-a-sharp-minor.html
            "A#": "min",
            "B#": "dim",
            "C#": "maj",
            "D#": "min",
            "E#": "min",
            "F#": "maj",
            "G#": "maj"
        }
    };

    // Reuse the definitions above for the related "min" keys
    // TODO: Review these in depth, at least some are wrong.
    cheatar.nano.equivalentKeys = [
        { source: "D#maj", target: "Cmin"  },
        { source: "Emaj",  target: "C#min" },
        { source: "Fmaj",  target: "Dmin"  },
        { source: "F#maj", target: "D#min" },
        { source: "Gmaj",  target: "Emin"  },
        { source: "G#maj", target: "Fmin"  },
        { source: "Amaj",  target: "F#min" },
        { source: "A#maj", target: "Gmin"  },
        { source: "Bmaj",  target: "G#min" },
        { source: "Cmaj",  target: "Amin"  },
        //{ source: "C#maj", target: "A#min" }, // TODO: This is off, as it doesn't actually include A#min
        { source: "Dmaj",  target: "Bmin"  }
    ];

    fluid.each(cheatar.nano.equivalentKeys, function (keyMapping) {
        cheatar.nano.keyChords[keyMapping.target] = cheatar.nano.keyChords[keyMapping.source];
    });
})(fluid);
