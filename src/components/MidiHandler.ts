import { WebMidi, Input, NoteMessageEvent, Output } from "webmidi";

let midiOutput: Output | null = null; // To store the active MIDI output device

export const initWebMidi = (
    onNoteOn: (note: string) => void,
    onNoteOff: (note: string) => void,
    setError: (error: string) => void
) => {
    if (!navigator.requestMIDIAccess) {
        setError("Web MIDI API is not supported in your browser.");
        return;
    }

    WebMidi.enable((err) => {
        if (err) {
            setError("WebMidi could not be enabled:" + err);
            return;
        }

        if (WebMidi.inputs.length === 0) {
            setError("No MIDI devices found. Please connect a MIDI device and reload the page.");
            return;
        }

        if (WebMidi.outputs.length > 0) {
            midiOutput = WebMidi.outputs[0]; // Use the first available output device
        } else {
            setError("No MIDI output devices found. Playback will not be possible.");
        }

        // Function to handle note on (key pressed)
        const handleNoteOn = (e: NoteMessageEvent) => {
            let note = `${e.note.name.toLowerCase()}${e.note.accidental || ''}/${e.note.octave}`;
            // A# becomes Bb
            if (note[0] === 'a' && note[1] === '#') {
                note = `bb/${note[3]}`;
            }
            // D# becomes Eb
            if (note[0] === 'd' && note[1] === '#') {
                note = `eb/${note[3]}`;
            }
            // G# becomes Ab
            if (note[0] === 'g' && note[1] === '#') {
                note = `ab/${note[3]}`;
            }
            onNoteOn(note);
        };

        // Function to handle note off (key released)
        const handleNoteOff = (e: NoteMessageEvent) => {
            let note = `${e.note.name.toLowerCase()}${e.note.accidental || ''}/${e.note.octave}`;
            // A# becomes Bb
            if (note[0] === 'a' && note[1] === '#') {
                note = `bb/${note[3]}`;
            }
            // D# becomes Eb
            if (note[0] === 'd' && note[1] === '#') {
                note = `eb/${note[3]}`;
            }
            // G# becomes Ab
            if (note[0] === 'g' && note[1] === '#') {
                note = `ab/${note[3]}`;
            }
            onNoteOff(note);
        };

        // Attach listeners to each input
        WebMidi.inputs.forEach((input: Input) => {
            input.addListener("noteon", "all", handleNoteOn);
            input.addListener("noteoff", "all", handleNoteOff);
        });

        // Cleanup on unmount
        return () => {
            WebMidi.inputs.forEach((input: Input) => {
                input.removeListener("noteon", "all", handleNoteOn);
                input.removeListener("noteoff", "all", handleNoteOff);
            });
        };
    });
};

// Convert note string (e.g., "c/4") to MIDI note number
const stringToMidiNote = (noteString: string): number => {
    const [note, octave] = noteString.split('/');
    const noteNames = ['c', 'c#', 'd', 'eb', 'e', 'f', 'f#', 'g', 'ab', 'a', 'bb', 'b'];
    const baseNote = noteNames.indexOf(note.toLowerCase());
    const midiNumber = baseNote + (parseInt(octave) + 1) * 12;
    return midiNumber;
};

// Function to play a MIDI note
export const playNote = async (note: string, duration: number = 500) => {
    if (!midiOutput) {
        console.error("No MIDI output device available to play notes.");
        return;
    }

    const midiNote = stringToMidiNote(note);
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    // Send 'note on' message
    // for (let i = 0; i < 12; i++) {
    //     midiOutput.playNote(midiNote+i, 1, { duration });
    //     await sleep(500);
    // }
    midiOutput.playNote(midiNote, 1, { duration });
    // Optionally handle 'note off' after the duration (WebMidi automatically handles this with the `duration` option)
    setTimeout(() => {
        midiOutput.stopNote(midiNote, "all");
    }, duration);
};
