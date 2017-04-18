/*

    A client-side component to change two sets of values using either the arrow keys or an x-shaped click map.

 */
"use strict";
(function ($, fluid) {
    fluid.defaults("cheatar.keyChordDisplay", {
        gradeNames: ["gpii.handlebars.templateAware.standalone"],
        selectors: {
            viewport: ""
        },
        templates: {
            layouts: {
                main: "{{body}}"
            },
            pages: {
                "main": "{{#each .}}<div class='column medium-1'><h4>{{@key}}</h4><h5>{{this}}</h5></div>{{/each}}"
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
            }
        },
        modelListeners: {
            keyChords: {
                func: "{that}.renderInitialMarkup"
            }
        }
    });
})(jQuery, fluid);
