// A generic component that controls and updates a single drop-down field based on a single model variable.
/* global fluid */
(function () {
    "use strict";
    var cheatar = fluid.registerNamespace("cheatar");

    fluid.registerNamespace("cheatar.select");

    cheatar.select.renderMarkup = function (that) {
        var selectOptionsSorted = fluid.copy(that.options.select);
        selectOptionsSorted.options = fluid.parsePriorityRecords(selectOptionsSorted.options, "select option");
        that.renderMarkup("initial", that.options.template, selectOptionsSorted);
    };

    fluid.defaults("cheatar.select", {
        gradeNames: ["gpii.handlebars.templateAware.standalone"],
        priorityName: "select option",
        selectors:  {
            initial: "",
            select:  "select"
        },
        templates: {
            pages: {
                "select": "<select>{{#each options}}<option value='{{value}}'>{{label}}</option>\n{{/each}}</select>"
            }
        },
        template: "select",
        bindings: {
            select:  "select"
        },
        invokers: {
            renderInitialMarkup: {
                funcName: "cheatar.select.renderMarkup",
                args:     ["{that}"]
            }
        },
        modelListeners: {
            select: {
                func:          "{that}.renderInitialMarkup",
                excludeSource: "init"
            }
        }
    });
})();
