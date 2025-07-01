import Card from '../Card/Card'
import './CardsGrid.css'

function CardsGrid({ cards = [] }) {
  if (cards.length === 0) {
    return (
      <div className="cards-section">
        <h2>All Cards</h2>
        <div className="no-cards-message">
          No cards available for this deckbuilder.
        </div>
      </div>
    )
  }
  
  return (
    <div className="cards-section">
      <h2>All Cards ({cards.length})</h2>
      <div className="cards-grid">
        {cards.map((card) => (
          <Card
            key={card.id}
            imageUrl={card.imageUrl}
            cardName={card.cardName}
            isProcessing={card.isProcessing}
          />
        ))}
      </div>
    </div>
  )
}

export default CardsGrid