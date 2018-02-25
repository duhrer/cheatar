/*

    A client-side component to change two sets of values using either the arrow keys or an x-shaped click map.

 */
(function ($, fluid) {
    "use strict";
    var cheatar = fluid.registerNamespace("cheatar");
    fluid.registerNamespace("cheatar.keyChordDisplay");

    cheatar.keyChordDisplay.filterKeys = function (that, event, gatedFunction) {
        if (that.options.monitoredKeyCodes.indexOf(event.which) !== -1) {
            gatedFunction(event);
        }
    };

    cheatar.keyChordDisplay.keyOff = function (that, event) {
        event.preventDefault();
        if (!that.model.changingKeys) {
            var keyElement = event.currentTarget;
            var key = keyElement.getAttribute("key");
            $(keyElement).removeClass("active");
            that.applier.change(["playingNotes", key], true);
            that.applier.change(["playingScreenNotes", key], false);
        }
    };

    cheatar.keyChordDisplay.keyOn = function (that, event) {
        event.preventDefault();
        var keyElement = event.currentTarget;
        var key = keyElement.getAttribute("key");
        if (that.model.changingKeys) {
            that.applier.change("chordKey", key);
            var type = keyElement.getAttribute("type");
            that.applier.change("chordScale", type);
            that.applier.change("changingKeys", false);
        }
        else {
            that.applier.change(["playingNotes", key], true);
            that.applier.change(["playingScreenNotes", key], true);
        }
    };

    cheatar.keyChordDisplay.displayPlayingNotes = function (that) {
        var chordElements = that.locate("keys");
        fluid.each(chordElements, function (singleChordElement) {
            var key = singleChordElement.getAttribute("key");
            if (that.model.playingNotes[key]) {
                $(singleChordElement).addClass("active");
            }
            else {
                $(singleChordElement).removeClass("active");
            }
        });
    };

    fluid.defaults("cheatar.keyChordDisplay", {
        gradeNames: ["gpii.handlebars.templateAware.standalone"],
        monitoredKeyCodes: [ 32, 13 ], // space bar, enter
        model: {
            playingScreenNotes: {},
            changingKeys: false,
            chordKey:     "C"
        },
        selectors: {
            viewport:  "",
            keys:      ".chord"
        },
        templates: {
            layouts: {
                main: "{{body}}"
            },
            pages: {
                "main": "<div class=\"grid-x grid-padding-x grid-margin-x\">\n{{#each .}}<div class='cell small-4'><a key='{{@key}}' type='{{type}}' class='chord{{#equals inKey 1}} inKey{{/equals}}{{#equals isKeyItself 1}} isKeyItself{{/equals}}' align='center' href='#'><h4>{{@key}}</h4><h5>{{type}}</h5></a></div>{{/each}}</div>"
            }
        },
        invokers: {
            renderInitialMarkup: {
                func: "{that}.renderMarkup",
                args: [
                    "viewport",
                    "main",
                    "{that}.model.keyChords",
                    "html"
                ] //  selector, template, data, manipulator
            },
            handleMouseDown: {
                func: "{that}.keyOn",
                args: ["{arguments}.0"] // event
            },
            handleMouseUp: {
                func: "{that}.keyOff",
                args: ["{arguments}.0"] // event
            },
            filterKeys: {
                funcName: "cheatar.keyChordDisplay.filterKeys",
                args:     ["{that}", "{arguments}.0", "{arguments}.1"] // event, gatedFn
            },
            handleKeyDown: {
                func: "{that}.filterKeys",
                args: ["{arguments}.0", "{that}.keyOn"] // event, gatedFn
            },
            handleKeyUp: {
                func: "{that}.filterKeys",
                args: ["{arguments}.0", "{that}.keyOff"] // event, gatedFn
            },
            keyOff: {
                funcName: "cheatar.keyChordDisplay.keyOff",
                args: ["{that}", "{arguments}.0"] // event
            },
            keyOn: {
                funcName: "cheatar.keyChordDisplay.keyOn",
                args: ["{that}", "{arguments}.0"] // event
            }
        },
        modelListeners: {
            keyChords: {
                func: "{that}.renderInitialMarkup"
            },
            playingNotes: {
                funcName: "cheatar.keyChordDisplay.displayPlayingNotes",
                args:     ["{that}"]
            }
        },
        listeners: {
            "onMarkupRendered.wireChordsMouseDown": {
                "this": "{that}.dom.keys",
                method: "on",
                args:   ["mousedown touchstart", "{that}.handleMouseDown"]
            },
            "onMarkupRendered.wireChordsMouseUp": {
                "this": "{that}.dom.keys",
                method: "on",
                args:   ["mouseup touchend", "{that}.handleMouseUp"]
            },
            "onMarkupRendered.wireChordsKeyDown": {
                "this": "{that}.dom.keys",
                method: "on",
                args:   ["keydown", "{that}.handleKeyDown"]
            },
            "onMarkupRendered.wireChordsKeyUp": {
                "this": "{that}.dom.keys",
                method: "on",
                args:   ["keyup", "{that}.handleKeyUp"]
            }
        }
    });
})(jQuery, fluid);
