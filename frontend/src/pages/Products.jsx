import React, { useEffect, useState } from 'react'
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

  if (loading) return <div className="centered-message">Chargement des produits...</div>

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:16}}>
        <h2 className="page-title">Catalogue</h2>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          {offline && <span className="pill">Mode hors-ligne</span>}
          <span className="chip-muted">{products.length} produit(s)</span>
          {error && <button className="btn btn-secondary" onClick={load}>Réessayer</button>}
        </div>
      </div>
      <div className="products-grid">
        {products.map(p => (
          <div key={p.id} className="product-card">
            {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="product-image" />}
            {!p.imageUrl && <div className="product-image" />}
            <div className="product-name">{p.name}</div>
            <div className="product-price">{p.price.toFixed(2)} €</div>
            <div className="product-meta">Stock: {p.stock}</div>
            <div className="card-footer">
              <span>{p.description}</span>
              <button className="btn btn-primary" onClick={() => addToCart(p)} disabled={p.stock <= 0}>
                Ajouter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
