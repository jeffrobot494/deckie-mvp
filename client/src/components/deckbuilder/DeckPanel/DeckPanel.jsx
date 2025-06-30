import { useDeck } from '../../../context/DeckContext'
import DeckList from '../DeckList/DeckList'
import ExportButtons from '../ExportButtons/ExportButtons'
import './DeckPanel.css'

function DeckPanel({ gameName, deckieUrl }) {
  const { totalCards } = useDeck()
  
  return (
    <div className="deck-section">
      <div className="deck-header">
        <h3>My Deck</h3>
        <div className="deck-count">
          {totalCards} cards
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