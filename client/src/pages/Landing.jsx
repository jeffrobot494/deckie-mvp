import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import Button from '../components/common/Button/Button'
import ProgressBar from '../components/common/ProgressBar/ProgressBar'
import ThemeSelector from '../components/landing/ThemeSelector/ThemeSelector'
import FileUpload from '../components/landing/FileUpload/FileUpload'
import './Landing.css'

function Landing() {
  const [gameName, setGameName] = useState('')
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  
  const { theme } = useTheme()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!gameName.trim()) {
      setError('Please enter a game name')
      return
    }
    
    if (files.length === 0) {
      setError('Please select card images to upload')
      return
    }
    
    try {
      setIsUploading(true)
      setUploadProgress(0)
      
      // Upload images to Cloudinary
      const imageUrls = await uploadToCloudinary(files, (progress) => {
        setUploadProgress(progress * 0.9) // 90% for upload, 10% for API call
      })
      
      setUploadProgress(95)
      
      // Create deckbuilder via API
      const response = await api.createDeckie({
        gameName: gameName.trim(),
        theme,
        imageUrls
      })
      
      setUploadProgress(100)
      
      // Navigate to deckbuilder
      setTimeout(() => {
        navigate(`/deck/${response.deckieUrl}`)
      }, 500)
      
    } catch (error) {
      setError(error.message || 'Failed to create deckbuilder')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }
  
  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="logo">deckie.net</div>
        <div className="tagline">
          Create a beautiful deckbuilder for your TCG in under 5 minutes
        </div>
        
        <form onSubmit={handleSubmit} className="landing-form">
          <div className="form-group">
            <label htmlFor="gameName">Game Name</label>
            <input
              type="text"
              id="gameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter your game's name"
              maxLength="255"
              required
              disabled={isUploading}
            />
          </div>
          
          <div className="form-group">
            <label>Choose a theme for your deckbuilder</label>
            <ThemeSelector />
          </div>
          
          <FileUpload
            onFilesSelected={setFiles}
            files={files}
          />
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {isUploading && (
            <ProgressBar
              progress={uploadProgress}
              message="Creating your deckbuilder..."
            />
          )}
          
          <Button
            type="submit"
            disabled={isUploading || !gameName.trim() || files.length === 0}
            className="create-button"
          >
            {isUploading ? 'Creating...' : 'Create Deckbuilder'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Landing