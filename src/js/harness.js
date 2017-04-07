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
                    "noteOff.passToSynth": "{synth}.noteOff()"
                }
            }
        },
        chordControls: {
            type: "fluid.viewComponent",
            container: ".chord-controls",
            options: {
                model: {
                    chordKey:     "{synth}.model.chordKey",
                    chordScale:   "{synth}.model.chordScale",
                    chordType:    "{synth}.model.chordType",
                    playingChord: "{synth}.model.playingChord"
                },
                selectors: {
                    "chordKey":     ".chord-key",
                    "chordScale":   ".chord-scale",
                    "chordType":    ".chord-manual-type",
                    "playingChord": ".chord-playing"
                },
                bindings: {
                    "chordKey":     "chordKey",
                    "chordScale":   "chordScale",
                    "chordType":    "chordType",
                    "playingChord": "playingChord"
                },
                listeners: {
                    "onCreate.applyBindings": {
                        "funcName": "gpii.binder.applyBinding",
                        "args":     "{that}"
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
