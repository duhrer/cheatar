/*

    The "cheatar" is made up of individual "strings", single-voice instruments.

 */
"use strict";
var fluid = fluid || require("infusion");
var cheatar = fluid.registerNamespace("cheatar");

// TODO: Get pitchbend working again.
// TODO: Make the "strum" interval controllable, for example using the mod wheel.

fluid.defaults("cheatar.strings", {
    gradeNames: ["flock.synth.polyphonic"],
    maxVoices: 5,
    synthDef: {
        // "ugen": "flock.ugen.sinOsc",
        "ugen": "flock.ugen.sinOsc",
        freq: {
            id:   "freq",
            ugen: "flock.ugen.midiFreq",
            // The "chord" offset
            note: {
                id: "note",
                ugen: "flock.ugen.value",
                value: 0,
                add: {
                    ugen: "flock.ugen.value",
                    rate: "audio",
                    id:    "chord",
                    value: 0
                }
            }
        },
        phase: 0.0,
        mul: {
            id: "amp",
            ugen: "flock.ugen.midiAmp",
            velocity: 100,
            mul: {
                id:      "env",
                "ugen": "flock.ugen.envGen",
                "envelope": {
                    "type": "flock.envelope.adsr",
                    "attack": 1.0,
                    "decay": 0.80,
                    "peak": 0.25,
                    "sustain": 0.5,
                    "release": .95
                },
                // Convenient place to let us control the volume
                mul: {
                    id: "volume",
                    ugen: "flock.ugen.value",
                    value: 0.5
                }
            }
        }
    }
});

cheatar.playChord  = function (that, payload) {
    var midiNote     = cheatar.midiNoteToKey(payload["note.value"]);
    var modifier     = that.model.chordType;

    if (that.model.chordKey !== "manual") {
        var fullChordName = that.model.chordKey + that.model.chordScale;
        var modifiers = that.options.chordKeyModifiers[fullChordName];
        if (modifiers && modifiers[midiNote]) {
            modifier = modifiers[midiNote];
        }
    }

    var chordPattern = that.options.chords[modifier];
    var playingChord = midiNote + modifier;
    that.applier.change("playingChord", playingChord);

    var msBetweenStrings = that.options.strumDuration / chordPattern.length;
    fluid.each(chordPattern, function (offset, index) {
        var delayMs = index * msBetweenStrings;
        var modifiedPayload = fluid.copy(payload);
        modifiedPayload["chord.value"] = offset;

        if (that.activeTimeouts[index]) {
            clearTimeout(that.activeTimeouts[index]);
            that.activeTimeouts[index] = undefined;
        }

        that.activeTimeouts[index] = setTimeout(function () {
            that.strings.noteOn(index, modifiedPayload);
        }, delayMs);
    });
};

cheatar.sendNoteOn = function (that, payload) {
    cheatar.clearInterval(that);

    // Play the chord once
    cheatar.playChord(that, payload);

    // As as the note is "on", "strum" every so often.
    that.activeInterval = setInterval(cheatar.playChord, that.options.strumDuration + that.options.pauseDuration, that, payload);
};

cheatar.clearInterval = function (that) {
    if (that.activeInterval) {
        clearInterval(that.activeInterval);
        that.activeInterval = undefined;
    }
};

cheatar.sendNoteOff = function (that) {
    // Stop "strumming"
    cheatar.clearInterval(that);

    // Clean up any timeouts from this particular "strum"
    fluid.each(that.activeTimeouts, function (timeout, index) {
        if (timeout) {
            clearTimeout(timeout);
            that.activeTimeouts[index] = undefined;
        }
    });

    for (var a = 0; a < that.strings.options.maxVoices; a++) {
        that.strings.noteOff(a);
    }

    that.applier.change("playingChord", "-");
};

cheatar.midiNoteToKey = function (midiNote) {
    var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return noteNames[midiNote % 12];
};

