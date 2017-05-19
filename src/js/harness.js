/*

 A harness to handle passing "noteOn", "noteOff", and "pitchbend" events to a synth.  Designed to work with grades
 that extend `cheatar`.

 */
"use strict";
var fluid = fluid || require("infusion");
var flock = flock || require("flocking");

var environment = flock.init(); // eslint-disable-line no-unused-vars

var cheatar = fluid.registerNamespace("cheatar");

// TODO: Reintroduce "pitchbend" support

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

fluid.defaults("cheatar.harness", {
    gradeNames: ["fluid.viewComponent"],
    pitchbendTarget: "pitchbend.value",
    toggleClass: "hide",
    model: {
        inversion: "root",
        volume:    36,
        strumDuration: 150,
        pauseDuration: 500
    },
    selectors: {
        midiPortSelector:  "#input-selector",
        optionsToggle:     "#options-toggle",
        optionsPanel:      "#options-panel",
        inversionControls: "#inversion-controls",
        volumeControls:    "#volume-controls"
    },
    bindings: {
        "inversionControls": "inversion",
        "volumeControls":    "volume"
    },
    components: {
        enviro: "{flock.enviro}",
        controller: {
            type: "flock.midi.controller",
            options: {
                components: {
                    synthContext: "{synth}"
                },
                controlMap: {
                    // Modulation wheel
                    "1": {
                        input: "modwheel.add",
                        transform: {
                            mul: 1 / 16
                        }
                    },
                    // Volume control
                    "7": {
                        input: "volume.value",
                        transform: {
                            mul: 1 / 16
                        }
                    }
                }
            }
        },
        midiConnector: {
            type: "flock.ui.midiConnector",
            container: "{that}.dom.midiPortSelector",
            options: {
                listeners: {
                    "noteOn.passToSynth": {
                        func: "{synth}.noteOn",
                        args: [
                            {
                                // "freq.note": "{arguments}.0.note",
                                "note.value": "{arguments}.0.note",
                                "amp.velocity": "{arguments}.0.velocity"
                            }
                        ]
                    },
                    "noteOff.passToSynth": "{synth}.noteOff"
                }
            }
        },
        keyChordDisplay: {
            type: "cheatar.keyChordDisplay",
            container: ".key-chord-display",
            options: {
                model: {
                    keyChords: "{synth}.model.keyChords"
                }
            }
        },
        volumeControl: {
            type: "fluid.textfieldSlider",
            container: ".volume-slider",
            options: {
                model: {
                    value: "{harness}.model.volume"
                }
            }
        },
        strumSpeedControl: {
            type: "fluid.textfieldSlider",
            container: ".strum-slider",
            options: {
                range: {
                    min: 50,
                    max: 500
                },
                sliderOptions: {
                    step: 50
                },
                model: {
                    value: "{harness}.model.strumDuration"
                }
            }
        },
        strumPauseControl: {
            type: "fluid.textfieldSlider",
            container: ".pause-slider",
            options: {
                range: {
                    min: 50,
                    max: 1500
                },
                sliderOptions: {
                    step: 50
                },
                model: {
                    value: "{harness}.model.pauseDuration"
                }
            }
        },
        // TODO: Replace this with separate controls for key / scale
        twoAxisControl: {
            type: "cheatar.twoAxisControl",
            container: ".auto-chord-twoAxisControl",
            options: {
                possibleValues: {
                    x: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
                    y: ["none", "major", "minor", "major7th", "minor7th", "melodicHarmonic", "minorHarmonic"]
                },
                model: {
                    selectedIndex: {
                        x: 0,
                        y: 0
                    },
                    axisValue: {
                        x: "{synth}.model.chordKey",
                        y: "{synth}.model.chordScale"
                    }
                }
            }
        },
        synth: {
            type: "cheatar",
            options: {
                model: {
                    inversion:     "{harness}.model.inversion",
                    volume:        "{harness}.model.volume",
                    strumDuration: "{harness}.model.strumDuration",
                    pauseDuration: "{harness}.model.pauseDuration"
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
    listeners: {
        onCreate: [
            "{that}.enviro.start()",
            {
                "this": "{that}.dom.optionsToggle",
                method: "keydown",
                args:   "{that}.filterKeyPress"
            },
            {
                "this": "{that}.dom.optionsToggle",
                method: "click",
                args:   "{that}.performToggle"
            },
            {
                "funcName": "gpii.binder.applyBinding",
                "args":     "{that}"
            }
        ]
    }
});
