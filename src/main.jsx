import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { ReviewProvider } from './context/ReviewContext'
import './index.css'
import './animations.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <ReviewProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ReviewProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
)
