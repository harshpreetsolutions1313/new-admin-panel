// src/views/apps/user/useUserListStore.js (or wherever it's located)

import axios from 'axios'
import { defineStore } from 'pinia'

export const useUserListStore = defineStore('UserListStore', {
  actions: {
    // 👉 Fetch users – UPDATED
    // Now accepts filters and pagination options
    // Added cache-busting timestamp to prevent 304 Not Modified
    async fetchUsers({ q = '', role, plan, status, options }) {
      const params = new URLSearchParams()

      if (q) params.append('q', q)
      if (role) params.append('role', role)
      if (plan) params.append('plan', plan)
      if (status) params.append('status', status)
      if (options?.page) params.append('page', options.page)
      if (options?.itemsPerPage) params.append('itemsPerPage', options.itemsPerPage)

      // Optional: add sort if needed later
      // if (options?.sortBy?.length) {
      //   params.append('sortBy', options.sortBy[0].key)
      //   params.append('sortDesc', options.sortBy[0].order === 'desc')
      // }

      // 👉 CRITICAL FIX: Add timestamp to bust browser/server cache → forces fresh data every time
      params.append('_t', Date.now())

      return axios.get('http://localhost:5000/api/users', {
        params,
      })
    },

    // 👉 Add User – unchanged, but returns response for consistency
    async addUser(userData) {
      return axios.post('http://localhost:5000/api/users', userData)
    },

    // 👉 Fetch single user
    async fetchUser(id) {
      return axios.get(`http://localhost:5000/api/users/${id}`)
    },

    // 👉 Delete User
    async deleteUser(id) {
      return axios.delete(`http://localhost:5000/api/users/${id}`)
    },
  },
})
