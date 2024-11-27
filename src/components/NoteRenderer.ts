
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from "vexflow";



// Function to convert notes into VexFlow notes
const createVexNotes = (noteArray: string[], clef: string, color: string) => {


    const parsedNotes = noteArray.map((note) =>
        note.length === 4 ? `${note[0]}/${note[3]}` : note
    );

    const staveNotes = new StaveNote({
        keys: parsedNotes, // In apppropriate VexFlow key format (e.g., "a/6")
        duration: "q", // Assume quarter notes
        clef: clef,
        // Stem direction logic based on octave
        stem_direction: parsedNotes[0].split('/')[1] <= "2" ? 1 :
            parsedNotes[0].split('/')[1] === "3" ? -1 :
                parsedNotes[0].split('/')[1] === "4" ? 1 : -1
    });
    staveNotes.setStyle({ fillStyle: color, strokeStyle: color });

    // Add accidentals (e.g., sharp, flat)
    for (let i = 0; i < noteArray.length; i++) {
        if (noteArray[i][1] !== "/") {
            staveNotes.addModifier(new Accidental(noteArray[i][1]), i);
        }
    }

    return staveNotes;
};

// Add rests to fill the measure for both treble and bass voices if necessary
const addRestsToFillMeasure = (vexNotes: StaveNote[]) => {
    const requiredRestDuration = 4 - vexNotes.length; // 4/4 measure
    if (requiredRestDuration > 0) {
        const rest = new StaveNote({
            keys: ["r/8"], // "r" is a rest in VexFlow
            duration: "qr", // Quarter note rest
            disabled: true
        });

        // Add rests to the end of the notes array
        vexNotes.push(...Array(requiredRestDuration).fill(rest));
    }
};



export const renderNotes = (blackNotes: string[], coloredNotes: string[], outputDivId: string, color="blue") => {
    const div = document.getElementById(outputDivId);
    if (!div) return;

    // Clear the previous rendering before drawing the new one
    div.innerHTML = '';

    // Create an SVG renderer and attach it to the DIV element named "output".
    const renderer = new Renderer(div, Renderer.Backends.SVG);

    // Set the renderer's size to double the normal resolution (e.g., 1000x1000 instead of 500x500).
    const width = 500;
    const height = 250;
    renderer.resize(width, height);

    const context = renderer.getContext();

    // Create a stave of width 400 at position 50, 20 on the canvas (for treble notes)
    const trebleStave = new Stave(50, 20, 400);
    trebleStave.addClef("treble")
    // trebleStave.addTimeSignature("4/4");

    // Create a bass stave of width 400 at position 50, 100 on the canvas (for bass notes)
    const bassStave = new Stave(50, 80, 400);
    bassStave.addClef("bass")
    // bassStave.addTimeSignature("4/4");

    // Split notes into treble and bass based on their octave (e.g., /5 or higher for treble)
    const blackTrebleNotes = blackNotes.filter(note => parseInt(note.split('/')[1], 10) >= 4);
    const blackBassNotes = blackNotes.filter(note => parseInt(note.split('/')[1], 10) <= 3);
    const coloredTrebleNotes = coloredNotes.filter(note => parseInt(note.split('/')[1], 10) >= 4);
    const coloredBassNotes = coloredNotes.filter(note => parseInt(note.split('/')[1], 10) <= 3);


    // Create VexFlow notes for treble and bass voices
    let trebleVexNotes = [];
    if (blackTrebleNotes.length > 0) {
        trebleVexNotes.push(createVexNotes(blackTrebleNotes, 'treble', 'black'));
    }
    if (coloredTrebleNotes.length > 0) {
        trebleVexNotes.push(createVexNotes(coloredTrebleNotes, 'treble', color));
    }


    let bassVexNotes = [];
    if (blackBassNotes.length > 0) {
        bassVexNotes.push(createVexNotes(blackBassNotes, 'bass', 'black'));
    }
    if (coloredBassNotes.length > 0) {
        bassVexNotes.push(createVexNotes(coloredBassNotes, 'bass', color));
    }



    // Ensure both voices fill the 4/4 measure
    addRestsToFillMeasure(trebleVexNotes);
    addRestsToFillMeasure(bassVexNotes);

    // Create voices for both treble and bass staves
    const trebleVoice = new Voice({ num_beats: 4, beat_value: 4 });
    const bassVoice = new Voice({ num_beats: 4, beat_value: 4 });

    // Add notes to the corresponding voices
    trebleVoice.addTickables(trebleVexNotes);
    bassVoice.addTickables(bassVexNotes);

    // Format and justify the notes to fit within the staves
    new Formatter().joinVoices([trebleVoice, bassVoice]).format([trebleVoice, bassVoice], 40);

    // Clear previous rendering and draw the new voices
    context.clear();


    // This is where we scale the output back to fit the container, if necessary
    const scale = 2; // Scale down to fit the container
    div.style.transform = `scale(${scale})`; // Scale down the SVG by 0.5

    // Draw the staves
    trebleStave.setContext(context).draw();
    bassStave.setContext(context).draw();

    // Draw the treble voice on the treble stave
    trebleVoice.draw(context, trebleStave);

    // Draw the bass voice on the bass stave
    bassVoice.draw(context, bassStave);

};
