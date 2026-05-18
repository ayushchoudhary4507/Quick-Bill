/**
 * API client for Quick-Bill POS.
 *
 * Endpoints mirror the FastAPI routers under `/api/v1`.
 */

import axios from 'axios'
import { extractApiErrorMessage } from '../utils/apiError.js'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to attach the JWT token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add a response interceptor to handle expired/invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized — clearing stale token')
      localStorage.removeItem('token')
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

async function request(method, path, data, headers = {}) {
  try {
    console.log(`[API Request] ${method} ${API_BASE_URL}${path}`, data ? data : '');
    const response = await api.request({
      method,
      url: path,
      data,
      headers: {
        ...headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })


    console.log(`[API Response] ${method} ${path}:`, response.data);
    return response.data
  } catch (error) {
    console.error(`[API Error] ${method} ${path}:`, error);
    const message = extractApiErrorMessage(error, 'Request failed')
    throw new Error(message, { cause: error })
  }
}

export const productsApi = {
  /** GET /products — full catalog for the POS grid */
  async list() {
    return request('GET', '/products')
  },
  
  /** POST /products — create a new product */
  async create(productData) {
    return request('POST', '/products', productData)
  },

  /** PUT /products/:id — update an existing product */
  async update(id, productData) {
    return request('PUT', `/products/${id}`, productData)
  },

  /** DELETE /products/:id — delete a product */
  async delete(id) {
    return request('DELETE', `/products/${id}`)
  },
}

export const checkoutApi = {
  /**
   * POST /checkout
   * Body: { items: [{ product_id, quantity }] }
   */
  async checkout(items) {
    return request('POST', '/checkout', { items })
  },
}

export const analyticsApi = {
  /** GET /analytics/top-products */
  async topProducts() {
    return request('GET', '/analytics/top-products')
  }
}

export const authApi = {
  /** POST /auth/login */
  async login(username, password) {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    return request('POST', '/auth/login', params, {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
    })
  },

  /** POST /auth/register */
  async register(username, password) {
    return request('POST', '/auth/register', { username, password })
  }
}


export const salesApi = {
  /** GET /sales — transaction history */
  async list() {
    return request('GET', '/sales')
  },
}

export const paymentApi = {
  /** POST /payments/create-checkout-session */
  async createCheckoutSession(data) {
    return request('POST', '/payments/create-checkout-session', data)
  },

  /** GET /payments/history */
  async getHistory() {
    return request('GET', '/payments/history')
  },

  /** GET /payments/admin/all */
  async getAllPayments() {
    return request('GET', '/payments/admin/all')
  },
  async verifySession(sessionId) {
    return request('GET', `/payments/verify-session/${sessionId}`)
  }
}


