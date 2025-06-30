import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { DeckProvider } from './context/DeckContext'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/Landing'
import Deckbuilder from './pages/Deckbuilder'
import './App.css'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <DeckProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/deck/:deckieUrl" element={<Deckbuilder />} />
            </Routes>
          </div>
        </DeckProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App