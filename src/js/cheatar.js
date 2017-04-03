/*

    The "cheatar" is made up of individual "strings", single-voice instruments.

 */
"use strict";
var fluid = fluid || require("infusion");
var cheatar = fluid.registerNamespace("cheatar");

// TODO:  Figure out how to control things other than a polyphonic synth.  We need a cleaner sounding synth, for starters.
fluid.defaults("cheatar.string", {
    gradeNames: ["flock.synth.polyphonic"],
    maxVoices: 1,
    synthDef: {
        "ugen": "flock.ugen.sinOsc",
        freq: {
            id: "modwheel",
            ugen: "flock.ugen.sinOsc",
            freq: {
                id:   "freq",
                ugen: "flock.ugen.midiFreq",
                // The "chord" offset
                add: {
                    ugen: "flock.ugen.value",
                    rate: "audio",
                    id:    "chord",
                    value: 0,
                    // The pitch offset we control using "pitchbend" events.
                    add: {
                        ugen:  "flock.ugen.value",
                        rate:  "audio",
                        id:    "pitchbend",
                        value: 0,
                        add:   -64,
                        mul:   0.5 // half "step" in either direction
                    }
                }
            },
            phase: 0.0,
            mul: 500,
            add: 0
        },
        mul: {
            id: "amp",
            ugen: "flock.ugen.midiAmp",
            velocity: 100,
            mul: {
                id:      "env",
                ugen:    "flock.ugen.asr",
                attack:  0.05,
                sustain: 1.0,
                release: 0.25,
                // Convenient place to let us control the volume
                mul: {
                    id: "volume",
                    ugen: "flock.ugen.value",
                    value: 4
                }
            }
        }
    }
});

cheatar.sendToComponentsWithGrade = function (that, fnName, gradeName, args) {
    var synths = fluid.queryIoCSelector(that, gradeName);

    // TODO: Modularize this to be a configurable thing.
    var chordPattern = [0, 4, 7]; // major chord
    var delayPattern = [0, 100, 200];


    // TODO:  Make this send different notes to each synth (and silence unused synths).
    fluid.each(synths, function (synth, index) {
        var modifiedArgs = fluid.copy(fluid.makeArray(args));
        if ((index < chordPattern.length) && modifiedArgs.length > 1) {
            // TODO: Make this change a separate offset comparable to the pitchbend, so that both work.
            modifiedArgs[1]["chord.value"] = chordPattern[index];
            // var offset = chordPattern[index];
            // // In other words, add "additional.offset": offset to modifiedArgs[1] and call it a day.
            // if (modifiedArgs[0]) {
            //     modifiedArgs[0] += offset;
            // }
            // if (modifiedArgs[1] && modifiedArgs[1]["freq.note"]) {
            //     modifiedArgs[1]["freq.note"] += offset;
            // }
            setTimeout(function () {
                synth[fnName].apply(synth, fluid.makeArray(modifiedArgs));
            }, delayPattern[index]);
        }
    });
};

fluid.defaults("cheatar", {
    gradeNames: ["flock.band"],
    invokers: {
        noteOn: {
            funcName: "cheatar.sendToComponentsWithGrade",
            args: ["{that}", "noteOn", "cheatar.string", "{arguments}"]
        },
        noteOff: {
            funcName: "cheatar.sendToComponentsWithGrade",
            args: ["{that}", "noteOff", "cheatar.string", "{arguments}"]
        }
    },
    components: {
        string1: { type: "cheatar.string" },
        // string2: { type: "cheatar.string" },
        // string3: { type: "cheatar.string" },
        // string4: { type: "cheatar.string" },
        // string5: { type: "cheatar.string" }
    }
});

