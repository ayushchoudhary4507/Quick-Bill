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

async function request(method, path, data) {
  try {
    console.log(`[API Request] ${method} ${API_BASE_URL}${path}`, data ? data : '');
    const response = await api.request({
      method,
      url: path,
      data,
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

export const salesApi = {
  /** GET /sales — transaction history */
  async list() {
    return request('GET', '/sales')
  },
}
