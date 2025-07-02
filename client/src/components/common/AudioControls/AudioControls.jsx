import { useState, useEffect } from 'react'
import audioService from '../../../services/audioService'
import './AudioControls.css'

function AudioControls() {
  const [volume, setVolume] = useState(0.1)
  const [isMuted, setIsMuted] = useState(false)
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(false)
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(0.03)

  useEffect(() => {
    // Sync with audio service
    audioService.setVolume(volume)
    audioService.setMuted(isMuted)
    audioService.setBackgroundMusicEnabled(backgroundMusicEnabled)
    audioService.setBackgroundMusicVolume(backgroundMusicVolume)
  }, [volume, isMuted, backgroundMusicEnabled, backgroundMusicVolume])

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const handleBackgroundVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setBackgroundMusicVolume(newVolume)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleBackgroundMusic = () => {
    setBackgroundMusicEnabled(!backgroundMusicEnabled)
  }

  return (
    <div className="audio-controls">
      <div className="audio-section">
        <button 
          className="mute-button" 
          onClick={toggleMute}
          title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          disabled={isMuted}
          title="SFX Volume"
        />
      </div>
      
      <div className="audio-section">
        <button 
          className={`music-button ${backgroundMusicEnabled ? 'active' : ''}`}
          onClick={toggleBackgroundMusic}
          title={backgroundMusicEnabled ? 'Disable background music' : 'Enable background music'}
        >
          🎵
        </button>
        <input
          type="range"
          min="0"
          max="0.15"
          step="0.01"
          value={backgroundMusicEnabled ? backgroundMusicVolume : 0}
          onChange={handleBackgroundVolumeChange}
          className="volume-slider music-slider"
          disabled={!backgroundMusicEnabled || isMuted}
          title="Music Volume"
        />
      </div>
    </div>
  )
}

export default AudioControls