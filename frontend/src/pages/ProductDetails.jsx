import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProduct } from '../api'
import { useCart } from '../CartContext'
import '../product-details.css'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const data = await getProduct(id)
        setProduct(data)
      } catch (err) {
        console.error(err)
        setError("Impossible de charger le produit. Il n'existe peut-être plus.")
      } finally {
        setLoading(false)
      }
    }
    
    if (id) fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="product-details-container">
        <Link to="/" className="back-link">← Retour au catalogue</Link>
        <div className="product-details-grid">
          <div className="skeleton" style={{ height: '500px', borderRadius: '8px' }}></div>
          <div className="product-info">
            <div className="skeleton" style={{ height: '40px', width: '70%' }}></div>
            <div className="skeleton" style={{ height: '30px', width: '30%' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '20%' }}></div>
            <div className="skeleton" style={{ height: '100px', width: '100%' }}></div>
            <div className="skeleton" style={{ height: '50px', width: '100%', marginTop: 'auto' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-details-container">
        <Link to="/" className="back-link">← Retour au catalogue</Link>
        <div className="error-message">
          <h2>Oups !</h2>
          <p>{error || "Produit introuvable"}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">Retour à l'accueil</button>
        </div>
      </div>
    )
  }

  const isStockAvailable = product.stock > 0

  return (
    <div className="product-details-container">
      <Link to="/" className="back-link">← Retour au catalogue</Link>
      
      <div className="product-details-grid">
        <div className="product-image-container">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="product-detail-image"
            />
          ) : (
            <div className="product-placeholder">Pas d'image</div>
          )}
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta-header">
            <span className="product-price-tag">{product.price.toFixed(2)} €</span>
            <span className={`stock-badge ${isStockAvailable ? 'stock-in' : 'stock-out'}`}>
              {isStockAvailable ? `En stock (${product.stock})` : 'Rupture de stock'}
            </span>
          </div>

          <div className="product-description">
            <p>{product.description}</p>
          </div>

          <div className="add-to-cart-section">
            <button 
              className="add-cart-btn"
              onClick={() => addToCart(product)}
              disabled={!isStockAvailable}
            >
              {isStockAvailable ? 'Ajouter au panier' : 'Indisponible'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
