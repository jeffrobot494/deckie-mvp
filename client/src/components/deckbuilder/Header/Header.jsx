import { useState } from 'react'
import AudioControls from '../../common/AudioControls/AudioControls'
import audioService from '../../../services/audioService'
import './Header.css'

function Header({ gameName, deckieUrl }) {
  const currentUrl = `${window.location.origin}/deck/${deckieUrl}`
  const [copySuccess, setCopySuccess] = useState(false)
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      await audioService.initializeOnUserGesture()
      audioService.playButtonClick()
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }
  
  return (
    <div className="header">
      <a href="/" className="logo-link">deckie.net</a>
      <div className="header-content">
        <div className="game-info">
          <h1 className="game-title">{gameName}</h1>
          <div className="url-section">
            <span className="url-label">Your deckbuilder is live at: </span>
            <span className="url-display">{currentUrl}</span>
            <button 
              className="copy-btn"
              onClick={handleCopyUrl}
              title={copySuccess ? "Copied!" : "Copy URL"}
            >
              {copySuccess ? "✓" : "⧉"}
            </button>
          </div>
        </div>
        <AudioControls />
      </div>
    </div>
  )
}

export default Header