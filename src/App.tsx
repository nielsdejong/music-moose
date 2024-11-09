import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MidiInputDisplay from './components/MidiInputDisplay'

function App() {

  return (
    <>
      <div>
     <h1 style={{fontSize: 100}}>🫎🎶</h1>
     <br/><br/><br/><br/>
      </div>
   
        <MidiInputDisplay />
     
        <br/><br/><br/><br/><br/><br/><br/><br/>
    </>
  )
}

export default App
