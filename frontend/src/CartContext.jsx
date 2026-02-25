import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  function addToCart(product) {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Stock insuffisant pour ${product.name} (max: ${product.stock})`)
          return prev
        }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      if (product.stock < 1) {
          alert(`Produit en rupture de stock: ${product.name}`)
          return prev
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function removeFromCart(id) {
    setItems(prev => prev.filter(i => i.product.id !== id))
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems(prev => prev.map(i => {
      if (i.product.id === id) {
        if (quantity > i.product.stock) {
          alert(`Quantité max atteinte pour ${i.product.name}`)
          return { ...i, quantity: i.product.stock }
        }
        return { ...i, quantity }
      }
      return i
    }))
  }

  function clearCart() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans CartProvider')
  return ctx
}

