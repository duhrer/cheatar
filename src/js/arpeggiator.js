/* global require */
(function (fluid) {

    "use strict";
    fluid = fluid || require("infusion");
    var cheatar = fluid.registerNamespace("cheatar");

    fluid.registerNamespace("cheatar.arpeggiator");
    cheatar.arpeggiator.playChord  = function (that, destination, payload) {
        cheatar.arpeggiator.clearAllTimeouts(that);

        var midiNote     = cheatar.arpeggiator.midiNoteToKey(payload.note);
        var modifier     = "none";

        if (that.model.chordScale !== "none") {
            var fullChordName = that.model.chordKey + that.model.chordScale;
            modifier = fluid.get(that.options.chordKeyModifiers, [fullChordName, midiNote]) || that.model.chordScale;
        }

        var chordPattern = that.options.chords[modifier];
        var playingChord = midiNote + modifier;
        that.applier.change(["playingNotes", midiNote], true);
        that.applier.change("playingChord", playingChord);

        // Adjust the strum duration so that harder strums are played more quickly.  The hardest note is played 50%
        // faster, the softest is played 50% slower.
        var velocityAdjust = ((63.5 - payload.velocity) / 127) * that.model.strumDuration;
        var msBetweenStrings = (that.model.strumDuration + velocityAdjust) / (chordPattern.length + 1);
        fluid.each(chordPattern, function (chordOffset, stringIndex) {
            var delayMs = stringIndex * msBetweenStrings;
            that.activeTimeouts[stringIndex] = setTimeout(cheatar.arpeggiator.playSingleString, delayMs, that, stringIndex, payload, chordOffset, destination);
        });
    };

    cheatar.arpeggiator.playSingleString = function (that, stringIndex, originalPayload, chordOffset, destination) {
        var singleNoteNoteOn = fluid.copy(originalPayload);

        // If this string is already playing, turn it off.
        if (that.stringNotes[stringIndex]) {
            destination.send({ channel: 0, type: "noteOff", velocity: 0, note: that.stringNotes[stringIndex]});
        }

        singleNoteNoteOn.channel = 0;
        singleNoteNoteOn.note += chordOffset;

        that.stringNotes[stringIndex] = singleNoteNoteOn.note;
        destination.send(singleNoteNoteOn);
    };

    cheatar.arpeggiator.handleNoteOn = function (that, destination, payload) {
        // Change the key to the played note.
        if (that.model.changingKeys) {
            var midiNote     = cheatar.arpeggiator.midiNoteToKey(payload.note);
            var currentChord = that.model.chordKey + that.model.chordScale;
            var newChordScale = that.options.chordKeyModifiers[currentChord][midiNote];

            that.applier.change("chordKey", midiNote);
            that.applier.change("chordScale", newChordScale);
            that.applier.change("changingKeys", false);
        }
        // Play the chord once.
        else {
            cheatar.arpeggiator.playChord(that, destination, payload);
        }
    };

    cheatar.arpeggiator.clearAllTimeouts = function (that) {
        fluid.each(that.activeTimeouts, function (timeout) {
            if (timeout) {
                clearTimeout(timeout);
            }
        });
        that.activeTimeouts = [];
    };

    cheatar.arpeggiator.handleNoteOff = function (that, destination, payload) {
        var midiNote     = cheatar.arpeggiator.midiNoteToKey(payload.note);

        that.applier.change(["playingNotes", midiNote], false);

        that.applier.change("playingChord", false);

        cheatar.arpeggiator.clearAllTimeouts(that);

        fluid.each(that.stringNotes, function (stringNote) {
            if (stringNote) {
                destination.send({ channel: 0, type: "noteOff", velocity: 0, note: stringNote});
            }
        });
        that.stringNotes = [];
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

    // TODO:  Get rid of the "none" pattern in favor of playing notes directly when arpeggiation is disabled.  Also, explicitly clobber any notes playing at the moment when arpeggiation is toggled.
    cheatar.arpeggiator.disableArpeggiation = function (that) {
        cheatar.arpeggiator.clearAllTimeouts(that);
        if (that.model.arpeggiation) {
            that.applier.change("chordScale", that.lastActiveChordScale);
        }
        else {
            that.lastActiveChordScale = that.model.chordScale;
            that.applier.change("chordScale", "none");
        }
    };

    fluid.defaults("cheatar.arpeggiator", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            chordKey:      "C",
            keyChords:     "{that}.options.chordKeyModifiers.Cmajor",
            chordScale:    "major",
            playingChord:  "-",
            strumDuration: 100,
            arpeggiation:  true
        },
        members: {
            activeTimeouts: [],
            stringNotes: [],
            lastActiveChordScale: "major"
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
        chordKeyModifiers: cheatar.keyChords,
        chords: {
            // Thanks to http://edmprod.com/different-chord-types/ for an excellent explanation of various chords.
            //none:     [0],
            //major:    [0, 4, 7],
            //minor:    [0, 3, 7],
            //major7:   [0, 4, 7, 11],
            //minor7:   [0, 3, 7, 10],
            //dom7:     [0, 4, 7, 10],
            //maj6:     [0, 4, 7, 9],
            //min6:     [0, 3, 7, 9],
            //sus4:     [0, 5, 7],
            //ninth:    [0, 4, 7, 13],
            //dim:      [0, 3, 6],
            //aug:      [0, 4, 8],
            //halfDim7: [0, 3, 6, 10]
            // TODO: Reenter harmonic minor chord keys and associate chords
            // TODO: Extract chord data to "holder" grade and restructure for easier reuse.
            // More guitar-like four-note chords.
            none:     [0],
            major:    [0, 7, 12, 16],
            minor:    [0, 7, 12, 15],
            major7:   [0, 7, 11, 16],
            minor7:   [0, 7, 10, 15],
            dom7:     [0, 7, 10, 16],
            maj6:     [0, 7,  9, 16],
            min6:     [0, 7,  9, 15],
            sus4:     [0, 7, 12, 17],
            ninth:    [0, 7, 13, 16],
            dim:      [0, 6, 12, 15],
            aug:      [0, 8, 12, 16],
            halfDim7: [0, 6, 10, 15]
        },
        // TODO: Add strum patterns, low to high, high to low, low to high to low.
        invokers: {
            noteOn: {
                funcName: "cheatar.arpeggiator.handleNoteOn",
                args: ["{that}", "{arguments}.0", "{arguments}.1"] // destination, payload
            },
            noteOff: {
                funcName: "cheatar.arpeggiator.handleNoteOff",
                args: ["{that}", "{arguments}.0", "{arguments}.1"] // destination, payload
            }
        },
        modelListeners: {
            chordKey: {
                funcName:      "cheatar.arpeggiator.updateKeyChords",
                args:          ["{that}"],
                excludeSource: "init"
            },
            chordScale: {
                funcName:      "cheatar.arpeggiator.updateKeyChords",
                args:          ["{that}"]
            },
            arpeggiation: {
                funcName:      "cheatar.arpeggiator.disableArpeggiation",
                args:          ["{that}"],
                excludeSource: "init"
            }
        }
    });
})(fluid);
