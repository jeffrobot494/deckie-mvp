import './Header.css'

function Header({ gameName, deckieUrl }) {
  const currentUrl = `${window.location.origin}/deck/${deckieUrl}`
  
  return (
    <div className="header">
      <div className="header-content">
        <div className="game-info">
          <h1 className="game-title">{gameName}</h1>
          <div className="url-display">{currentUrl}</div>
        </div>
      </div>
    </div>
  )
}

export default Header