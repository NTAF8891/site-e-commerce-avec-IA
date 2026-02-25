import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api.js'
import { useCart } from '../CartContext.jsx'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(false)
  const { addToCart } = useCart()

  async function load() {
    setLoading(true)
    setError('')
    setOffline(false)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (e) {
      setError('Impossible de joindre le serveur. Affichage d’exemples.')
      setOffline(true)
      // Fallback: générer 20 articles d’exemple avec images
      const examples = Array.from({ length: 20 }).map((_, i) => {
        const idx = i + 1
        return {
          id: idx,
          name: `Article ${idx} (exemple)`,
          description: "Exemple local",
          price: 9.99 + idx,
          stock: 10 + idx,
          imageUrl: `https://picsum.photos/seed/front${idx}/600/400`
        }
      })
      setProducts(examples)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Skeleton Loader Component
  const ProductSkeleton = () => (
    <div className="product-card">
      <div className="skeleton" style={{ height: '200px', width: '100%', marginBottom: '12px' }}></div>
      <div className="skeleton" style={{ height: '24px', width: '80%', marginBottom: '8px' }}></div>
      <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '12px' }}></div>
      <div className="card-footer">
        <div className="skeleton" style={{ height: '16px', width: '60%' }}></div>
        <div className="skeleton" style={{ height: '36px', width: '80px', borderRadius: '999px' }}></div>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:16}}>
        <h2 className="page-title">Catalogue</h2>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          {offline && <span className="pill">Mode hors-ligne</span>}
          {!loading && <span className="chip-muted">{products.length} produit(s)</span>}
          {error && <button className="btn btn-secondary" onClick={load}>Réessayer</button>}
        </div>
      </div>

      <div className="products-grid">
        {loading ? (
          // Show 8 skeletons while loading
          Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
        ) : (
          products.map(p => (
            <div key={p.id} className="product-card">
              <Link to={`/product/${p.id}`} style={{ display: 'contents' }}>
                {p.imageUrl ? (
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    className="product-image" 
                    loading="lazy" 
                  />
                ) : (
                  <div className="product-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    Pas d'image
                  </div>
                )}
                <div className="product-name">{p.name}</div>
                <div className="product-price">{p.price.toFixed(2)} €</div>
                <div className="product-meta">Stock: {p.stock}</div>
              </Link>
              
              <div className="card-footer">
                <span style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                  {p.description}
                </span>
                <button 
                  className="btn btn-primary" 
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigation when clicking 'Add'
                    addToCart(p);
                  }} 
                  disabled={p.stock <= 0}
                >
                  Ajouter
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
