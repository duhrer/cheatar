/*

 A harness to handle passing "noteOn", "noteOff", and "pitchbend" events to a synth.  Designed to work with grades
 that extend `cheatar`.

 */
"use strict";
var fluid = fluid || require("infusion");
var flock = flock || require("flocking");

var environment = flock.init(); // eslint-disable-line no-unused-vars

var cheatar = fluid.registerNamespace("cheatar");

fluid.registerNamespace("cheatar.harness");

cheatar.harness.bendPitch = function (synth, value) {
    var scaledValue = (value / 128) - 64;
    synth.set("pitchbend.value", scaledValue );
};

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
                            "{arguments}.0.note",
                            {
                                "freq.note": "{arguments}.0.note",
                                "amp.velocity": "{arguments}.0.velocity"
                            }
                        ]
                    },
                    "noteOff.passToSynth": "{synth}.noteOff({arguments}.0.note)",
                    "pitchbend.passToSynth": {
                        funcName: "cheatar.harness.bendPitch",
                        args:     ["{synth}", "{arguments}.0.value"]
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
