import axios from '@axios'
import { defineStore } from 'pinia'

const API_BASE = 'https://ecom-smoky-delta.vercel.app/api/products'

export const useProductStore = defineStore('ProductStore', {
  actions: {
    async fetchProducts() {
      const tryFetch = (config = {}) => axios.get(API_BASE, {
        validateStatus: status => status >= 200 && status < 400,
        ...config,
      })

      const res = await tryFetch()

      // If 304 and we have cached response body, return it; otherwise refetch with cache-bust
      if (res.status === 304 && (!res.data || (Array.isArray(res.data) && res.data.length === 0))) {
        return tryFetch({
          params: { _t: Date.now() },
          headers: { 'Cache-Control': 'no-cache' },
        })
      }

      return res
    },
    async fetchProduct(id) {
      const tryFetch = (config = {}) => axios.get(`${API_BASE}/${id}`, {
        validateStatus: status => status >= 200 && status < 400,
        ...config,
      })

      const res = await tryFetch()

      if (res.status === 304 && !res.data) {
        return tryFetch({
          params: { _t: Date.now() },
          headers: { 'Cache-Control': 'no-cache' },
        })
      }

      return res
    },
    createProduct(payload) {
      return axios.post(API_BASE, payload)
    },
    updateProduct(id, payload) {
      return axios.put(`${API_BASE}/${id}`, payload)
    },
    deleteProduct(id) {
      return axios.delete(`${API_BASE}/${id}`)
    },
  },
})

