/*

    Mapping of the chords that belong to each guitar key.

    Thanks to http://www.guitaristsource.com/lessons/chords/keys/ for an excellent breakdown of guitar chord keys.

 */
(function (fluid) {
    "use strict";
    var cheatar = fluid.registerNamespace("cheatar");
    cheatar.keyChords = {
        none: {
            "C": "-",
            "C#": "-",
            "D": "-",
            "D#": "-",
            "E": "-",
            "F": "-",
            "F#": "-",
            "G": "-",
            "G#": "-",
            "A": "-",
            "A#": "-",
            "B": "-"
        },
        Cmajor: {
            C: "major",
            D: "minor",
            E: "minor",
            F: "major",
            G: "major",
            A: "minor",
            B: "dim"
        },
        "C#major": {
            "C#": "major",
            "D#": "minor",
            "F": "minor",
            "F#": "major",
            "G": "major",
            "G#": "minor",
            "C": "dim"
        },
        Dmajor: {
            "D": "major",
            "E": "minor",
            "F#": "minor",
            "G": "major",
            "A": "major",
            "B": "minor",
            "C#": "dim"
        },
        "D#major": {
            "D#": "major",
            "F": "minor",
            "G": "minor",
            "G#": "major",
            "A#": "major",
            "C": "minor",
            "D": "dim"
        },
        Emajor: {
            "E": "major",
            "F#": "minor",
            "G#": "minor",
            "A": "major",
            "B": "major",
            "C#": "minor",
            "D#": "dim"
        },
        "Fmajor": {
            "F": "major",
            "G": "minor",
            "A": "minor",
            "A#": "major",
            "C": "major",
            "D": "minor",
            "E": "dim"
        },
        "F#major": {
            "F#": "major",
            "G#": "minor",
            "A#": "major",
            "B": "major",
            "C#": "major",
            "D#": "minor",
            "F": "dim"
        },
        "Gmajor": {
            "G": "major",
            "A": "minor",
            "B": "minor",
            "C": "major",
            "D": "major",
            "E": "minor",
            "F#": "dim"
        },
        "G#major": {
            "G#": "major",
            "A#": "minor",
            "C": "minor",
            "C#": "major",
            "D#": "major",
            "F": "minor",
            "G": "dim"
        },
        "Amajor": {
            "A": "major",
            "B": "minor",
            "C#": "minor",
            "D": "major",
            "E": "major",
            "F#": "minor",
            "G#": "dim"
        },
        "A#major": {
            "A#": "major",
            "C": "minor",
            "D": "minor",
            "D#": "major",
            "F": "major",
            "G": "minor",
            "A": "dim"
        },
        "Bmajor": {
            "B": "major",
            "C#": "minor",
            "D#": "minor",
            "E": "major",
            "F#": "major",
            "G#": "minor",
            "A#": "dim"
        },
        // We reuse the definitions from above for the related "minor" chord keys
        "Cminor": "{that}.options.chordKeyModifiers.D#major",
        "C#minor": "{that}.options.chordKeyModifiers.Emajor",
        "Dminor": "{that}.options.chordKeyModifiers.Fmajor",
        "D#minor": "{that}.options.chordKeyModifiers.F#major",
        "Eminor": "{that}.options.chordKeyModifiers.Gmajor",
        "Fminor": "{that}.options.chordKeyModifiers.G#major",
        "F#minor": "{that}.options.chordKeyModifiers.Amajor",
        "Gminor": "{that}.options.chordKeyModifiers.A#major",
        "G#minor": "{that}.options.chordKeyModifiers.Bmajor",
        "Aminor": "{that}.options.chordKeyModifiers.Cmajor",
        "A#minor": "{that}.options.chordKeyModifiers.C#major",
        "Bminor": "{that}.options.chordKeyModifiers.Dmajor",

        // Thanks to https://www.basicmusictheory.com/c-harmonic-minor-triad-chords for breaking down harmonic minor, melodic minor and other chords in depth.
        "Cminor7th": {
            "C": "minor",
            "D": "dim",
            "D#": "aug",
            "F": "minor",
            "G": "major",
            "G#": "major",
            "B": "dim"
        },
        "C#minor7th": {
            "C#": "minor",
            "D#": "dim",
            "E": "aug",
            "F#": "minor",
            "G#": "major",
            "A": "major",
            "C": "dim"
        },
        "Dminor7th": {
            "D": "minor",
            "E": "dim",
            "F": "aug",
            "G": "minor",
            "A": "major",
            "A#": "major",
            "C#": "dim"
        },
        "D#minor7th": {
            "D#": "minor",
            "F": "dim",
            "F#": "aug",
            "G#": "minor",
            "A#": "major",
            "B": "major",
            "D": "dim"
        },
        "Eminor7th": {
            "E": "minor",
            "F#": "dim",
            "G": "aug",
            "A": "minor",
            "B": "major",
            "C": "major",
            "D#": "dim"
        },
        "Fminor7th": {
            "F": "minor",
            "G": "dim",
            "G#": "aug",
            "A#": "minor",
            "C": "major",
            "C#": "major",
            "E": "dim"
        },
        "F#minor7th": {
            "F#": "minor",
            "G#": "dim",
            "A": "aug",
            "B": "minor",
            "C#": "major",
            "D": "major",
            "F": "dim"
        },
        "Gminor7th": {
            "G": "minor",
            "A": "dim",
            "A#": "aug",
            "C": "minor",
            "D": "major",
            "D#": "major",
            "F#": "dim"
        },
        "G#minor7th": {
            "G#": "minor",
            "A#": "dim",
            "B": "aug",
            "C#": "minor",
            "D#": "major",
            "E": "major",
            "G": "dim"
        },
        "Aminor7th": {
            "A": "minor",
            "B": "dim",
            "C": "aug",
            "D": "minor",
            "E": "major",
            "F": "major",
            "G#": "dim"
        },
        "A#minor7th": {
            "A#": "minor",
            "C": "dim",
            "C#": "aug",
            "D#": "minor",
            "F": "major",
            "F#": "major",
            "A": "dim"
        },
        "B#minor7th": {
            "B": "minor",
            "C#": "dim",
            "D": "aug",
            "E": "minor",
            "F#": "major",
            "G": "major",
            "A#": "dim"
        },
        "CminorHarmonic": {
            "C": "minor",
            "D": "dim",
            "D#": "aug",
            "F": "minor",
            "G": "major",
            "G#": "major",
            "B": "dim"
        },
        "C#minorHarmonic": {
            "C#": "minor",
            "D#": "dim",
            "E": "aug",
            "F#": "minor",
            "G#": "major",
            "A": "major",
            "C": "dim"
        },
        "DminorHarmonic": {
            "D": "minor",
            "E": "dim",
            "F": "aug",
            "G": "minor",
            "A": "major",
            "A#": "major",
            "C#": "dim"
        },
        "D#minorHarmonic": {
            "D#": "minor",
            "F": "dim",
            "F#": "aug",
            "G#": "minor",
            "A#": "major",
            "B": "major",
            "D": "dim"
        },
        "EminorHarmonic": {
            "E": "minor",
            "F#": "dim",
            "G": "aug",
            "A": "minor",
            "B": "major",
            "C": "major",
            "D#": "dim"
        },
        "FminorHarmonic": {
            "F": "minor",
            "G": "dim",
            "G#": "aug",
            "A#": "minor",
            "C": "major",
            "C#": "major",
            "E": "dim"
        },
        "F#minorHarmonic": {
            "F#": "minor",
            "G#": "dim",
            "A": "aug",
            "B": "minor",
            "C#": "major",
            "D": "major",
            "F": "dim"
        },
        "GminorHarmonic": {
            "G": "minor",
            "A": "dim",
            "A#": "aug",
            "C": "minor",
            "D": "major",
            "D#": "major",
            "F#": "dim"
        },
        "G#minorHarmonic": {
            "G#": "minor",
            "A#": "dim",
            "B": "aug",
            "C#": "minor",
            "D#": "major",
            "E": "major",
            "G": "dim"
        },
        "AminorHarmonic": {
            "A": "minor",
            "B": "dim",
            "C": "aug",
            "D": "minor",
            "E": "major",
            "F": "major",
            "G#": "dim"
        },
        "A#minorHarmonic": {
            "A#": "minor",
            "C": "dim",
            "C#": "aug",
            "D#": "minor",
            "F": "major",
            "F#": "major",
            "A": "dim"
        },
        "B#minorHarmonic": {
            "B": "minor",
            "C#": "dim",
            "D": "aug",
            "E": "minor",
            "F#": "major",
            "G": "major",
            "A#": "dim"
        },
        "CmelodicHarmonic": {
            "C": "minor",
            "D": "minor",
            "D#": "aug",
            "F": "major",
            "G": "major",
            "A": "dim",
            "B": "dim"
        },
        "C#melodicHarmonic": {
            "C#": "minor",
            "D#": "minor",
            "E": "aug",
            "F#": "major",
            "G#": "major",
            "A#": "dim",
            "C": "dim"
        },
        "DmelodicHarmonic": {
            "D": "minor",
            "E": "minor",
            "F": "aug",
            "G": "major",
            "A": "major",
            "B": "dim",
            "C#": "dim"
        },
        "D#melodicHarmonic": {
            "D#": "minor",
            "F": "minor",
            "F#": "aug",
            "G#": "major",
            "A#": "major",
            "C": "dim",
            "D": "dim"
        },
        "EmelodicHarmonic": {
            "E": "minor",
            "F#": "minor",
            "G": "aug",
            "A": "major",
            "B": "major",
            "C#": "dim",
            "D#": "dim"
        },
        "FmelodicHarmonic": {
            "F": "minor",
            "G": "minor",
            "G#": "aug",
            "A#": "major",
            "C": "major",
            "D": "dim",
            "E": "dim"
        },
        "F#melodicHarmonic": {
            "F#": "minor",
            "G#": "minor",
            "A": "aug",
            "B": "major",
            "C#": "major",
            "D#": "dim",
            "F": "dim"
        },
        "GmelodicHarmonic": {
            "G": "minor",
            "A": "minor",
            "A#": "aug",
            "C": "major",
            "D": "major",
            "E": "dim",
            "F#": "dim"
        },
        "G#melodicHarmonic": {
            "G#": "minor",
            "A#": "minor",
            "B": "aug",
            "C#": "major",
            "D#": "major",
            "F": "dim",
            "G": "dim"
        },
        "AmelodicHarmonic": {
            "A": "minor",
            "B": "minor",
            "C": "aug",
            "D": "major",
            "E": "major",
            "F#": "dim",
            "G#": "dim"
        },
        "A#melodicHarmonic": {
            "A#": "minor",
            "C": "minor",
            "C#": "aug",
            "D#": "major",
            "F": "major",
            "G": "dim",
            "A": "dim"
        },
        "B#melodicHarmonic": {
            "B": "minor",
            "C#": "minor",
            "D": "aug",
            "E": "major",
            "F#": "major",
            "G#": "dim",
            "A#": "dim"
        },
        "Cmajor7th": {
            "C": "major7",
            "D": "minor7",
            "E": "minor7",
            "F": "major7",
            "G": "dom7",
            "A": "minor7",
            "B": "halfDim7"
        },
        "C#major7th": {
            "C#": "major7",
            "D#": "minor7",
            "F": "minor7",
            "F#": "major7",
            "G#": "dom7",
            "A#": "minor7",
            "C": "halfDim7"
        },
        "Dmajor7th": {
            "D": "major7",
            "E": "minor7",
            "F#": "minor7",
            "G": "major7",
            "A": "dom7",
            "B": "minor7",
            "C#": "halfDim7"
        },
        "D#major7th": {
            "D#": "major7",
            "F": "minor7",
            "G": "minor7",
            "G#": "major7",
            "A#": "dom7",
            "C": "minor7",
            "D": "halfDim7"
        },
        "Emajor7th": {
            "E": "major7",
            "F#": "minor7",
            "G#": "minor7",
            "A": "major7",
            "B": "dom7",
            "C#": "minor7",
            "D#": "halfDim7"
        },
        "Fmajor7th": {
            "F": "major7",
            "G": "minor7",
            "A": "minor7",
            "A#": "major7",
            "C": "dom7",
            "D": "minor7",
            "E": "halfDim7"
        },
        "F#major7th": {
            "F#": "major7",
            "G#": "minor7",
            "A#": "minor7",
            "B": "major7",
            "C#": "dom7",
            "D#": "minor7",
            "F": "halfDim7"
        },
        "Gmajor7th": {
            "G": "major7",
            "A": "minor7",
            "B": "minor7",
            "C": "major7",
            "D": "dom7",
            "E": "minor7",
            "F#": "halfDim7"
        },
        "G#major7th": {
            "G#": "major7",
            "A#": "minor7",
            "C": "minor7",
            "C#": "major7",
            "D#": "dom7",
            "F": "minor7",
            "G": "halfDim7"
        },
        "Amajor7th": {
            "A": "major7",
            "B": "minor7",
            "C#": "minor7",
            "D": "major7",
            "E": "dom7",
            "F#": "minor7",
            "G#": "halfDim7"
        },
        "A#major7th": {
            "A#": "major7",
            "C": "minor7",
            "D": "minor7",
            "D#": "major7",
            "F": "dom7",
            "G": "minor7",
            "A": "halfDim7"
        },
        "B#major7th": {
            "B": "major7",
            "C#": "minor7",
            "D#": "minor7",
            "E": "major7",
            "F#": "dom7",
            "G#": "minor7",
            "A#": "halfDim7"
        }
        // TODO:  Add support for minor7, harmonicMinor7 and melodicMinor7
    };
})(fluid);
