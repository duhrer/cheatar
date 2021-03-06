// TODO: Discuss reconciling this with the docpad and fluid-sandbox approaches and generalising for reuse.
/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

var cheatar = fluid.registerNamespace("cheatar");

var path = require("path");

var copy = require("recursive-copy");

fluid.registerNamespace("cheatar.generator");

cheatar.generator.makeBundle = function (that) {
    var resolvedBasePath = fluid.module.resolvePath(that.options.baseDir);
    var promises = [];
    fluid.each(fluid.makeArray(that.options.bundle), function (singleItemPath) {
        var itemSrcPath = path.resolve(resolvedBasePath, singleItemPath);
        var itemDestPath = path.resolve(that.options.targetDir, singleItemPath);

        // Return a promise-returning function so that only one call will be in flight at a time.
        promises.push(function () {
            return copy(itemSrcPath, itemDestPath);
        });
    });

    var sequence = fluid.promise.sequence(promises);

    sequence.then(
        function () { fluid.log("Finished, output saved to '", that.options.targetDir, "'..."); },
        fluid.fail
    );

    return sequence;
};

fluid.defaults("cheatar.generator", {
    gradeNames: ["fluid.component"],
    baseDir: "%cheatar",
    targetDir: "/tmp/bundle",
    bundle: [
        "./index.html",
        "./node_modules/infusion/dist/infusion-all.js",
        "./node_modules/infusion/dist/infusion-all.js.map",
        "./node_modules/infusion/src/components/tooltip/js/Tooltip.js",
        "./node_modules/infusion/src/components/textfieldControl/js/TextfieldSlider.js",
        "./node_modules/handlebars/dist/handlebars.js",
        "./node_modules/markdown-it/dist/markdown-it.js",
        "./node_modules/gpii-handlebars/src/js/client/hasRequiredOptions.js",
        "./node_modules/gpii-handlebars/src/js/common/helper.js",
        "./node_modules/gpii-handlebars/src/js/common/md-common.js",
        "./node_modules/gpii-handlebars/src/js/client/md-client.js",
        "./node_modules/gpii-handlebars/src/js/common/jsonify.js",
        "./node_modules/gpii-handlebars/src/js/common/equals.js",
        "./node_modules/gpii-handlebars/src/js/common/messageHelper.js",
        "./node_modules/gpii-handlebars/src/js/common/renderer.js",
        "./node_modules/gpii-handlebars/src/js/client/renderer.js",
        "./node_modules/gpii-handlebars/src/js/client/templateAware.js",
        "./node_modules/gpii-binder/src/js/binder.js",
        "./node_modules/gpii-binder/src/js/transforms.js",
        "./node_modules/flocking/dist/flocking-base.js",
        "./node_modules/flocking/src/ui/selectbox/js/selectbox.js",
        "./node_modules/flocking/src/ui/midi/midi-port-selector/js/midi-port-selector.js",
        "./node_modules/flocking/src/ui/midi/midi-connector/js/midi-connector.js",
        "./node_modules/flocking-midi-select-ng/src/js/auto-midi-system.js",
        "./node_modules/flocking-midi-select-ng/src/js/select-box.js",
        "./node_modules/flocking-midi-select-ng/src/js/auto-midi-port-selector.js",
        "./node_modules/flocking-midi-select-ng/src/js/auto-midi-connector.js",
        "./src/js/select.js",
        "./src/js/keychords.js",
        "./src/js/keyChordDisplay.js",
        "./src/js/arpeggiator.js",
        "./src/js/harness.js",
        "./node_modules/foundation-sites/dist/css/foundation.css",
        "./src/css/cheatar.css"
    ],
    listeners: {
        "onCreate.createBundle": {
            funcName: "cheatar.generator.makeBundle",
            args:     ["{that}"]
        }
    }
});

cheatar.generator();
