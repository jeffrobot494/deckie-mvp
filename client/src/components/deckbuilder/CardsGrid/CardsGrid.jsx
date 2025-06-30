import Card from '../Card/Card'
import './CardsGrid.css'

function CardsGrid({ imageUrls = [] }) {
  const getCardName = (url) => {
    // Extract filename from Cloudinary URL and clean it up
    try {
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1]
      const nameWithoutExtension = filename.split('.')[0]
      // Replace underscores and hyphens with spaces, capitalize words
      return nameWithoutExtension
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    } catch (error) {
      return 'Unknown Card'
    }
  }
  
  if (imageUrls.length === 0) {
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
      <h2>All Cards ({imageUrls.length})</h2>
      <div className="cards-grid">
        {imageUrls.map((imageUrl, index) => (
          <Card
            key={`${imageUrl}-${index}`}
            imageUrl={imageUrl}
            cardName={getCardName(imageUrl)}
          />
        ))}
      </div>
    </div>
  )
}

export default CardsGrid