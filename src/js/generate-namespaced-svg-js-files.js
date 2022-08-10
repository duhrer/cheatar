/* eslint-env node */
/*

    Generate a javascript "wrapper" for all SVG images found in `./src/images/`, and save them to the `dist` directory.

 */
"use strict";
var fluid = require("infusion");
var cheatar = fluid.registerNamespace("cheatar");

fluid.require("%flocking-midi-interchange/src/js/svg-generator.js");

require("../../");

fluid.defaults("cheatar.svgJsFileGenerator", {
    gradeNames: ["flock.midi.interchange.svgJsFileGenerator"],
    inputDirs: ["%cheatar/src/images", "%flocking-midi-interchange/dist"],
    outputDir: "%cheatar/dist"
});

cheatar.svgJsFileGenerator();
