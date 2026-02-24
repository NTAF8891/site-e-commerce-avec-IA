import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../CartContext.jsx'

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total } = useCart()

  if (!items.length) {
    return (
      <div className="centered-message">
        <h2 className="page-title">Panier</h2>
        <p>Votre panier est vide pour l’instant.</p>
        <Link to="/" className="btn btn-primary" style={{marginTop:12}}>Découvrir les produits</Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="page-title">Panier</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Prix</th>
              <th>Quantité</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.product.id}>
                <td>{i.product.name}</td>
                <td>{i.product.price.toFixed(2)} €</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={i.quantity}
                    onChange={e => updateQuantity(i.product.id, Number(e.target.value))}
                    className="field-input"
                    style={{maxWidth:80}}
                  />
                </td>
                <td>{(i.product.price * i.quantity).toFixed(2)} €</td>
                <td>
                  <button className="btn btn-danger" onClick={() => removeFromCart(i.product.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cart-footer">
        <div className="checkout-total">Total: {total.toFixed(2)} €</div>
        <Link to="/checkout" className="btn btn-primary">Aller au paiement</Link>
      </div>
    </div>
  )
}
