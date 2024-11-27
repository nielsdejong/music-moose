import React, { useEffect, useState } from "react";
import { initWebMidi } from "../components/MidiHandler";  // Import WebMidi logic
import { renderNotes } from "../components/NoteRenderer";  // Import VexFlow logic

const possibleNotes = [
    'c/2', 'c#/2', 'd/2', 'e/2', 'eb/2', 'f/2', 'f#/2', 'g/2', 'a/2', 'ab/2', 'b/2', 'bb/2',
    'c/3', 'c#/3', 'd/3', 'e/3', 'eb/3', 'f/3', 'f#/3', 'g/3', 'a/3', 'ab/3', 'b/3', 'bb/3',
    'c/4', 'c#/4', 'd/4', 'e/4', 'eb/4', 'f/4', 'f#/4', 'g/4', 'a/4', 'ab/4', 'b/4', 'bb/4',
    'c/5', 'c#/5', 'd/5', 'e/5', 'eb/5', 'f/5', 'f#/5', 'g/5', 'a/5', 'ab/5', 'b/5', 'bb/5',
    'c/6', 'c#/6', 'd/6', 'e/6', 'eb/6', 'f/6', 'f#/6', 'g/6', 'a/6', 'ab/6', 'b/6', 'bb/6',
    'c/7'
];

const NoteReader: React.FC = () => {
    const [heldNotes, setHeldNotes] = useState<string[]>([]);
    const [targetNotes, setTargetNotes] = useState<string[]>(['c/4']);
    const [message, setMessage] = useState<string | null>('-');
    const [error, setError] = useState<string | null>(null);
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);

    const [minNote, setMinNote] = useState('c/4');
    const [maxNote, setMaxNote] = useState('c/5');
    const [includeAccidentals, setIncludeAccidentals] = useState(true); // New state

    const sortedHeldNotes = heldNotes.sort((a, b) => {
        const [noteA, octaveA] = a.split('/');
        const [noteB, octaveB] = b.split('/');

        if (parseInt(octaveA) !== parseInt(octaveB)) {
            return parseInt(octaveA) - parseInt(octaveB);
        }

        return noteA.localeCompare(noteB);
    });

    useEffect(() => {
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
        // If successful, render a duplicate
        if(message === 'success') {
            renderNotes(targetNotes, targetNotes, "output", "green");
        }else{
            // Render the reality
            renderNotes(targetNotes, sortedHeldNotes, "output", "red");
        }
        

        if (message !== 'success') {
            // setMessage('-');
            const missingNote = heldNotes.find((note) => !targetNotes.includes(note));
            if (missingNote) {
                setStreak(0);
                setMessage('fail');
            }
        }

        if (JSON.stringify(heldNotes) === JSON.stringify(targetNotes)) {
            setPoints(points + 1);
            setStreak(streak + 1);
            setMessage('success');
            renderNotes(targetNotes, targetNotes, "output", "green");
            // Filter possibleNotes to be within the selected min and max range
            setTimeout(() => {
                setHeldNotes([]);
                const minIndex = possibleNotes.indexOf(minNote);
                const maxIndex = possibleNotes.indexOf(maxNote);
                const availableNotes = possibleNotes
                    .slice(minIndex, maxIndex + 1)
                    .filter(note => includeAccidentals || !note.includes('#') && !note.includes('b'));;
    
                setTargetNotes([availableNotes[Math.floor(Math.random() * availableNotes.length)]]);
                setMessage('-');
            }, 750);
           

        }
    }, [heldNotes, targetNotes, minNote, maxNote]);

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div style={{ width: 500 }}>
            <div style={{ marginTop: -120, marginBottom: 140, fontSize: 20 }}>
                <label>
                    from &nbsp;&nbsp;
                    <select value={minNote} onChange={(e) => setMinNote(e.target.value)}>
                        {possibleNotes.map((note) => (
                            <option style={{ fontSize: 15 }} key={note} value={note}>{note}</option>
                        ))}
                    </select>
                </label>

                <label>
                    &nbsp;&nbsp; to &nbsp;&nbsp;
                    <select value={maxNote} onChange={(e) => setMaxNote(e.target.value)}>
                        {possibleNotes.map((note) => (
                            <option key={note} value={note}>{note}</option>
                        ))}
                    </select>
                </label>

                <label style={{ marginLeft: '20px' }}>
                    <input
                        type="checkbox"
                        checked={includeAccidentals}
                        onChange={() => setIncludeAccidentals(!includeAccidentals)}
                    />
                    Include accidentals
                </label>
            </div>

            <div
                id="output"
                style={{ border: "1px solid black", width: "500px", height: "230px", background: "white" }}
            ></div>
            <i style={{ color: 'black', position: 'relative', textAlign: 'right', marginLeft: '-50', width: '650px', fontSize: 25, zIndex: 99, marginTop: -340, display: 'block' }}>
                ✅{points} &nbsp; ⭐{streak}
            </i>
            <i style={{ color: message == 'success' ? 'green' : 'red', position: 'relative', fontSize: 70, zIndex: 99, marginTop: 270, display: 'block' }}>
                {sortedHeldNotes.map((note, index) => {
                    const base = note[0].toUpperCase();
                    const accidental = note.split('/')[0][1]
                    return <span key={index}>{base}<sup>{accidental}</sup>&nbsp;</span>
                })}

            </i>
            <h1 style={{ color: 'black', position: 'relative', fontSize: 40, height: 50, zIndex: 99, marginTop: -30, marginBottom: -50, display: 'block' }}>
            </h1>

        </div>
    );
};

export default NoteReader;
