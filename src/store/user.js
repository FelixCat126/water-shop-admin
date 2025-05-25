import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin } from '../api/auth'
import router from '../router'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 安全解析用户信息
  const getUserInfoFromStorage = () => {
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      return userInfoStr ? JSON.parse(userInfoStr) : {}
    } catch (e) {
      console.error('解析用户信息失败:', e)
      return {}
    }
  }
  
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(getUserInfoFromStorage())
  const loading = ref(false)
  const error = ref('')

  // 登录
  async function login(credentials) {
    loading.value = true
    error.value = ''
    try {
      const response = await apiLogin(credentials)
      
      // 检查响应数据结构
      if (response.success && response.data) {
        token.value = response.data.token
        // 后端返回的是 administrator 字段，这里要正确获取
        userInfo.value = response.data.administrator
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userInfo', JSON.stringify(response.data.administrator))
        
        ElMessage.success('登录成功')
        router.push('/')
        return true
      } else {
        const errorMsg = response.message || '登录失败，请检查用户名和密码'
        error.value = errorMsg
        ElMessage.error(errorMsg)
        return false
      }
    } catch (err) {
      // 从错误响应中提取具体的错误信息
      let errorMsg = '登录失败，请检查用户名和密码'
      
      if (err.response && err.response.data) {
        errorMsg = err.response.data.message || errorMsg
      } else if (err.message) {
        errorMsg = err.message
      }
      
      error.value = errorMsg
      ElMessage.error(errorMsg)
      console.error('登录错误:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }

  // 检查是否已登录
  function isLoggedIn() {
    return !!token.value
  }

  return {
    token,
    userInfo,
    loading,
    error,
    login,
    logout,
    isLoggedIn
  }
}) 