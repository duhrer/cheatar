/*

 A harness to handle passing "noteOn", "noteOff", and "pitchbend" events to a synth.  Designed to work with grades
 that extend `cheatar`.

 */
/* globals flock */
(function (fluid, flock) {
    // TODO: Add appropriate control code listener to enable key change from compatible keyboard.
    "use strict";
    //var environment = flock.init(); // eslint-disable-line no-unused-vars

    var cheatar = fluid.registerNamespace("cheatar");
    fluid.registerNamespace("cheatar.harness");

    cheatar.harness.filterKeyPress = function (that, event) {
        if (event.keyCode === 13) {
            that.performToggle(event);
        }
    };

    cheatar.harness.performToggle = function (that, event) {
        event.preventDefault();

        var elementToToggle = that.locate("optionsPanel");

        $(elementToToggle).toggleClass(that.options.toggleClass);
    };

    cheatar.harness.relayRawMessage = function (that, payload) {
        var payloadAsJson = flock.midi.read(payload);
        var destination = fluid.get(that, "midiOutputSelector.connection");
        if (destination) {
            if (payloadAsJson.type === "noteOn") {
                that.arpeggiator.noteOn(destination, payloadAsJson);
            }
            else if (payloadAsJson.type === "noteOff") {
                that.arpeggiator.noteOff(destination, payloadAsJson);
            }
            else {
                destination.sendRaw(payload);
            }
        }
    };

    cheatar.harness.relayScreenInput = function (that, key, isOn) {
        var destination = fluid.get(that, "midiOutputSelector.connection");
        if (destination) {
            var note = cheatar.arpeggiator.keyToMidiNote(key + that.model.octave);
            var payload = {
                note: note,
                type: isOn ? "noteOn" : "noteOff"
            };
            if (isOn) {
                payload.velocity = 125;
            }
            that.arpeggiator[isOn ? "noteOn" : "noteOff"](destination, payload);
        }
    };

    fluid.defaults("cheatar.harness", {
        gradeNames: ["fluid.viewComponent"],
        pitchbendTarget: "pitchbend.value",
        toggleClass: "hide",
        preferredInputDevice: "Beatstep (Black) Arturia BeatStep", // TODO: Update to use nanopad
        preferredOutputDevice: "sforzando", // TODO: Update to whatever instrument we end up using for reals.
        model: {
            octave:        3,
            strumDuration: 150,
            playingNotes:  {},
            playingScreenNotes: {},
            arpeggiation: "{arpeggiator}.model.arpeggiation"
        },
        selectors: {
            midiInputSelector:  "#input-selector",
            midiOutputSelector: "#output-selector",
            optionsToggle:      "#options-toggle",
            optionsPanel:       "#options-panel",
            arpeggiationToggle: "#strumming-on-off"
        },
        bindings: {
            "arpeggiationToggle": {
                selector: "arpeggiationToggle",
                path:     "arpeggiation",
                rules: {
                    domToModel: {
                        "": {
                            transform: {
                                type: "gpii.binder.transforms.checkToBoolean",
                                inputPath: ""
                            }
                        }
                    },
                    modelToDom: {
                        "": {
                            transform: {
                                type: "gpii.binder.transforms.booleanToCheck",
                                inputPath: ""
                            }
                        }
                    }
                }
            }
        },
        components: {
            enviro: "{flock.enviro}",
            arpeggiator: {
                type: "cheatar.arpeggiator",
                options: {
                    model: {
                        //changingKeys: "{keyChordDisplay}.model.changingKeys",
                        //playingNotes: "{keyChordDisplay}.model.playingNotes"
                    }
                }
            },
            midiInputSelector: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.midiInputSelector",
                options: {
                    preferredDevice: "{harness}.options.preferredInputDevice",
                    portType: "input",
                    strings: {
                        selectBoxLabel: "MIDI Input:"
                    },
                    components: {
                        connection: {
                            options: {
                                listeners: {
                                    raw: {
                                        funcName: "cheatar.harness.relayRawMessage",
                                        args:     ["{harness}", "{arguments}.0.data"]
                                    }
                                },
                                sysex: true
                            }
                        }
                    }
                }
            },
            midiOutputSelector: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.midiOutputSelector",
                options: {
                    preferredDevice: "{harness}.options.preferredOutputDevice",
                    portType: "output",
                    strings: {
                        selectBoxLabel: "MIDI Output:"
                    },
                    distributeOptions: {
                        source: "{that}.options.selectBoxLabel",
                        target: "{that fluid.ui.selectbox}.options.strings.selectBoxLabel"
                    },
                    components: {
                        connection: {
                            options: {
                                sysex: true
                            }
                        }
                    }
                }
            },
            keyChangeControls: {
                type: "cheatar.keyChangeButton",
                container: ".key-change-controls"
            },
            keyChordDisplay: {
                type: "cheatar.keyChordDisplay",
                container: ".key-chord-display",
                options: {
                    model: {
                        playingScreenNotes: "{harness}.model.playingScreenNotes",
                        playingNotes:       "{harness}.model.playingNotes",
                        keyChords:          "{arpeggiator}.model.keyChords",
                        chordKey:           "{arpeggiator}.model.chordKey",
                        chordScale:         "{arpeggiator}.model.chordScale",
                        changingKeys:       "{keyChangeControls}.model.changingKeys"
                    }
                }
            },
            strumPatternControl: {
                type: "cheatar.select",
                container: ".strum-pattern-controls",
                options: {
                    // TODO: Wire this into the arpeggiator's model once we have support for strum patterns.
                    select: {
                        options: {
                            lowToHigh: {
                                label: "Low to High",
                                value: "lowHigh"
                            },
                            none: {
                                label: "Finger Picking",
                                value: "none"
                            }
                        }
                    }
                }
            },
            strumLengthControl: {
                type: "fluid.textfieldSlider",
                container: ".strum-length-slider",
                options: {
                    scale: 0,
                    model: {
                        step: 25,
                        range: {
                            min: 25,
                            max: 2500
                        },
                        value: "{arpeggiator}.model.strumDuration"
                    }
                }
            },
            scaleControl: {
                type: "cheatar.select",
                container: ".scale-controls",
                options: {
                    model: {
                        select: "{arpeggiator}.model.chordScale"
                    },
                    select: {
                        options: {
                            none:     { label: "none", value: "none"},
                            major:    { label: "major", value: "major"},
                            minor:    { label: "minor", value: "minor"}
                            // TODO: Figure out why these don't work.
                            // major7:   { label: "major7", value: "major7"},
                            // minor7:   { label: "minor7", value: "minor7"},
                            // dom7:     { label: "dom7", value: "dom7"},
                            // maj6:     { label: "maj6", value: "maj6"},
                            // min6:     { label: "min6", value: "min6"},
                            // sus4:     { label: "sus4", value: "sus4"},
                            // ninth:    { label: "ninth", value: "ninth"},
                            // dim:      { label: "dim", value: "dim"},
                            // aug:      { label: "aug", value: "aug"},
                            // halfDim7: { label: "halfDim7", value: "halfDim7"}
                        }
                    }
                }
            },
            octaveControl: {
                type: "fluid.textfieldSlider",
                container: ".octave-slider",
                options: {
                    scale: 0,
                    model: {
                        step: 1,
                        range: {
                            min: 0,
                            max: 7
                        },
                        value: "{harness}.model.octave"
                    }
                }
            }
        },
        invokers: {
            filterKeyPress: {
                funcName: "cheatar.harness.filterKeyPress",
                args:     ["{that}", "{arguments}.0"] // event
            },
            performToggle: {
                funcName: "cheatar.harness.performToggle",
                args:     ["{that}", "{arguments}.0"] // event
            }
        },
        modelListeners: {
            "playingScreenNotes.*": {
                funcName: "cheatar.harness.relayScreenInput",
                args:     ["{that}", "{change}.path.1", "{change}.value"] // that, key, isOn)
            }
        },
        listeners: {
            "onCreate.bindKeyPress": {
                "this": "{that}.dom.optionsToggle",
                method: "keydown",
                args:   ["{that}.filterKeyPress"]
            },
            "onCreate.bindToggle": {
                "this": "{that}.dom.optionsToggle",
                method: "click",
                args:   ["{that}.performToggle"]
            },
            "onCreate.applyBinding":  {
                "funcName": "gpii.binder.applyBinding",
                "args":     ["{that}"]
            }
        }
    });
})(fluid, flock);
