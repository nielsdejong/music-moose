import { useState } from 'react'
import './App.css'
import NotePlayer from './pages/NotePlayer'
import NoteReader from './pages/NoteReader'
import NoteListener from './pages/NoteListener';

function App() {
  const [window, setWindow] = useState('read');
  return (
    <>
      <div style={{overflow: 'hidden'}}>
        {
          <h1 style={{ fontSize: 100, margin: 0 }}>
            🫎
            {window === 'play' ? '🎶' : window === 'read' ? '📃' : '🎧'}
          </h1>
        }

        <button style={window === "play" ? { outline: '4px auto -webkit-focus-ring-color' } : undefined}
          onClick={() => setWindow('play')}>
          Play
        </button>
        &nbsp;
        <button style={window === "read" ? { outline: '4px auto -webkit-focus-ring-color' } : undefined}
          onClick={() => setWindow('read')}>
          Read
        </button>
        &nbsp;
        <button style={window === "listen" ? { outline: '4px auto -webkit-focus-ring-color' } : undefined}
          onClick={() => setWindow('listen')}>
          Listen
        </button>
        <br /><br /> <br /><br /><br /><br /><br /><br />
      </div>

      {window === 'play' && <NotePlayer />}
      {window === 'read' && <NoteReader />}
      {window === 'listen' && <NoteListener />}
      <br /><br /><br />
    </>
  )
}

export default App;
