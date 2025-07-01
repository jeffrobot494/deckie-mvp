import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import Loading from '../components/common/Loading/Loading'
import ProgressBar from '../components/common/ProgressBar/ProgressBar'
import Button from '../components/common/Button/Button'
import Header from '../components/deckbuilder/Header/Header'
import CardsGrid from '../components/deckbuilder/CardsGrid/CardsGrid'
import DeckPanel from '../components/deckbuilder/DeckPanel/DeckPanel'
import './Deckbuilder.css'

function Deckbuilder() {
  const { deckieUrl } = useParams()
  const { setTheme } = useTheme()
  const [deckData, setDeckData] = useState(null)
  const [cards, setCards] = useState([])
  const [processingStatus, setProcessingStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchDeckData = async () => {
      try {
        setLoading(true)
        
        // Fetch deckbuilder info and cards in parallel
        const [deckInfo, cardsData] = await Promise.all([
          api.getDeckie(deckieUrl),
          api.getCards(deckieUrl)
        ])
        
        setDeckData(deckInfo)
        setCards(cardsData.cards)
        setTheme(deckInfo.theme)
        
        // If there are cards being processed, start polling for status
        const hasProcessingCards = cardsData.cards.some(card => card.isProcessing)
        if (hasProcessingCards) {
          startStatusPolling()
        }
        
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

  const startStatusPolling = () => {
    const pollStatus = async () => {
      try {
        const status = await api.getCardsStatus(deckieUrl)
        setProcessingStatus(status)
        
        if (status.isComplete) {
          // Processing is done, stop polling
          return
        }
        
        // Continue polling every 3 seconds
        setTimeout(pollStatus, 3000)
      } catch (error) {
        console.error('Failed to poll status:', error)
        // Stop polling on error
      }
    }
    
    pollStatus()
  }

  const handleRefresh = () => {
    window.location.reload()
  }
  
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
      
      {/* Processing Status Bar */}
      {processingStatus && !processingStatus.isComplete && (
        <div className="processing-status">
          <ProgressBar 
            progress={(processingStatus.processedCards / processingStatus.totalCards) * 100}
            message="Google Vision API is extracting card names from your images..."
          />
        </div>
      )}
      
      {/* Processing Complete Banner */}
      {processingStatus && processingStatus.isComplete && (
        <div className="processing-complete">
          <div className="complete-message">
            ✅ Card name extraction complete! 
            <Button onClick={handleRefresh} className="refresh-btn">
              Refresh to see card names
            </Button>
          </div>
        </div>
      )}
      
      <div className="main-content">
        <CardsGrid cards={cards} />
        
        <DeckPanel 
          gameName={deckData.gameName}
          deckieUrl={deckieUrl}
        />
      </div>
    </div>
  )
}

export default Deckbuilder