const API_BASE_URL = 'http://localhost:3000/api'

export const api = {
  async createDeckie(data) {
    const response = await fetch(`${API_BASE_URL}/deckie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create deckbuilder')
    }
    
    return response.json()
  },
  
  async getDeckie(deckieUrl) {
    const response = await fetch(`${API_BASE_URL}/deckie/${deckieUrl}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch deckbuilder')
    }
    
    return response.json()
  },

  async getCards(deckieUrl) {
    const response = await fetch(`${API_BASE_URL}/cards/${deckieUrl}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch cards')
    }
    
    return response.json()
  },

  async getCardsStatus(deckieUrl) {
    const response = await fetch(`${API_BASE_URL}/cards/${deckieUrl}/status`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch processing status')
    }
    
    return response.json()
  },
  
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.json()
  },

  async exportToTTS(deckieUrl, deckCards) {
    const response = await fetch(`${API_BASE_URL}/deckie/${deckieUrl}/export-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deckCards })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to export to TTS')
    }
    
    return response.json()
  }
}