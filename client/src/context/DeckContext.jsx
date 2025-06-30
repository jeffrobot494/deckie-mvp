import React, { createContext, useContext, useReducer } from 'react'

const DeckContext = createContext()

const initialState = {
  cardCounts: {},
  totalCards: 0
}

function deckReducer(state, action) {
  switch (action.type) {
    case 'ADD_CARD': {
      const { cardName } = action.payload
      const newCounts = { ...state.cardCounts }
      newCounts[cardName] = (newCounts[cardName] || 0) + 1
      
      const totalCards = Object.values(newCounts).reduce((sum, count) => sum + count, 0)
      
      return {
        ...state,
        cardCounts: newCounts,
        totalCards
      }
    }
    
    case 'REMOVE_CARD': {
      const { cardName } = action.payload
      const newCounts = { ...state.cardCounts }
      
      if (newCounts[cardName] && newCounts[cardName] > 0) {
        newCounts[cardName]--
        if (newCounts[cardName] === 0) {
          delete newCounts[cardName]
        }
      }
      
      const totalCards = Object.values(newCounts).reduce((sum, count) => sum + count, 0)
      
      return {
        ...state,
        cardCounts: newCounts,
        totalCards
      }
    }
    
    case 'CLEAR_DECK':
      return initialState
      
    default:
      return state
  }
}

export function DeckProvider({ children }) {
  const [state, dispatch] = useReducer(deckReducer, initialState)
  
  const addCard = (cardName) => {
    dispatch({ type: 'ADD_CARD', payload: { cardName } })
  }
  
  const removeCard = (cardName) => {
    dispatch({ type: 'REMOVE_CARD', payload: { cardName } })
  }
  
  const clearDeck = () => {
    dispatch({ type: 'CLEAR_DECK' })
  }
  
  const exportDeckAsText = () => {
    return Object.entries(state.cardCounts)
      .map(([cardName, count]) => `${count}x ${cardName}`)
      .join('\n')
  }
  
  const value = {
    ...state,
    addCard,
    removeCard,
    clearDeck,
    exportDeckAsText
  }
  
  return (
    <DeckContext.Provider value={value}>
      {children}
    </DeckContext.Provider>
  )
}

export function useDeck() {
  const context = useContext(DeckContext)
  if (!context) {
    throw new Error('useDeck must be used within a DeckProvider')
  }
  return context
}