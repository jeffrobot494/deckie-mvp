import { useDeck } from '../../../context/DeckContext'
import Button from '../../common/Button/Button'
import './DeckList.css'

function DeckList() {
  const { cardCounts, totalCards, removeCard } = useDeck()
  
  const handleRemoveCard = (cardName) => {
    removeCard(cardName)
  }
  
  if (totalCards === 0) {
    return (
      <div className="deck-list empty">
        <div className="empty-deck-message">
          <p>Click cards to add them to your deck</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="deck-list">
      <div className="deck-items">
        {Object.entries(cardCounts).map(([cardName, count]) => (
          <div key={cardName} className="deck-item">
            <span className="deck-item-text">
              <span className="card-count">{count}x</span>
              <span className="card-name">{cardName}</span>
            </span>
            <Button
              variant="danger"
              onClick={() => handleRemoveCard(cardName)}
              className="remove-btn"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeckList