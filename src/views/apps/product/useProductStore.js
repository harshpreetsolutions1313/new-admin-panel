import axios from '@axios'
import { defineStore } from 'pinia'

const API_BASE = 'http://localhost:5000/api/products'

export const useProductStore = defineStore('ProductStore', {
  actions: {
    fetchProducts() {
      return axios.get(API_BASE)
    },
    fetchProduct(id) {
      return axios.get(`${API_BASE}/${id}`)
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

