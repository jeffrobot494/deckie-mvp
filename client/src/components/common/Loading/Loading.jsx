import './Loading.css'

function Loading({ message = 'Loading...', size = 'medium' }) {
  return (
    <div className="loading-container">
      <div className={`loading-spinner loading-${size}`}></div>
      <p className="loading-message">{message}</p>
    </div>
  )
}

export default Loading