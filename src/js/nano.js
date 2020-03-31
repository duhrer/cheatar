/* The "nano cheatar", designed to be played headless with a nanopad (1st gen).
/* globals flock */
(function (fluid) {
    "use strict";

    var cheatar = fluid.registerNamespace("cheatar");
    fluid.registerNamespace("cheatar.nano");

    // 1. sets the active chord on a single press or hold
    // 2. changes the key on a double press
    cheatar.nano.handleNote = function (that, midiMessage) {
        if (midiMessage.type === "noteOn" && midiMessage.velocity > 0) {
            var now = Date.now();
            var lastPressed = that.lastPressed[midiMessage.note];

            // Calculate "offset from E", i.e. (note + 8) % 12, so that middle C (60) has an offset of 8, for example.
            var offsetFromE = (midiMessage.note + 8) % 12;
            var note = that.options.notesByOffset[offsetFromE];

            // Double press, i. e. key change
            if (lastPressed && (now - lastPressed ) < that.options.doubleTapCutoff ) {
                // Then calculate the nearest E by subtracting the offset from the note, i.e. 60 - 8 = 52 = E3
                var rootE = midiMessage.note - offsetFromE + that.options.masterTuningOffset;

                // If we are the active key, change the variation.
                if (offsetFromE === that.offsetFromE) {
                    var newVariation    = (that.chordVariation + 1) % that.options.chordVariations.length;
                    that.chordVariation = newVariation;
                }
                // If we're not the active key, change that and reset the variation.
                else {
                    that.offsetFromE    = offsetFromE;
                    that.chordVariation = 0;
                }
                that.rootE   = rootE;

                // Only the active chord is tracked for changes, pass that along now.  Use the root of the key.
                var variation = that.options.chordVariations[that.chordVariation];
                var chord = note + variation;
                that.applier.change("key", chord);
            }
            // Single press, change the chord within the key.
            else {
                var noteChordVariationInKey = fluid.get(cheatar.nano.keyChords, [that.model.key, note]);
                if (noteChordVariationInKey) {
                    that.applier.change("chord", note + noteChordVariationInKey);
                }
                // If a chord is not part of the current key, that button acts as a mute for all notes.
                else {
                    that.muteAll();
                }
            }

            that.lastPressed[midiMessage.note] = now;
        }
    };

    cheatar.nano.handleControl = function (harnessComponent, midiMessage) {
        if (midiMessage.number === 1) {
            var stringIndex = fluid.model.transformWithRules(midiMessage, harnessComponent.options.rules.modWheelToStringIndex);
            harnessComponent.applier.change("activeString", stringIndex);
        }
    };

    // TODO: Add some kind of realistic aftertouch-based decay.
    cheatar.nano.pluckString = function (harnessComponent) {
        // An activeString of -1 indicates a non-playing buffer region
        if (harnessComponent.model.activeString !== -1) {
            // An offset of -1 indicates that a string is not played in a particular chord.
            var stringOffset = harnessComponent.chordStringOffsets[harnessComponent.model.activeString];
            if (stringOffset !== -1) {
                var noteToPlay = harnessComponent.rootE + stringOffset;
                harnessComponent.sendNoteOn(noteToPlay);
            }
        }
    };

    cheatar.nano.muteAll = function (harnessComponent) {
        fluid.each(harnessComponent.chordStringOffsets, function (singleStringOffset) {
            harnessComponent.sendNoteOff(harnessComponent.rootE + singleStringOffset);
        });
    };

    cheatar.nano.noteFromChord = function (chord) {
        var matches = chord.match(/^([A-Z]#?)/);
        return matches ? matches[1] : chord;
    };

    cheatar.nano.sendNote = function (outputComponent, note, type) {
        // Yet again, we do this check so often, we need a real pattern for it.
        var connection = fluid.get(outputComponent, "connection");
        if (connection) {
            connection.send({
                channel: 0, // TODO: Read this from input?
                type: type,
                note: note,
                velocity: 100 // TODO: Come with a rationale for the velocity value, perhaps by tracking the velocity across the pad.
            });
        }
    };

    // 1. Silences all notes in the previous chord.
    // 2. Recalculates the string offsets for the current chord relative to the nearest E.
    cheatar.nano.chordChange = function (that) {
        fluid.log("chord change:", that.model.chord);

        that.muteAll();
        var chordDef = cheatar.nano.chords[that.model.chord];
        fluid.each(chordDef, function (singleStringOffset, index) {
            var adjustedOffset = singleStringOffset === -1 ? -1 : (singleStringOffset + that.options.stringOffsets[index]);
            that.chordStringOffsets[index] = adjustedOffset;
        });

        cheatar.nano.updateSelectedChord(that);
    };

    /*
        <div class="nano-pad cell medium-2 out-of-key" id="nano-pad-A#">
            <div class="chord-note">A#</div>
            <div class="chord-variation">-</div>
        </div>
     */

    cheatar.nano.updateSelectedChord = function (that) {
        var allPads = that.locate("nanoPads");
        allPads.removeClass("selected-chord");

        var note = cheatar.nano.noteFromChord(that.model.chord);
        var chordElement = that.locate(note);
        chordElement.addClass("selected-chord");
    };

    cheatar.nano.keyChange = function (that) {
        that.applier.change("chord", that.model.key);

        cheatar.nano.updateSelectedKey(that);
    };

    cheatar.nano.updateSelectedKey = function (that) {
        var allPads = that.locate("nanoPads");
        allPads.removeClass("selected-key");
        allPads.removeClass("out-of-key");

        var keyNote = cheatar.nano.noteFromChord(that.model.key);
        var keyNoteElement = that.locate(keyNote);
        keyNoteElement.addClass("selected-key");

        var chordsInKey = cheatar.nano.keyChords[that.model.key];
        fluid.each(that.options.notesByOffset, function (note) {
            var noteElement = that.locate(note);
            var variationLabelElement = noteElement.find(".chord-variation");
            var variation = chordsInKey[note] || "-";
            variationLabelElement.html(variation);
            if (!chordsInKey[note]) {
                noteElement.addClass("out-of-key");
            }
        });
    };

    // TODO: Make a context aware grade that uses the right axes depending on whether a nanopad 1 or 2 is available.
    fluid.defaults("cheatar.nano", {
        gradeNames: ["fluid.modelComponent", "fluid.viewComponent"],
        toggleClass: "hide",
        preferredInputDevice: "nanoPAD PAD", // TODO: Update to use nanopad
        preferredOutputDevice: "EIE",
        masterTuningOffset: -12,
        rules: {
            modWheelToStringIndex: {
                transform: {
                    type: "fluid.transforms.quantize",
                    inputPath: "value",
                    outputPath: "",
                    /*

                        Divide the pad so that there are six "string" regions (with surrounding empty space). The
                        regions for each string are:

                        25-38 39-52 53-66 67-80 81-94 95-108

                     */
                    ranges: [
                        {
                            "upperBound": "24",
                            "output": -1
                        },
                        {
                            "upperBound": "38",
                            "output": 5
                        },
                        {
                            "upperBound": "52",
                            "output": 4
                        },
                        {
                            "upperBound": "66",
                            "output": 3
                        },
                        {
                            "upperBound": "80",
                            "output": 2
                        },
                        {
                            "upperBound": "94",
                            "output": 1
                        },
                        {
                            "upperBound": "108",
                            "output": 0
                        },
                        {
                            "output": -1
                        }
                    ]
                }
            }
        },
        doubleTapCutoff: 250,
        members: {
            rootE: 40,       // E3
            keyVariation: 0, // major
            lastPressed: {},
            offsetFromE: 4,
            // Gmaj, relative to E3
            chordStringOffsets: [3, 7, 10, 15, 19, 27]
        },
        model: {
            key:   "Gmaj",
            chord: "Gmaj",
            activeString: -1
        },
        stringOffsets: [0, 5, 10, 15, 19, 24],
        notesByOffset: ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"],
        chordVariations: ["maj", "min"], // TODO: Add 7th, etc.
        selectors: {
            midiInputSelector:  "#input-selector",
            midiOutputSelector: "#output-selector",
            nanoPads: ".nano-pad",
            "E":  "#nano-pad-E",
            "E#": "#nano-pad-E\\#",
            "F":  "#nano-pad-F",
            "F#": "#nano-pad-F\\#",
            "G":  "#nano-pad-G",
            "G#": "#nano-pad-G\\#",
            "A":  "#nano-pad-A",
            "A#": "#nano-pad-A\\#",
            "B":  "#nano-pad-B",
            "C":  "#nano-pad-C",
            "C#": "#nano-pad-C\\#",
            "D":  "#nano-pad-D",
            "D#": "#nano-pad-D\\#"
        },
        modelListeners: {
            "key": {
                funcName: "cheatar.nano.keyChange",
                args: ["{that}"],
                excludeSource: "init"
            },
            "chord": {
                funcName: "cheatar.nano.chordChange",
                args: ["{that}"],
                excludeSource: "init"
            },
            "activeString": {
                funcName: "cheatar.nano.pluckString",
                args: ["{that}"],
                excludeSource: "init"
            }
        },
        invokers: {
            muteAll: {
                funcName: "cheatar.nano.muteAll",
                args: ["{that}"]
            },
            sendNoteOn: {
                funcName: "cheatar.nano.sendNote",
                args: ["{midiOutputSelector}", "{arguments}.0", "noteOn"] // outputComponent, note, type
            },
            sendNoteOff: {
                funcName: "cheatar.nano.sendNote",
                args: ["{midiOutputSelector}", "{arguments}.0", "noteOff"] // outputComponent, note, type
            }
        },
        components: {
            enviro: "{flock.enviro}",
            midiInputSelector: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.midiInputSelector",
                options: {
                    preferredDevice: "{cheatar.nano}.options.preferredInputDevice",
                    portType: "input",
                    strings: {
                        selectBoxLabel: "MIDI Input:"
                    },
                    components: {
                        connection: {
                            options: {
                                listeners: {
                                    note: {
                                        funcName: "cheatar.nano.handleNote",
                                        args:     ["{cheatar.nano}", "{arguments}.0"]
                                    },
                                    control: {
                                        funcName: "cheatar.nano.handleControl",
                                        args:     ["{cheatar.nano}", "{arguments}.0"]
                                    }
                                },
                                sysex: true
                            }
                        }
                    }
                }
            },
            midiOutputSelector: {
                type: "jv.connector",
                container: "{that}.dom.midiOutputSelector",
                options: {
                    preferredDevice: "{cheatar.nano}.options.preferredOutputDevice",
                    portType: "output",
                    strings: {
                        selectBoxLabel: "MIDI Output:"
                    },
                    distributeOptions: {
                        source: "{that}.options.selectBoxLabel",
                        target: "{that fluid.ui.selectbox}.options.strings.selectBoxLabel"
                    }
                }
            }
        }
    });
})(fluid);
