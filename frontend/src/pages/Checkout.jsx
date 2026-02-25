import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useCart } from '../CartContext.jsx'
import { createOrder, createPaymentIntent } from '../api.js'
import '../checkout.css' // Import des nouveaux styles

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_remplace_toi_meme')

function CheckoutForm({ clientSecret, onSuccess, totalAmount }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  
  // États pour le formulaire détaillé
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'FR' // Par défaut France
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return

    // Validation basique
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.postalCode) {
      setError('Veuillez remplir tous les champs du formulaire.')
      return
    }

    setProcessing(true)
    setError('')

    const cardElement = elements.getElement(CardElement)

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            address: {
              line1: formData.address,
              city: formData.city,
              postal_code: formData.postalCode,
              country: formData.country,
            },
          },
        },
      })

      if (stripeError) {
        setError(stripeError.message || 'Erreur de paiement')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess()
      } else {
        setError('Paiement non confirmé. Statut: ' + (paymentIntent ? paymentIntent.status : 'inconnu'))
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form-container">
      <h3 style={{marginTop:0, marginBottom:20, fontSize:18, color:'#4b5563'}}>Informations de facturation</h3>
      
      <div className="checkout-grid">
        <div className="checkout-field full-width">
          <label className="checkout-label">Nom complet sur la carte</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="checkout-input" 
            placeholder="Jean Dupont"
            required 
          />
        </div>

        <div className="checkout-field full-width">
          <label className="checkout-label">Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className="checkout-input" 
            placeholder="jean.dupont@example.com"
            required 
          />
        </div>

        <div className="checkout-field full-width">
          <label className="checkout-label">Adresse</label>
          <input 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            className="checkout-input" 
            placeholder="123 Rue de la Paix"
            required 
          />
        </div>

        <div className="checkout-field">
          <label className="checkout-label">Ville</label>
          <input 
            type="text" 
            name="city" 
            value={formData.city} 
            onChange={handleChange} 
            className="checkout-input" 
            placeholder="Paris"
            required 
          />
        </div>

        <div className="checkout-field">
          <label className="checkout-label">Code Postal</label>
          <input 
            type="text" 
            name="postalCode" 
            value={formData.postalCode} 
            onChange={handleChange} 
            className="checkout-input" 
            placeholder="75000"
            required 
          />
        </div>
      </div>

      <h3 style={{marginTop:24, marginBottom:16, fontSize:18, color:'#4b5563'}}>Paiement</h3>
      
      <div className="checkout-field full-width" style={{marginBottom: 24}}>
        <label className="checkout-label" style={{marginBottom:8}}>Numéro de carte</label>
        <div className="stripe-card-element">
          <CardElement options={cardStyle} />
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px', 
          background: '#fee2e2', 
          color: '#b91c1c', 
          borderRadius: '8px', 
          fontSize: '14px', 
          marginBottom: '16px',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      <button 
        type="submit" 
        className="checkout-submit-btn" 
        disabled={!stripe || processing}
      >
        {processing ? 'Traitement en cours...' : `Payer ${totalAmount.toFixed(2)} €`}
      </button>
      
      <div style={{textAlign:'center', marginTop:16, fontSize:12, color:'#9ca3af'}}>
        <span role="img" aria-label="lock">🔒</span> Paiement 100% sécurisé via Stripe
      </div>
    </form>
  )
}

export default function Checkout({ token }) {
  const { items, total, clearCart } = useCart()
  const [clientSecret, setClientSecret] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function init() {
      if (!items.length) {
        setMessage('Votre panier est vide.')
        return
      }
      if (!token) {
        setMessage('Vous devez être connecté pour procéder au paiement.')
        return
      }
      try {
        const order = await createOrder(
          items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          token
        )
        const res = await createPaymentIntent(order.id, 'eur', token)
        setClientSecret(res.clientSecret)
      } catch (e) {
        console.error("Erreur checkout:", e)
        setMessage('Erreur lors de l\'initialisation du paiement. Veuillez réessayer.')
      }
    }
    init()
  }, [items, token])

  function handleSuccess() {
    clearCart()
    setMessage('✅ Paiement réussi ! Merci pour votre commande.')
    setTimeout(() => navigate('/'), 3000)
  }

  if (message && !clientSecret) {
    return (
      <div style={{
        display:'flex', 
        justifyContent:'center', 
        alignItems:'center', 
        minHeight:'60vh', 
        flexDirection:'column',
        gap: '16px'
      }}>
        <div style={{fontSize:18, color:'#374151'}}>{message}</div>
        {!token && (
           <button onClick={() => navigate('/login')} className="btn btn-primary">
             Se connecter
           </button>
        )}
        {items.length === 0 && (
           <button onClick={() => navigate('/')} className="btn btn-primary">
             Retour à la boutique
           </button>
        )}
      </div>
    )
  }

  return (
    <div className="checkout-page" style={{padding: '40px 16px'}}>
      <h2 className="section-title">Finaliser votre commande</h2>
      <p className="section-subtitle">Veuillez remplir le formulaire ci-dessous pour valider votre achat.</p>
      
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm 
            clientSecret={clientSecret} 
            onSuccess={handleSuccess} 
            totalAmount={total} 
          />
        </Elements>
      )}
    </div>
  )
}
