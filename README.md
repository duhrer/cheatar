# The "Cheater's Guitar"

This project is an arpeggiating router built with [Flocking](http://flockingjs.org/).  When a note is played using the
web interface or a connected MIDI input, a 4-string guitar chord is transmitted to the selected MIDI output.


1. Run `npm install` in the root of the repository directory.
2. Connect a physical or software a synthesizer that is configure to appear as a MIDI output for other devices.
3. (Optional) Connect a MIDI controller or other MIDI input.
4. Open `index.html` in a browser that supports WebMIDI (Chrome and modern versions of Opera at time of writing).
5. Click the "Options" button and select your MIDI output and (optionally) your MIDI input.
6. Click a chord onscreen or send a note from your MIDI input.
