/* global require */
(function (fluid) {

    "use strict";
    fluid = fluid || require("infusion");
    var cheatar = fluid.registerNamespace("cheatar");

    fluid.registerNamespace("cheatar.arpeggiator");
    cheatar.arpeggiator.playChord  = function (that, destination, payload) {
        var midiNote     = cheatar.arpeggiator.midiNoteToKey(payload.note);
        var modifier     = "none";

        if (that.model.chordScale !== "none") {
            modifier = that.model.chordType;
            var fullChordName = that.model.chordKey + that.model.chordScale;
            var modifiers = that.options.chordKeyModifiers[fullChordName];
            if (modifiers && modifiers[midiNote]) {
                modifier = modifiers[midiNote];
            }
        }

        var inversionPattern = that.model.inversion && that.options.inversion && that.options.inversion[that.model.inversion] ? that.options.inversion[that.model.inversion] : false;

        var chordPattern = that.options.chords[modifier];
        var playingChord = midiNote + modifier;
        that.applier.change("playingChord", playingChord);

        // Adjust the strum duration so that harder strums are played more quickly.  The hardest note is played 50%
        // faster, the softest is played 50% slower.
        var velocityAdjust = ((63.5 - payload.velocity) / 127) * that.model.strumDuration;
        var msBetweenStrings = (that.model.strumDuration + velocityAdjust) / chordPattern.length;
        fluid.each(chordPattern, function (chordOffset, index) {
            var delayMs = index * msBetweenStrings;
            var singleNoteNoteOn = fluid.copy(payload);

            var combinedOffset = inversionPattern && inversionPattern[index] ? chordOffset + inversionPattern[index] : chordOffset;
            singleNoteNoteOn.note += combinedOffset;

            var singleNoteNoteOff = fluid.filterKeys(singleNoteNoteOn, ["channel", "note"]);
            singleNoteNoteOff.type = "noteOff";
            singleNoteNoteOff.velocity = 0;

            if (that.activeTimeouts[index]) {
                clearTimeout(that.activeTimeouts[index]);
                that.activeTimeouts[index] = undefined;
            }

            that.activeTimeouts[index] = setTimeout(function () {
                destination.send(singleNoteNoteOn);
            }, delayMs);
        });
    };

    cheatar.arpeggiator.sendNoteOn = function (that, destination, payload) {
        // Play the chord once
        cheatar.arpeggiator.playChord(that, destination, payload);
    };

    // cheatar.arpeggiator.sendSingleNoteOff = function (that, destination, index, payload) {
    //     var singleNoteTimeout = that.activeTimeouts[index];
    //     if (singleNoteTimeout) {
    //         clearTimeout(singleNoteTimeout);
    //     }
    //     destination.send(payload);
    // };

    cheatar.arpeggiator.sendNoteOff = function (that, destination, payload) {
        // TODO: Standardise and sanitise this.
        var midiNote     = cheatar.arpeggiator.midiNoteToKey(payload.note);
        var modifier     = "none";

        if (that.model.chordScale !== "none") {
            modifier = that.model.chordType;
            var fullChordName = that.model.chordKey + that.model.chordScale;
            var modifiers = that.options.chordKeyModifiers[fullChordName];
            if (modifiers && modifiers[midiNote]) {
                modifier = modifiers[midiNote];
            }
        }

        var inversionPattern = that.model.inversion && that.options.inversion && that.options.inversion[that.model.inversion] ? that.options.inversion[that.model.inversion] : false;

        var chordPattern = that.options.chords[modifier];
        that.applier.change("playingChord", false);

        fluid.each(chordPattern, function (chordOffset, index) {
            var singleNoteOff = fluid.copy(payload);

            var combinedOffset = inversionPattern && inversionPattern[index] ? chordOffset + inversionPattern[index] : chordOffset;
            singleNoteOff.note += combinedOffset;
            destination.send(singleNoteOff);
        });

        // TODO: Remove this once we have exercised the above more.
        // // Rather than inspect or otherwise manage currently playing notes, send "All notes off" control code.
        // // This allows us to very cleanly switch between finger picking and chords without having to manage timeouts.
        // destination.send({type: "control", "number": 120, value: 0});
    };

    cheatar.arpeggiator.noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    cheatar.arpeggiator.midiNoteToKey = function (midiNote) {
        return cheatar.arpeggiator.noteNames[midiNote % 12];
    };

    cheatar.arpeggiator.keyToMidiNote = function (keyString) {
        var matches = keyString.match(/([A-Z]\#?)([0-9]+)/);
        if (matches) {
            var offsetWithinOctave = cheatar.arpeggiator.noteNames.indexOf(matches[1]);
            var octave = parseInt(matches[2], 10);
            // By this logic, C4 is 72, or zero [the index in noteNames] plus (4 [octave] * 12) plus 24 [offset].
            var midiNote = offsetWithinOctave + (octave * 12) + 24;
            return midiNote;
        }
        else {
            fluid.fail("Can't parse note '", keyString, "'.");
        }
    };

    cheatar.arpeggiator.updateKeyChords = function (that) {
        var combinedChord = that.model.chordScale === "none" ? "none" : that.model.chordKey + that.model.chordScale;
        // TODO:  Work out how to clobber an array properly.
        that.applier.change("keyChords", false);

        var chordMap = fluid.copy(that.options.baseChordMap);
        var chordModifiers = that.options.chordKeyModifiers[combinedChord];
        if (chordModifiers) {
            fluid.each(chordModifiers, function (type, key) {
                chordMap[key].type  = type;
                chordMap[key].inKey = 1;
                chordMap[key].isKeyItself = (key === that.model.chordKey) ? 1 : 0;
            });
        }

        if (that.model.playingChord) {
            var matches = that.model.playingChord.match(/([A-Z]#?).+/);
            if (matches && matches[1]) {
                $(".chord[key='" + that.model.chordKey + "']").addClass("active");
                // // TODO: Break this out as a separate variable, tracking it as part of the chord causes a redraw for every note played!
                // chordMap[matches[1]].active = 1;
            }
        }

        that.applier.change("keyChords", chordMap);
    };

    fluid.defaults("cheatar.arpeggiator", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            volume:        36,
            inversion:     "root",
            chordKey:      "C",
            chordType:     "major",
            keyChords:     "{that}.options.chordKeyModifiers.Cmajor",
            chordScale:    "major",
            playingChord:  "-",
            strumDuration: 150,
            noteMs:        1000,
            pauseDuration: 500
        },
        members: {
            activeTimeouts: []
        },
        baseChordMap: {
            "C":  { type: "major"},
            "C#": { type: "major"},
            "D":  { type: "major"},
            "D#": { type: "major"},
            "E":  { type: "major"},
            "F":  { type: "major"},
            "F#": { type: "major"},
            "G":  { type: "major"},
            "G#": { type: "major"},
            "A":  { type: "major"},
            "A#": { type: "major"},
            "B":  { type: "major"}
        },
        // Which chord to automatically use for a given note when we're set to use a particular "chord key"
        // Thanks to http://www.guitaristsource.com/lessons/chords/keys/ for an excellent breakdown of guitar chord keys.
        chordKeyModifiers: {
            none: {
                "C":  "-",
                "C#": "-",
                "D":  "-",
                "D#": "-",
                "E":  "-",
                "F":  "-",
                "F#": "-",
                "G":  "-",
                "G#": "-",
                "A":  "-",
                "A#": "-",
                "B":  "-"
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
                "F":  "dim"
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
            "Cminor7th": {
                "C":  "minor",
                "D":  "dim",
                "D#": "aug",
                "F":  "minor",
                "G":  "major",
                "G#": "major",
                "B":  "dim"
            },
            "C#minor7th": {
                "C#":  "minor",
                "D#":  "dim",
                "E":   "aug",
                "F#":  "minor",
                "G#":  "major",
                "A":   "major",
                "C":   "dim"
            },
            "Dminor7th": {
                "D":  "minor",
                "E":  "dim",
                "F": "aug",
                "G":  "minor",
                "A":  "major",
                "A#": "major",
                "C#":  "dim"
            },
            "D#minor7th": {
                "D#": "minor",
                "F":  "dim",
                "F#": "aug",
                "G#": "minor",
                "A#": "major",
                "B":  "major",
                "D":  "dim"
            },
            "Eminor7th": {
                "E":  "minor",
                "F#": "dim",
                "G":  "aug",
                "A":  "minor",
                "B":  "major",
                "C":  "major",
                "D#": "dim"
            },
            "Fminor7th": {
                "F":  "minor",
                "G":  "dim",
                "G#": "aug",
                "A#": "minor",
                "C":  "major",
                "C#": "major",
                "E":  "dim"
            },
            "F#minor7th": {
                "F#": "minor",
                "G#": "dim",
                "A":  "aug",
                "B":  "minor",
                "C#": "major",
                "D":  "major",
                "F":  "dim"
            },
            "Gminor7th": {
                "G":  "minor",
                "A":  "dim",
                "A#": "aug",
                "C":  "minor",
                "D":  "major",
                "D#": "major",
                "F#": "dim"
            },
            "G#minor7th": {
                "G#": "minor",
                "A#": "dim",
                "B":  "aug",
                "C#": "minor",
                "D#": "major",
                "E":  "major",
                "G":  "dim"
            },
            "Aminor7th": {
                "A":  "minor",
                "B":  "dim",
                "C":  "aug",
                "D":  "minor",
                "E":  "major",
                "F":  "major",
                "G#": "dim"
            },
            "A#minor7th": {
                "A#": "minor",
                "C":  "dim",
                "C#": "aug",
                "D#": "minor",
                "F":  "major",
                "F#": "major",
                "A":  "dim"
            },
            "B#minor7th": {
                "B":  "minor",
                "C#": "dim",
                "D":  "aug",
                "E":  "minor",
                "F#": "major",
                "G":  "major",
                "A#": "dim"
            },
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
            // TODO:  Add support for minor7, harmonicMinor7 and melodicMinor7
        },
        chords: {
            // TODO: refactor this to support "strum patterns"
            none:     [0],
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
            // TODO: Reenter harmonic minor chord keys and associate chords
            // TODO: Extract chord data to "holder" grade and restructure for easier reuse.
        },
        // Thanks to http://www.musictheory.net/lessons/42 for the clear explanation and variation names.
        inversion: {
            root:   [0,  0,  0], // The default order of notes
            first:  [12, 0,  0], // The first note is now an octave higher
            second: [12, 12, 0]  // The first and second notes are now an octave higher
        },
        invokers: {
            noteOn: {
                funcName: "cheatar.arpeggiator.sendNoteOn",
                args: ["{that}", "{arguments}.0", "{arguments}.1"] // destination, payload
            },
            noteOff: {
                funcName: "cheatar.arpeggiator.sendNoteOff",
                args: ["{that}", "{arguments}.0", "{arguments}.1"] // destination, payload
            }
        },
        modelListeners: {
            chordKey: {
                funcName:      "cheatar.arpeggiator.updateKeyChords",
                args:          ["{that}"],
                excludeSource: "init"
            },
            // playingChord: {
            //     funcName:      "cheatar.arpeggiator.updateKeyChords",
            //     args:          ["{that}"],
            //     excludeSource: "init"
            // },
            chordScale: {
                funcName:      "cheatar.arpeggiator.updateKeyChords",
                args:          ["{that}"],
                excludeSource: "init"
            }
        },
        listeners: {
            "onCreate.updateKeyChords": {
                funcName: "cheatar.arpeggiator.updateKeyChords",
                args:     ["{that}"]
            }
        }
    });
})(fluid);
