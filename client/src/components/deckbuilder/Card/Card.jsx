import { useDeck } from '../../../context/DeckContext'
import audioService from '../../../services/audioService'
import './Card.css'

function Card({ imageUrl, cardName, isProcessing = false }) {
  const { addCard, removeCard, cardCounts } = useDeck()
  
  const handleClick = async () => {
    await audioService.initializeOnUserGesture()
    addCard(cardName)
    audioService.playCardAdd()
  }
  
  const handleRightClick = async (e) => {
    e.preventDefault() // Prevent default context menu
    if (isInDeck) {
      await audioService.initializeOnUserGesture()
      removeCard(cardName)
      audioService.playCardRemove()
    }
  }

  const handleMouseEnter = async () => {
    await audioService.initializeOnUserGesture()
    audioService.playCardHover()
  }
  
  const isInDeck = cardCounts[cardName] && cardCounts[cardName] > 0
  const cardCount = cardCounts[cardName] || 0
  
  return (
    <div 
      className={`game-card ${isInDeck ? 'in-deck' : ''}`} 
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onMouseEnter={handleMouseEnter}
      data-card-count={cardCount}
    >
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
      {isInDeck && (
        <div className="card-count-badge">
          {cardCount}
        </div>
      )}
    </div>
  )
}

export default Card