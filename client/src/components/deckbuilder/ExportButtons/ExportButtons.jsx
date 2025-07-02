import { useState } from 'react'
import { useDeck } from '../../../context/DeckContext'
import Button from '../../common/Button/Button'
import { api } from '../../../services/api'
import './ExportButtons.css'

function ExportButtons({ gameName, deckieUrl }) {
  const { exportDeckAsText, totalCards, cardCounts } = useDeck()
  const [isExportingTTS, setIsExportingTTS] = useState(false)
  
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
  
  const handleExportTTSImage = async () => {
    if (totalCards === 0) {
      alert('Your deck is empty!')
      return
    }
    
    if (totalCards > 70) {
      const proceed = confirm(`Your deck has ${totalCards} cards, but TTS export supports maximum 70 cards. Only the first 70 cards will be included. Continue?`)
      if (!proceed) return
    }
    
    setIsExportingTTS(true)
    
    try {
      // Convert cardCounts to the format expected by the API
      const deckCards = Object.entries(cardCounts).map(([cardName, quantity]) => ({
        cardName,
        quantity
      }))
      
      // Call the TTS export API
      const result = await api.exportToTTS(deckieUrl, deckCards)
      
      // Download the generated image
      try {
        const response = await fetch(result.imageUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `${gameName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_tts_deck.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up the blob URL
        URL.revokeObjectURL(url)
      } catch (downloadError) {
        console.error('Download failed, opening in new tab:', downloadError)
        // Fallback: open in new tab if download fails
        window.open(result.imageUrl, '_blank')
      }
      
      if (result.cached) {
        alert('TTS deck image downloaded! (Using cached version)')
      } else {
        alert('TTS deck image generated and downloaded successfully!')
      }
      
    } catch (error) {
      console.error('TTS export failed:', error)
      alert(`Failed to export TTS image: ${error.message}`)
    } finally {
      setIsExportingTTS(false)
    }
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
        disabled={totalCards === 0 || isExportingTTS}
      >
        {isExportingTTS ? 'Generating TTS Image...' : 'Export for TTS'}
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