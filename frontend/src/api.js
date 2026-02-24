const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:8080/api'

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

export function createOrder(items, token) {
  return request('/orders', { method: 'POST', body: { items }, token })
}

export function createPaymentIntent(orderId, currency, token) {
  return request('/orders/payment-intent', { method: 'POST', body: { orderId, currency }, token })
}
