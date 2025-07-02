import { useDeck } from '../../../context/DeckContext'
import DeckList from '../DeckList/DeckList'
import ExportButtons from '../ExportButtons/ExportButtons'
import Button from '../../common/Button/Button'
import audioService from '../../../services/audioService'
import './DeckPanel.css'

function DeckPanel({ gameName, deckieUrl }) {
  const { totalCards, clearDeck } = useDeck()
  
  const handleClearDeck = async () => {
    await audioService.initializeOnUserGesture()
    audioService.playButtonClick()
    clearDeck()
  }
  
  return (
    <div className="deck-section">
      <div className="deck-header">
        <h3>My Deck</h3>
        <div className="deck-info">
          <div className="deck-count">
            {totalCards} cards
          </div>
          {totalCards > 0 && (
            <Button 
              onClick={handleClearDeck}
              className="clear-deck-btn"
              variant="secondary"
            >
              Clear Deck
            </Button>
          )}
        </div>
      </div>
      
      <DeckList />
      
      <ExportButtons 
        gameName={gameName}
        deckieUrl={deckieUrl}
      />
    </div>
  )
}

export default DeckPanel