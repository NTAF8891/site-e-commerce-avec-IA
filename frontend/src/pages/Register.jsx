import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../api.js'

export default function Register({ onAuth }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await registerUser({ firstName, lastName, email, password })
      onAuth(res.token, { firstName: res.firstName, lastName: res.lastName, role: res.role, userId: res.userId })
      navigate('/')
    } catch (e) {
      setError(e.message || 'Impossible de créer le compte')
    }
  }

  return (
    <div className="auth-card">
      <h2 className="auth-title">Créer un compte</h2>
      <p className="auth-subtitle">Inscrivez-vous pour passer vos commandes en toute simplicité.</p>
      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <span className="field-label">Prénom</span>
          <input className="field-input" placeholder="Jean" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div className="field">
          <span className="field-label">Nom</span>
          <input className="field-input" placeholder="Dupont" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <div className="field">
          <span className="field-label">Email</span>
          <input className="field-input" placeholder="vous@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <span className="field-label">Mot de passe</span>
          <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn btn-primary" style={{marginTop:8}}>Créer le compte</button>
      </form>
      <p style={{marginTop:16, fontSize:13}}>
        Déjà inscrit ?{' '}
        <span className="muted-link" onClick={() => navigate('/login')}>Se connecter</span>
      </p>
    </div>
  )
}