fluid.defaults("cheatar", {
    gradeNames: ["flock.band", "fluid.modelComponent"],
    model: {
        chordKey:     "C",
        chordType:    "major",
        chordScale:   "major",
        playingChord: "-"
    },
    members: {
        activeInterval: false,
        activeTimeouts: []
    },
    // Which chord to automatically use for a given note when we're set to use a particular "chord key"
    // Thanks to http://www.guitaristsource.com/lessons/chords/keys/ for an excellent breakdown of guitar chord keys.
    chordKeyModifiers: {
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
            "D":  "major",
            "E":  "minor",
            "F#": "minor",
            "G":  "major",
            "A":  "major",
            "B":  "minor",
            "C#": "dim"
        },
        "D#major": {
            "D#": "major",
            "F":  "minor",
            "G":  "minor",
            "G#": "major",
            "A#": "major",
            "C":  "minor",
            "D":  "dim"
        },
        Emajor: {
            "E":  "major",
            "F#": "minor",
            "G#": "minor",
            "A":  "major",
            "B":  "major",
            "C#": "minor",
            "D#": "dim"
        },
        "Fmajor": {
            "F":  "major",
            "G":  "minor",
            "A":  "minor",
            "A#": "major",
            "C": "major",
            "D":  "minor",
            "E":  "dim"
        },
        "F#major": {
            "F#": "major",
            "G#": "minor",
            "A#": "major",
            "B":  "major",
            "C#": "major",
            "D#": "minor",
            "E#": "dim"
        },
        "Gmajor": {
            "G":  "major",
            "A":  "minor",
            "B":  "minor",
            "C":  "major",
            "D":  "major",
            "E":  "minor",
            "F#": "dim"
        },
        "G#major": {
            "G#": "major",
            "A#": "minor",
            "C":  "minor",
            "C#": "major",
            "D#": "major",
            "F":  "minor",
            "G":  "dim"
        },
        "Amajor": {
            "A":  "major",
            "B":  "minor",
            "C#": "minor",
            "D":  "major",
            "E":  "major",
            "F#": "minor",
            "G#": "dim"
        },
        "A#major": {
            "A#": "major",
            "C":  "minor",
            "D":  "minor",
            "D#": "major",
            "F":  "major",
            "G":  "minor",
            "A":  "dim"
        },
        "Bmajor": {
            "B":  "major",
            "C#": "minor",
            "D#": "minor",
            "E":  "major",
            "F#": "major",
            "G#": "minor",
            "A#": "dim"
        },
        // We reuse the definitions from above for the related "minor" chord keys
        "Cminor":  "{that}.options.chordKeyModifiers.D#major",
        "C#minor": "{that}.options.chordKeyModifiers.Emajor",
        "Dminor":  "{that}.options.chordKeyModifiers.Fmajor",
        "D#minor": "{that}.options.chordKeyModifiers.F#major",
        "Eminor":  "{that}.options.chordKeyModifiers.Gmajor",
        "Fminor":  "{that}.options.chordKeyModifiers.G#major",
        "F#minor": "{that}.options.chordKeyModifiers.Amajor",
        "Gminor":  "{that}.options.chordKeyModifiers.A#major",
        "G#minor": "{that}.options.chordKeyModifiers.Bmajor",
        "Aminor":  "{that}.options.chordKeyModifiers.Cmajor",
        "A#minor": "{that}.options.chordKeyModifiers.C#major",
        "Bminor":  "{that}.options.chordKeyModifiers.Dmajor",

        // Thanks to https://www.basicmusictheory.com/c-harmonic-minor-triad-chords for breaking down harmonic minor, melodic minor and other chords in depth.
        "CminorHarmonic": {
            "C":  "minor",
            "D":  "dim",
            "D#": "aug",
            "F":  "minor",
            "G":  "major",
            "G#": "major",
            "B":  "dim"
        },
        "C#minorHarmonic": {
            "C#":  "minor",
            "D#":  "dim",
            "E":   "aug",
            "F#":  "minor",
            "G#":  "major",
            "A":   "major",
            "C":   "dim"
        },
        "DminorHarmonic": {
            "D":  "minor",
            "E":  "dim",
            "F": "aug",
            "G":  "minor",
            "A":  "major",
            "A#": "major",
            "C#":  "dim"
        },
        "D#minorHarmonic": {
            "D#": "minor",
            "F":  "dim",
            "F#": "aug",
            "G#": "minor",
            "A#": "major",
            "B":  "major",
            "D":  "dim"
        },
        "EminorHarmonic": {
            "E":  "minor",
            "F#": "dim",
            "G":  "aug",
            "A":  "minor",
            "B":  "major",
            "C":  "major",
            "D#": "dim"
        },
        "FminorHarmonic": {
            "F":  "minor",
            "G":  "dim",
            "G#": "aug",
            "A#": "minor",
            "C":  "major",
            "C#": "major",
            "E":  "dim"
        },
        "F#minorHarmonic": {
            "F#": "minor",
            "G#": "dim",
            "A":  "aug",
            "B":  "minor",
            "C#": "major",
            "D":  "major",
            "F":  "dim"
        },
        "GminorHarmonic": {
            "G":  "minor",
            "A":  "dim",
            "A#": "aug",
            "C": "minor",
            "D":  "major",
            "D#": "major",
            "F#": "dim"
        },
        "G#minorHarmonic": {
            "G#": "minor",
            "A#": "dim",
            "B":  "aug",
            "C#": "minor",
            "D#": "major",
            "E":  "major",
            "G":  "dim"
        },
        "AminorHarmonic": {
            "A":  "minor",
            "B":  "dim",
            "C":  "aug",
            "D":  "minor",
            "E":  "major",
            "F":  "major",
            "G#": "dim"
        },
        "A#minorHarmonic": {
            "A#": "minor",
            "C":  "dim",
            "C#": "aug",
            "D#": "minor",
            "F":  "major",
            "F#": "major",
            "A":  "dim"
        },
        "B#minorHarmonic": {
            "B":  "minor",
            "C#": "dim",
            "D":  "aug",
            "E":  "minor",
            "F#": "major",
            "G":  "major",
            "A#": "dim"
        },
        "CmelodicHarmonic": {
            "C":  "minor",
            "D":  "minor",
            "D#": "aug",
            "F":  "major",
            "G":  "major",
            "A":  "dim",
            "B":  "dim"
        },
        "C#melodicHarmonic": {
            "C#":  "minor",
            "D#":  "minor",
            "E":   "aug",
            "F#":  "major",
            "G#":  "major",
            "A#":  "dim",
            "C":   "dim"
        },
        "DmelodicHarmonic": {
            "D":  "minor",
            "E":  "minor",
            "F":  "aug",
            "G":  "major",
            "A":  "major",
            "B":  "dim",
            "C#": "dim"
        },
        "D#melodicHarmonic": {
            "D#": "minor",
            "F":  "minor",
            "F#": "aug",
            "G#": "major",
            "A#": "major",
            "C":  "dim",
            "D":  "dim"
        },
        "EmelodicHarmonic": {
            "E":  "minor",
            "F#": "minor",
            "G":  "aug",
            "A":  "major",
            "B":  "major",
            "C#":  "dim",
            "D#": "dim"
        },
        "FmelodicHarmonic": {
            "F":  "minor",
            "G":  "minor",
            "G#": "aug",
            "A#": "major",
            "C":  "major",
            "D":  "dim",
            "E":  "dim"
        },
        "F#melodicHarmonic": {
            "F#": "minor",
            "G#": "minor",
            "A":  "aug",
            "B":  "major",
            "C#": "major",
            "D#": "dim",
            "F":  "dim"
        },
        "GmelodicHarmonic": {
            "G":  "minor",
            "A":  "minor",
            "A#": "aug",
            "C":  "major",
            "D":  "major",
            "E":  "dim",
            "F#": "dim"
        },
        "G#melodicHarmonic": {
            "G#": "minor",
            "A#": "minor",
            "B":  "aug",
            "C#": "major",
            "D#": "major",
            "F":  "dim",
            "G":  "dim"
        },
        "AmelodicHarmonic": {
            "A":  "minor",
            "B":  "minor",
            "C":  "aug",
            "D":  "major",
            "E":  "major",
            "F#": "dim",
            "G#": "dim"
        },
        "A#melodicHarmonic": {
            "A#": "minor",
            "C":  "minor",
            "C#": "aug",
            "D#": "major",
            "F":  "major",
            "G":  "dim",
            "A":  "dim"
        },
        "B#melodicHarmonic": {
            "B":  "minor",
            "C#": "minor",
            "D":  "aug",
            "E":  "major",
            "F#": "major",
            "G#": "dim",
            "A#": "dim"
        },
        "Cmajor7th": {
            "C":  "major7",
            "D":  "minor7",
            "E":  "minor7",
            "F":  "major7",
            "G":  "dom7",
            "A":  "minor7",
            "B":  "halfDim7"
        },
        "C#major7th": {
            "C#":  "major7",
            "D#":  "minor7",
            "F":   "minor7",
            "F#":  "major7",
            "G#":  "dom7",
            "A#":  "minor7",
            "C":   "halfDim7"
        },
        "Dmajor7th": {
            "D":  "major7",
            "E":  "minor7",
            "F#": "minor7",
            "G":  "major7",
            "A":  "dom7",
            "B":  "minor7",
            "C#": "halfDim7"
        },
        "D#major7th": {
            "D#": "major7",
            "F":  "minor7",
            "G":  "minor7",
            "G#": "major7",
            "A#": "dom7",
            "C":  "minor7",
            "D":  "halfDim7"
        },
        "Emajor7th": {
            "E":  "major7",
            "F#": "minor7",
            "G#": "minor7",
            "A":  "major7",
            "B":  "dom7",
            "C#": "minor7",
            "D#": "halfDim7"
        },
        "Fmajor7th": {
            "F":  "major7",
            "G":  "minor7",
            "A":  "minor7",
            "A#": "major7",
            "C":  "dom7",
            "D":  "minor7",
            "E":  "halfDim7"
        },
        "F#major7th": {
            "F#": "major7",
            "G#": "minor7",
            "A#": "minor7",
            "B":  "major7",
            "C#": "dom7",
            "D#": "minor7",
            "F":  "halfDim7"
        },
        "Gmajor7th": {
            "G":  "major7",
            "A":  "minor7",
            "B":  "minor7",
            "C":  "major7",
            "D":  "dom7",
            "E":  "minor7",
            "F#": "halfDim7"
        },
        "G#major7th": {
            "G#": "major7",
            "A#": "minor7",
            "C":  "minor7",
            "C#": "major7",
            "D#": "dom7",
            "F":  "minor7",
            "G":  "halfDim7"
        },
        "Amajor7th": {
            "A":  "major7",
            "B":  "minor7",
            "C#": "minor7",
            "D":  "major7",
            "E":  "dom7",
            "F#": "minor7",
            "G#": "halfDim7"
        },
        "A#major7th": {
            "A#": "major7",
            "C":  "minor7",
            "D":  "minor7",
            "D#": "major7",
            "F":  "dom7",
            "G":  "minor7",
            "A":  "halfDim7"
        },
        "B#major7th": {
            "B":  "major7",
            "C#": "minor7",
            "D#": "minor7",
            "E":  "major7",
            "F#": "dom7",
            "G#": "minor7",
            "A#": "halfDim7"
        }
    },
    chords: {
        // Thanks to http://edmprod.com/different-chord-types/ for an excellent explanation of various chords.
        major:    [0, 4, 7],
        minor:    [0, 3, 7],
        major7:   [0, 4, 7, 11],
        minor7:   [0, 3, 7, 10],
        dom7:     [0, 4, 7, 10],
        maj6:     [0, 4, 7, 9],
        min6:     [0, 3, 7, 9],
        sus4:     [0, 5, 7],
        ninth:    [0, 4, 7, 13],
        dim:      [0, 3, 6],
        aug:      [0, 4, 8],
        halfDim7: [0, 3, 6, 10]
        // Alternate chords where the root note is in the "middle", so that the average pitch is closer to hitting the note itself.
        // major:  [-8, 0, 7],     // 0, 4, 7 transposed
        // minor:  [-9, 0, 7],     // 0, 3, 7 transposed
        // major7: [-8, 0, 7, 11], // 0, 4, 7, 11 transposed (somewhat)
        // minor7: [-9, 0, 7, 10], // 0, 3, 7, 10 transposed (somewhat)
        // dom7:   [-8, 0, 7, 10], // 0, 4, 7, 10 transposed (somewhat)
        // maj6:   [-8, 0, 7, 9],  // 0, 4, 7, 9 transposed (somewhat)
        // min6:   [-9, 0, 7, 9],  // 0, 3, 7, 9 transposed (somewhat)
        // sus4:   [-7, 0, 7],     // 0, 5, 7 transposed
        // ninth:  [-8, 0, 7, 13], // 0, 4, 7, 13 transposed (somewhat)
        // dim:    [-9, 0, 6],     // 0, 3, 6 transposed
        // aug:    [-8, 0, 8]      // 0, 4, 8 transposed
    },
    strumDuration: 150,
    pauseDuration: 300,
    invokers: {
        noteOn: {
            funcName: "cheatar.sendNoteOn",
            args: ["{that}", "{arguments}.0"]
        },
        noteOff: {
            funcName: "cheatar.sendNoteOff",
            args: ["{that}"]
        }
    },
    modelListeners: {
        chordType: {
            func: "{that}.noteOff",
            excludeSource: "init"
        }
    },
    components: {
        strings: { type: "cheatar.strings" }
    }
});

