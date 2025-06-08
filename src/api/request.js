import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 2xx范围的状态码都视为成功
    if (response.status >= 200 && response.status < 300) {
      return response.data
    }
    
    ElMessage.error('请求失败')
    return Promise.reject(new Error('请求失败'))
  },
  error => {
    const { response } = error
    
    if (response && response.status) {
      switch (response.status) {
        case 401:
          // 对于登录接口的401错误，不要直接跳转，而是让调用方处理
          if (response.config.url && response.config.url.includes('/auth/login')) {
            // 登录接口的401错误，直接传递错误信息，不显示全局提示
            return Promise.reject(error)
          } else {
            // 其他接口的401错误，说明token过期
            ElMessage.error('登录已过期，请重新登录')
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            router.push('/login')
          }
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          // 只有在不是登录接口、修改密码接口和重置密码接口时才显示全局错误提示
          const isPasswordRelatedAPI = response.config.url && (
            response.config.url.includes('/auth/login') || 
            response.config.url.includes('/auth/password') ||
            response.config.url.includes('/password')
          )
          
          if (!isPasswordRelatedAPI) {
            ElMessage.error(response.data.message || '请求失败')
          }
      }
    } else {
      // 服务器连结果都没有返回
      if (!window.navigator.onLine) {
        // 断网处理
        ElMessage.error('网络连接中断，请检查网络')
      } else {
        ElMessage.error('请求超时，请重试')
        return Promise.reject(error)
      }
    }
    
    return Promise.reject(error)
  }
)

export default request 