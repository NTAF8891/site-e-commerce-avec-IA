import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useCart } from '../CartContext.jsx'
import { createOrder, createPaymentIntent } from '../api.js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_remplace_toi_meme')

function CheckoutForm({ clientSecret, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setError('')
    const cardElement = elements.getElement(CardElement)
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    })
    setProcessing(false)
    if (stripeError) {
      setError(stripeError.message || 'Erreur de paiement')
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess()
    } else {
      setError('Paiement non confirmé')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="field">
        <span className="field-label">Carte bancaire</span>
        <div style={{padding:10, borderRadius:12, border:'1px solid #d1d5db', background:'#f9fafb'}}>
          <CardElement />
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={!stripe || processing} style={{marginTop:12}}>
        {processing ? 'Traitement...' : 'Payer'}
      </button>
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
        setMessage('Panier vide')
        return
      }
      if (!token) {
        setMessage('Vous devez être connecté pour payer')
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
        setMessage('Erreur lors de la préparation du paiement')
      }
    }
    init()
  }, [items, token])

  function handleSuccess() {
    clearCart()
    setMessage('Paiement réussi, merci pour votre commande.')
    setTimeout(() => navigate('/'), 3000)
  }

  if (message && !clientSecret) {
    return <div className="centered-message">{message}</div>
  }

  return (
    <div className="checkout-card">
      <h2 className="section-title">Paiement sécurisé</h2>
      <p className="section-subtitle">Vos informations de paiement sont chiffrées via Stripe.</p>
      <div className="checkout-total">Total: {total.toFixed(2)} €</div>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} onSuccess={handleSuccess} />
        </Elements>
      )}
    </div>
  )
}
