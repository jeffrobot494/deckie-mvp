import { useTheme } from '../../../context/ThemeContext'
import './ThemeSelector.css'

function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  
  const themes = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean & Simple',
      className: 'theme-light'
    },
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
    }
  ]
  
  return (
    <div className="theme-selector">
      {themes.map((themeOption) => (
        <div
          key={themeOption.id}
          className={`theme-option ${themeOption.className} ${
            theme === themeOption.id ? 'selected' : ''
          }`}
          onClick={() => setTheme(themeOption.id)}
        >
          <div className="theme-name">{themeOption.name}</div>
          <div className="theme-description">{themeOption.description}</div>
        </div>
      ))}
    </div>
  )
}

export default ThemeSelector