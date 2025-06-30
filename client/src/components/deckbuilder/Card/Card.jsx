import { useDeck } from '../../../context/DeckContext'
import './Card.css'

function Card({ imageUrl, cardName }) {
  const { addCard } = useDeck()
  
  const handleClick = () => {
    addCard(cardName)
  }
  
  return (
    <div className="game-card" onClick={handleClick}>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={cardName} 
          className="card-image"
          loading="lazy"
        />
      ) : (
        <div className="card-placeholder">
          <span className="card-name">{cardName}</span>
        </div>
      )}
    </div>
  )
}

export default Card