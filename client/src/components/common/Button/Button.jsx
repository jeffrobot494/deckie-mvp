import audioService from '../../../services/audioService'
import './Button.css'

function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false,
  className = '',
  ...props 
}) {
  const handleClick = async (e) => {
    await audioService.initializeOnUserGesture()
    audioService.playButtonClick()
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button