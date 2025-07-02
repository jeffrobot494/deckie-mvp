import AudioControls from '../../common/AudioControls/AudioControls'
import './Header.css'

function Header({ gameName, deckieUrl }) {
  const currentUrl = `${window.location.origin}/deck/${deckieUrl}`
  
  return (
    <div className="header">
      <a href="/" className="logo-link">deckie.tcg</a>
      <div className="header-content">
        <div className="game-info">
          <h1 className="game-title">{gameName}</h1>
          <div className="url-display">{currentUrl}</div>
        </div>
        <AudioControls />
      </div>
    </div>
  )
}

export default Header