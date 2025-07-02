import { useState } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import './ThemeSelector.css'

function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [sheenAnimation, setSheenAnimation] = useState(false)
  
  const themes = [
    {
      id: 'dark',
      name: 'Dark',
      description: 'Professional',
      className: 'theme-dark'
    },
    {
      id: 'neon',
      name: 'Neon',
      description: 'Cyberpunk',
      className: 'theme-neon'
    },
    {
      id: 'fantasy',
      name: 'Fantasy',
      description: 'Medieval',
      className: 'theme-fantasy'
    }
  ]
  
  const handleThemeClick = (themeId) => {
    if (themeId === 'neon') {
      // Trigger sheen animation for neon theme
      setSheenAnimation(true)
      setTimeout(() => setSheenAnimation(false), 600)
    }
    setTheme(themeId)
  }
  
  return (
    <div className="theme-selector">
      {themes.map((themeOption) => (
        <div
          key={themeOption.id}
          className={`theme-option ${themeOption.className} ${
            theme === themeOption.id ? 'selected' : ''
          } ${themeOption.id === 'neon' && sheenAnimation ? 'sheen-animation' : ''}`}
          onClick={() => handleThemeClick(themeOption.id)}
        >
          <div className="theme-name">{themeOption.name}</div>
          <div className="theme-description">{themeOption.description}</div>
        </div>
      ))}
    </div>
  )
}

export default ThemeSelector