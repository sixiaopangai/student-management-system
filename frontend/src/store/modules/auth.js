import { defineStore } from 'pinia'
import { login as loginApi, getCurrentUser, logout as logoutApi } from '@/api/auth'
import { setToken, getToken, removeToken } from '@/utils/token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken(),
    userInfo: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userRole: (state) => state.userInfo?.role,
    userId: (state) => state.userInfo?.id,
    username: (state) => state.userInfo?.username,
    realName: (state) => state.userInfo?.realName
  },

  actions: {
    // 登录
    async login(credentials) {
      try {
        const { token, userInfo } = await loginApi(credentials)
        this.token = token
        this.userInfo = userInfo
        setToken(token)
        return userInfo
      } catch (error) {
        this.token = null
        this.userInfo = null
        removeToken()
        throw error
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      if (!this.token) {
        return null
      }
      try {
        const userInfo = await getCurrentUser()
        this.userInfo = userInfo
        return userInfo
      } catch (error) {
        this.token = null
        this.userInfo = null
        removeToken()
        throw error
      }
    },

    // 退出登录
    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        this.token = null
        this.userInfo = null
        removeToken()
      }
    },

    // 重置状态
    resetState() {
      this.token = null
      this.userInfo = null
      removeToken()
    }
  }
})