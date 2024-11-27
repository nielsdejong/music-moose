import React, { useEffect, useState } from "react";
import { initWebMidi } from "../components/MidiHandler";  // Import WebMidi logic
import { renderNotes } from "../components/NoteRenderer";  // Import VexFlow logic

const NotePlayer: React.FC = () => {
  const [heldNotes, setHeldNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize WebMidi and set up callbacks
    initWebMidi(
      (note: string) => {
        setHeldNotes((prevNotes) => {
          if (!prevNotes.includes(note)) {
            return [...prevNotes, note];
          }
          return prevNotes;
        });
      },
      (note: string) => {
        setHeldNotes((prevNotes) => prevNotes.filter((n) => n !== note));
      },
      setError
    );
  }, []);

  useEffect(() => {
    renderNotes(heldNotes, [],"output");  // Render notes using VexFlow
  }, [heldNotes]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  const sortedNodes = heldNotes.sort((a, b) => {
    // Extract the parts before and after the slash
    const [noteA, octaveA] = a.split('/');
    const [noteB, octaveB] = b.split('/');

    // First, compare by the octave (the part after the '/')
    if (parseInt(octaveA) !== parseInt(octaveB)) {
        return parseInt(octaveA) - parseInt(octaveB);
    }

    // If octaves are the same, compare by the note (the part before the '/')
    return noteA.localeCompare(noteB);
});

  return (
    <div>
      <div
        id="output"
        style={{ border: "1px solid black", width: "500px", height: "230px", background: "white" }}
      ></div>
    <br/><br/><br/><br/>
      <h1 style={{height: 60}}>&nbsp;
        {sortedNodes.map((note, index) => {
          const base = note[0].toUpperCase();
          const accidental = note.split('/')[0][1]
          return <span key={index}>{base}<sup>{accidental}</sup>&nbsp;</span>
      
        })}
      </h1>
    </div>
  );
};

export default NotePlayer;
