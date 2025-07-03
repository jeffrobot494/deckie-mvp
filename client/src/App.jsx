import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { DeckProvider } from './context/DeckContext'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/Landing'
import Deckbuilder from './pages/Deckbuilder'
import { useEffect } from 'react'
import './App.css'

// Analytics wrapper component to track route changes
function AnalyticsWrapper({ children }) {
  const location = useLocation()
  
  useEffect(() => {
    // Track page views on route changes
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'G-W4PL7KPTQK', {
        page_path: location.pathname + location.search
      })
    }
  }, [location])
  
  return children
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <DeckProvider>
          <AnalyticsWrapper>
            <div className="App">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/deck/:deckieUrl" element={<Deckbuilder />} />
              </Routes>
            </div>
          </AnalyticsWrapper>
        </DeckProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App