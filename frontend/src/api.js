const getApiUrl = () => {
  // URL de secours si la variable d'environnement est mal configurée
  const FALLBACK_PROD_URL = 'https://mon-backend-shop.onrender.com/api'
  
  let url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:8080/api'
  
  // Si l'URL contient le placeholder par défaut (erreur fréquente), on force la bonne URL
  if (url.includes('votre-backend-url')) {
    console.warn('VITE_API_URL est mal configuré (placeholder détecté). Utilisation de l\'URL de secours:', FALLBACK_PROD_URL)
    url = FALLBACK_PROD_URL
  }
  
  if (url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  
  if (!url.endsWith('/api')) {
    url = `${url}/api`
  }
  
  // Eviter le double /api/api
  if (url.endsWith('/api/api')) {
    url = url.replace('/api/api', '/api')
  }
  
  return url
}

const API_URL = getApiUrl()

async function request(path, options = {}) {
  const res = await fetch(API_URL + path, {
    headers: {
      'Content-Type': options.body instanceof FormData ? undefined : 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    ...options,
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const msg = text || `Erreur API (${res.status})`
    throw new Error(msg)
  }
  return res.status === 204 ? null : res.json()
}

export function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } })
}

export function registerUser(data) {
  return request('/auth/register', { method: 'POST', body: data })
}

export function getProducts() {
  return request('/products', { method: 'GET' })
}

export function getProduct(id) {
  return request(`/products/${id}`, { method: 'GET' })
}

export function createOrder(items, token) {
  return request('/orders', { method: 'POST', body: { items }, token })
}

export function createPaymentIntent(orderId, currency, token) {
  return request('/orders/payment-intent', { method: 'POST', body: { orderId, currency }, token })
}

export function getUserOrders(token) {
  return request('/orders', { method: 'GET', token })
}
