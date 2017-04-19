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

fluid.defaults("cheatar.harness", {
    gradeNames: ["fluid.viewComponent"],
    pitchbendTarget: "pitchbend.value",
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
            container: "{that}.container",
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
        twoAxisControl: {
            type: "cheatar.twoAxisControl",
            container: ".auto-chord-twoAxisControl",
            options: {
                possibleValues: {
                    x: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
                    y: ["major", "minor", "major7th", "minor7th", "melodicHarmonic", "minorHarmonic"]
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
            type: "cheatar"
        }
    },
    listeners: {
        onCreate: [
            "{that}.enviro.start()"
        ]
    }
});
