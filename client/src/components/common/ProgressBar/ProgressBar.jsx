import './ProgressBar.css'

function ProgressBar({ progress = 0, message = '', className = '' }) {
  return (
    <div className={`progress-container ${className}`}>
      {message && <div className="progress-message">{message}</div>}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      <div className="progress-text">{Math.round(progress)}%</div>
    </div>
  )
}

export default ProgressBar