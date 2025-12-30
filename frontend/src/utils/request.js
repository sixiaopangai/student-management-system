import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from './token'
import { getErrorMessage } from '@/constants/errorCodes'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { code, message, data } = response.data

    // 业务成功
    if (code === 200) {
      return data
    }

    // 登录状态失效
    if (code === 40002) {
      ElMessage.error('登录已过期，请重新登录')
      removeToken()
      router.push('/login')
      return Promise.reject(new Error(message))
    }

    // 其他业务错误
    const errorMsg = message || getErrorMessage(code)
    ElMessage.error(errorMsg)
    return Promise.reject(new Error(errorMsg))
  },
  error => {
    console.error('响应错误:', error)
    
    // HTTP 错误处理
    if (error.response) {
      const { status } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          removeToken()
          router.push('/login')
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(`请求失败: ${status}`)
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default request