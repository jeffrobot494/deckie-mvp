import { useDeck } from '../../../context/DeckContext'
import Button from '../../common/Button/Button'
import './ExportButtons.css'

function ExportButtons({ gameName, deckieUrl }) {
  const { exportDeckAsText, totalCards } = useDeck()
  
  const handleExportText = () => {
    if (totalCards === 0) {
      alert('Your deck is empty!')
      return
    }
    
    const deckText = `${gameName} - Deck List (${totalCards} cards)\n\n${exportDeckAsText()}`
    
    // Create and download file
    const blob = new Blob([deckText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${gameName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deck.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const handleCopyDecklist = async () => {
    if (totalCards === 0) {
      alert('Your deck is empty!')
      return
    }
    
    const deckText = exportDeckAsText()
    
    try {
      await navigator.clipboard.writeText(deckText)
      alert('Decklist copied to clipboard!')
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = deckText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Decklist copied to clipboard!')
    }
  }
  
  const handleShareDeckUrl = async () => {
    const url = `${window.location.origin}/deck/${deckieUrl}`
    
    try {
      await navigator.clipboard.writeText(url)
      alert('Deck URL copied to clipboard!')
    } catch (error) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Deck URL copied to clipboard!')
    }
  }
  
  const handleExportTTSImage = () => {
    alert('TTS Image export coming soon!')
  }
  
  return (
    <div className="export-buttons">
      <Button
        variant="secondary"
        onClick={handleExportText}
        disabled={totalCards === 0}
      >
        Export as .txt
      </Button>
      
      <Button
        variant="secondary"
        onClick={handleExportTTSImage}
        disabled={totalCards === 0}
      >
        Export as TTS Image
      </Button>
      
      <Button
        variant="secondary"
        onClick={handleCopyDecklist}
        disabled={totalCards === 0}
      >
        Copy Decklist
      </Button>
      
      <Button
        variant="secondary"
        onClick={handleShareDeckUrl}
      >
        Share Deck URL
      </Button>
    </div>
  )
}

export default ExportButtons