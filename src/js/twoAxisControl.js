/*

    A client-side component to change two sets of values using either the arrow keys or an x-shaped click map.

 */
"use strict";
(function ($, fluid) {
    var cheatar = fluid.registerNamespace("cheatar");
    fluid.registerNamespace("cheatar.twoAxisControl");

    cheatar.twoAxisControl.incrementAxis = function (that, axisKey, increment) {
        increment = increment || 1;
        var possibleAxisValues  = that.options.possibleValues[axisKey];
        var currentIndex = that.model.selectedIndex[axisKey];
        var newIndex     = currentIndex + increment;
        if (newIndex > (possibleAxisValues.length - 1) || newIndex < 0) {
            if (that.options.wrap[axisKey]) {
                if (newIndex > possibleAxisValues.length - 1 ) {
                    newIndex = 0;
                }
                else {
                    newIndex = possibleAxisValues.length - 1;
                }
            }
            else {
                newIndex = currentIndex;
            }
        }

        that.applier.change("selectedIndex." + axisKey, newIndex);
        that.applier.change("axisValue." + axisKey, possibleAxisValues[newIndex]);
    };

    cheatar.twoAxisControl.handleClick = function (that, event) {
        // If we are targeting a child element (such as the key), we should pass the event on to the parent.
        if (event.target !== event.currentTarget) {
            event.currentTarget.click(event);
            return false;
        }

        var x      = event.offsetX;
        var y      = event.offsetY;
        var width  = event.currentTarget.offsetWidth;
        var height = event.currentTarget.offsetHeight;

        var xPct   = x / width;
        var yPct   = y / height;


        /*
            1. "up" occurs when x > y && x < (height - y)
            2. "right" occurs when x > y && x > (height - y)
            3. "down" occurs when x < y && x > (height - y)
            4. "left" occurs when x < y && x < (height -y)
        */
        // TODO: Adjust, the "up" and "down" controls are too greedy.  The effective "right" and "left" zones are very small.
        if (xPct > yPct) {
            // "up"
            if (xPct < (1 - yPct)) {
                cheatar.twoAxisControl.incrementAxis(that, "y", -1);
            }
            // "right"
            else {
                cheatar.twoAxisControl.incrementAxis(that, "x", 1);
            }
        }
        else {
            // "down"
            if (xPct > (1 - yPct)) {
                cheatar.twoAxisControl.incrementAxis(that, "y", 1);
            }
            // "left"
            else {
                cheatar.twoAxisControl.incrementAxis(that, "x", -1);
            }
        }

        return false;
    };

    // TODO: Figure out why this isn't binding and/or firing.
    // TODO: Add arrow handling and ijkm alternates.
    cheatar.twoAxisControl.handleKeyPress = function (that, event) {
        fluid.log("keypress", event);

        // TODO:  Confirm that we don't trap key presses.
    };

    fluid.defaults("cheatar.twoAxisControl", {
        gradeNames: ["gpii.handlebars.templateAware.standalone"],
        selectors: {
            viewport: ""
        },
        templates: {
            layouts: {
                main: "{{body}}"
            },
            pages: {
                "main": "<h1>{{model.axisValue.x}}</h1>\n<h3>{{model.axisValue.y}}</h3>"
            }
        },
        wrap: {
            x: true,
            y: true
        },
        possibleValues: {
            x: [],
            y: []
        },
        model: {
            selectedIndex: {
                x: 0,
                y: 0
            },
            axisValue: {
                x: false,
                y: false
            }
        },
        invokers: {
            handleKeyPress: {
                funcName: "cheatar.twoAxisControl.handleKeyPress",
                args:     ["{that}", "{arguments}.0"] // event
            },
            handleClick: {
                funcName: "cheatar.twoAxisControl.handleClick",
                args:     ["{that}", "{arguments}.0"] // event
            },
            renderInitialMarkup: {
                func: "{that}.renderMarkup",
                args: [
                    "viewport",
                    "main",
                    { possibleValues: "{that}.options.possibleValues", model: "{that}.model"},
                    "html"
                ] //  selector, template, data, manipulator
            }
        },
        listeners: {
            "onCreate.wireControls": [
                {
                    "this": "{that}.dom.viewport",
                    method: "keypress",
                    args:   "{that}.handleKeyPress"
                },
                {
                    "this": "{that}.dom.viewport",
                    method: "click",
                    args:   "{that}.handleClick"
                }
            ]
        },
        modelListeners: {
            axisValue: {
                func: "{that}.renderInitialMarkup"
            }
        }
    });
})(jQuery, fluid);
