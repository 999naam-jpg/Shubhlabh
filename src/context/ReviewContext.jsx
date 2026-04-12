import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const ReviewContext = createContext()

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    api.getReviews()
      .then(data => setReviews(data.map(r => ({ ...r, _id: r._id }))))
      .catch(console.error)
  }, [])

  const submitReview = async ({ orderId, name, event, rating, text, userPhoto, decorationPhotos }) => {
    const saved = await api.createReview({ orderId, name, event, rating, text, userPhoto, decorationPhotos })
    setReviews(prev => [saved, ...prev])
  }

  const editReview = async (id, { rating, text, decorationPhotos }) => {
    const updated = await api.updateReview(id, { rating, text, decorationPhotos })
    setReviews(prev => prev.map(r => r._id === id ? updated : r))
  }

  const deleteReview = async (id) => {
    await api.deleteReview(id)
    setReviews(prev => prev.filter(r => r._id !== id))
  }

  return (
    <ReviewContext.Provider value={{ reviews, submitReview, editReview, deleteReview }}>
      {children}
    </ReviewContext.Provider>
  )
}

export const useReviews = () => useContext(ReviewContext)
