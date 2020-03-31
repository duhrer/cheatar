// TODO: Put this in its own package and update the cheatar and flocking-midi-interchange packages.
(function (fluid) {
    "use strict";
    var jv = fluid.registerNamespace("jv");

    /*

        To quote the JV-midiman manual (http://www.gmarts.org/data/jv-midiman.htm#How_to_calculate_the_checksum):

        "... The following formula shows how to calculate the checksum when the exclusive message to be transmitted has an address of aa bb cc ddH, and data or size of ee ffH.

        aa + bb + cc + dd + ee + ff = total
        total / 128 = quotient ... remainder
        128 - remainder  = checksum ..."

        So, for example, here's an original sysex message that needs a checksum:

        (F0) 0x41 0x10 0x6A 0x12 0x01 0x00 0x00 0x28 0x06 ??	(F7)

        The 0x41 0x10 0x6A 0x12 part is a common header not used in the checksum calculation, this leaves:

        0x01 0x00 0x00 0x28 0x06

        This sums to 0x2F, or 47.  128 - 47 = 81.  Or, in hex, 0x80 - 0x2F = 0x51

     */
    jv.messageWithChecksum = function (message) {
        var messageWithChecksum = fluid.copy(message);
        var toSum = message.data.slice(4);
        var sum = 0;
        fluid.each(toSum, function (singleByte) { sum += singleByte; });
        var remainder = sum % 128;
        var checksum = 128 - remainder;
        messageWithChecksum.data.push(checksum);
        // F0 41 10 6A 12 00 00 00 11 02 6D F7 => Both
        return messageWithChecksum;
    };

    jv.init = function (connectorComponent, connectionComponent) {
        fluid.each(connectorComponent.options.startupMessages, function (startupMessageMinusChecksum) {
            var messageWithSum = jv.messageWithChecksum (startupMessageMinusChecksum);
            connectionComponent.send(messageWithSum);
        });
    };

    fluid.defaults("jv.connector", {
        gradeNames: ["flock.auto.ui.midiConnector"],
        sysex: true,
        // Commands taken from: http://www.gmarts.org/data/jv-midiman.htm and
        // https://archive.org/stream/synthmanual-roland-jv-1080-owners-manual/rolandjv-1080ownersmanual_djvu.txt
        // Sample sysex: (F0) 41 10 6A 12 01 00 00 28 06 ??	(F7)
        startupMessages: [
            // Enable aftertouch.
            { type: "sysex", data: [0x41, 0x10, 0x6a, 0x12, 0x0, 0x0, 0x0, 0x1b, 0x1 ] },
            // Set aftertouch Source (0=Channel, 1=Poly, 2=Both)
            // F0 41 10 6A 12 00 00 00 11 01 6E F7 => Poly
            // F0 41 10 6A 12 00 00 00 11 02 6D F7 => Both
            { type: "sysex", data: [0x41, 0x10, 0x6a, 0x12, 0x0, 0x0, 0x0, 0x11, 0x2 ] }
        ],
        listeners: {
            "afterConnectionOpen.jvInit": {
                funcName: "jv.init",
                args: ["{that}", "{flock.midi.connection}"] // connectorComponent, connectionComponent
            }
        },
        components: {
            connection: {
                options: {
                    sysex: true
                }
            }
        }
    });
})(fluid);
