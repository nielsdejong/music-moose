import { WebMidi, Input, NoteMessageEvent } from "webmidi";

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

        // Function to handle note on (key pressed)
        const handleNoteOn = (e: NoteMessageEvent) => {
            let note = `${e.note.name.toLowerCase()}${e.note._accidental || ''}/${e.note.octave}`;
            if (note[0] === 'a' && note[1] === '#') {
                note = `bb/${note[3]}`;
            }
            onNoteOn(note);
        };

        // Function to handle note off (key released)
        const handleNoteOff = (e: NoteMessageEvent) => {
            let note = `${e.note.name.toLowerCase()}${e.note._accidental || ''}/${e.note.octave}`;
            if (note[0] === 'a' && note[1] === '#') {
                note = `bb/${note[3]}`;
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
