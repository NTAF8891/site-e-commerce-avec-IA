import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api.js'

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await login(email, password)
      onAuth(res.token, { firstName: res.firstName, lastName: res.lastName, role: res.role, userId: res.userId })
      navigate('/')
    } catch (e) {
      setError(e.message || 'Email ou mot de passe invalide')
    }
  }

  return (
    <div className="auth-card">
      <h2 className="auth-title">Connexion</h2>
      <p className="auth-subtitle">Retrouvez vos articles et votre historique de commandes.</p>
      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <span className="field-label">Email</span>
          <input className="field-input" placeholder="vous@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <span className="field-label">Mot de passe</span>
          <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn btn-primary" style={{marginTop:8}}>Se connecter</button>
      </form>
      <p style={{marginTop:16, fontSize:13}}>
        Pas encore de compte ?{' '}
        <span className="muted-link" onClick={() => navigate('/register')}>Créer un compte</span>
      </p>
    </div>
  )
}
