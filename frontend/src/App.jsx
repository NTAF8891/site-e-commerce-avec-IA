import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Products from './pages/Products.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import { useCart } from './CartContext.jsx'

function Navbar({ token, user, onLogout }) {
  const location = useLocation()
  const { items } = useCart()
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const isActive = path => location.pathname === path
  
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="nav-left">
          <Link to="/" className="nav-brand">m2 shop</Link>
          <div className="nav-links">
            <Link to="/" className={`nav-link${isActive('/') ? ' pill' : ''}`}>Produits</Link>
            <Link to="/cart" className={`nav-link${isActive('/cart') ? ' pill' : ''}`}>
              Panier {cartCount > 0 && <span className="cart-badge">({cartCount})</span>}
            </Link>
          </div>
        </div>
        <div className="nav-actions">
          {!token && (
            <>
              <Link to="/login" className="btn btn-secondary">Connexion</Link>
              <Link to="/register" className="btn btn-primary">Inscription</Link>
            </>
          )}
          {token && (
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
              <span className="user-greeting">Bonjour, {user?.firstName || 'Client'}</span>
              <button className="btn btn-ghost" onClick={onLogout}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const navigate = useNavigate()

  useEffect(() => { 
    if (token) localStorage.setItem('token', token); 
    else localStorage.removeItem('token') 
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user')
  }, [user])

  const handleAuth = (token, userData) => {
    setToken(token)
    setUser(userData)
  }

  const handleLogout = () => {
    setToken('')
    setUser(null)
    navigate('/')
  }

  // Gestion de l'inactivité (30 min)
  useEffect(() => {
    if (!token) return

    const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutes
    let timeoutId

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        alert("Vous avez été déconnecté après 30 minutes d'inactivité.")
        handleLogout()
      }, INACTIVITY_LIMIT)
    }

    // Événements à surveiller
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(event => window.addEventListener(event, resetTimer))

    resetTimer() // Initialiser le timer

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [token]) // Se réactive à la connexion/déconnexion

  return (
    <div className="app-shell">
      <Navbar token={token} user={user} onLogout={handleLogout} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Products token={token} />} />
          <Route path="/login" element={<Login onAuth={handleAuth} />} />
          <Route path="/register" element={<Register onAuth={handleAuth} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout token={token} />} />
        </Routes>
      </main>
    </div>
  )
}
