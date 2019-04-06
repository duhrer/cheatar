/*

    A client-side component to change two sets of values using either the arrow keys or an x-shaped click map.

 */
(function ($, fluid) {
    "use strict";
    var cheatar = fluid.registerNamespace("cheatar");
    fluid.registerNamespace("cheatar.keyChangeButton");

    cheatar.keyChangeButton.filterKeys = function (that, event, gatedFunction) {
        if (that.options.monitoredKeyCodes.indexOf(event.which) !== -1) {
            gatedFunction(event);
        }
    };

    cheatar.keyChangeButton.handleKeyChangeButton = function (that) {
        that.applier.change("changingKeys", that.model.changingKeys ? false : true);
    };

    cheatar.keyChangeButton.toggleHighlight = function (that) {
        var buttonElement = that.locate("keyChange");
        if (that.model.changingKeys) {
            buttonElement.addClass("alert");
        }
        else {
            buttonElement.removeClass("alert");
        }
    };

    fluid.defaults("cheatar.keyChangeButton", {
        gradeNames: ["fluid.modelComponent", "fluid.viewComponent"],
        monitoredKeyCodes: [ 32, 13 ], // space bar, enter
        model: {
            changingKeys: false
        },
        selectors: {
            viewport:  "",
            keyChange: ".key-change-button"
        },
        invokers: {
            filterKeys: {
                funcName: "cheatar.keyChangeButton.filterKeys",
                args:     ["{that}", "{arguments}.0", "{arguments}.1"] // event, gatedFn
            },
            handleKeyChangeButtonKeyDown: {
                func: "{that}.filterKeys",
                args: ["{arguments}.0", "{that}.handleKeyChangeButton"] // event, gatedFn
            },
            handleKeyChangeButton: {
                funcName: "cheatar.keyChangeButton.handleKeyChangeButton",
                args:     ["{that}"]
            }
        },
        modelListeners: {
            changingKeys: {
                funcName: "cheatar.keyChangeButton.toggleHighlight",
                args: ["{that}"]
            }
        },
        listeners: {
            "onCreate.wireKeyChangeMouseDown": {
                "this": "{that}.dom.keyChange",
                method: "on",
                args:   ["mousedown touchstart", "{that}.handleKeyChangeButton"]
            },
            "onCreate.wireKeyChangeKeyDown": {
                "this": "{that}.dom.keyChange",
                method: "on",
                args:   ["keydown", "{that}.handleKeyDown", "{that}.handleKeyChangeButton"]
            }
        }
    });
})(jQuery, fluid);
