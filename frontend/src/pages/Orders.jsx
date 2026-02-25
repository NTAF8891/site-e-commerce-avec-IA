import React, { useEffect, useState } from 'react'
import { getUserOrders } from '../api'
import './orders.css'

function Orders({ token }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    
    getUserOrders(token)
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [token])

  if (!token) return <p className="orders-message">Veuillez vous connecter pour voir vos commandes.</p>
  if (loading) return <p className="orders-message">Chargement de vos commandes...</p>
  if (error) return <p className="orders-error">{error}</p>

  return (
    <div className="orders-container">
      <h1 className="orders-title">Mes Commandes</h1>
      {orders.length === 0 ? (
        <p className="orders-empty">Vous n'avez pas encore passé de commande.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">Commande #{order.id}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="order-status-container">
                  <span className={`order-status status-${order.status.toLowerCase()}`}>
                    {order.status === 'PAID' ? 'Payée' : 
                     order.status === 'PENDING' ? 'En attente' : 
                     order.status === 'CANCELLED' ? 'Annulée' : order.status}
                  </span>
                  <span className="order-total">{order.totalAmount.toFixed(2)} €</span>
                </div>
              </div>
              
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-quantity">{item.quantity}x</span>
                    <span className="item-name">{item.productName}</span>
                    <span className="item-price">{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders