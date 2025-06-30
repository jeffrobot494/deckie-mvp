import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import Loading from '../components/common/Loading/Loading'
import Header from '../components/deckbuilder/Header/Header'
import CardsGrid from '../components/deckbuilder/CardsGrid/CardsGrid'
import DeckPanel from '../components/deckbuilder/DeckPanel/DeckPanel'
import './Deckbuilder.css'

function Deckbuilder() {
  const { deckieUrl } = useParams()
  const { setTheme } = useTheme()
  const [deckData, setDeckData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchDeckData = async () => {
      try {
        setLoading(true)
        const data = await api.getDeckie(deckieUrl)
        setDeckData(data)
        setTheme(data.theme) // Apply the theme from the deckbuilder
      } catch (error) {
        setError(error.message || 'Failed to load deckbuilder')
      } finally {
        setLoading(false)
      }
    }
    
    if (deckieUrl) {
      fetchDeckData()
    }
  }, [deckieUrl, setTheme])
  
  if (loading) {
    return (
      <div className="deckbuilder-loading">
        <Loading message="Loading your deckbuilder..." size="large" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="deckbuilder-error">
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = '/'}>
            Go back to home
          </button>
        </div>
      </div>
    )
  }
  
  if (!deckData) {
    return (
      <div className="deckbuilder-error">
        <div className="error-container">
          <h2>Deckbuilder not found</h2>
          <p>The deckbuilder you're looking for doesn't exist.</p>
          <button onClick={() => window.location.href = '/'}>
            Create a new deckbuilder
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="deckbuilder-page">
      <Header 
        gameName={deckData.gameName}
        deckieUrl={deckieUrl}
      />
      
      <div className="main-content">
        <CardsGrid imageUrls={deckData.imageUrls} />
        
        <DeckPanel 
          gameName={deckData.gameName}
          deckieUrl={deckieUrl}
        />
      </div>
    </div>
  )
}

export default Deckbuilder