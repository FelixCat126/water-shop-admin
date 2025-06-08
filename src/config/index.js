/**
 * 前端配置管理
 * 优先级：localStorage > 环境变量 > 默认值
 */

// 配置键名
const CONFIG_KEYS = {
  API_BASE_URL: 'apiBaseUrl',
  API_TIMEOUT: 'apiTimeout'
}

// 默认配置
const DEFAULT_CONFIG = {
  apiBaseUrl: '', // 不设置默认值，强制从环境变量获取
  apiTimeout: 15000
}

/**
 * 获取配置值
 * @param {string} key 配置键
 * @returns {any} 配置值
 */
export function getConfig(key) {
  try {
    // 1. 优先从localStorage获取
    const localValue = localStorage.getItem(`config_${key}`)
    if (localValue !== null) {
      try {
        return JSON.parse(localValue)
      } catch {
        return localValue
      }
    }
    
    // 2. 从环境变量获取
    if (key === CONFIG_KEYS.API_BASE_URL) {
      const envValue = import.meta.env.VITE_API_BASE_URL
      if (envValue) {
        return envValue
      }
    }
    
    // 3. 使用默认值
    return DEFAULT_CONFIG[key]
  } catch (error) {
    console.error(`获取配置失败: ${key}`, error)
    return DEFAULT_CONFIG[key]
  }
}

/**
 * 设置配置值
 * @param {string} key 配置键
 * @param {any} value 配置值
 */
export function setConfig(key, value) {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(`config_${key}`, stringValue)
  } catch (error) {
    console.error(`设置配置失败: ${key}`, error)
  }
}

/**
 * 获取API基础URL
 * @returns {string} API基础URL
 */
export function getApiBaseUrl() {
  const baseUrl = getConfig(CONFIG_KEYS.API_BASE_URL)
  if (!baseUrl) {
    throw new Error('API配置失效：未找到有效的API服务器地址，请检查数据源配置')
  }
  return baseUrl
}

/**
 * 获取上传URL
 * @param {string} path 上传路径
 * @returns {string} 完整的上传URL
 */
export function getUploadUrl(path = '/upload') {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}${path}`
}

/**
 * 修复图片URL
 * @param {string} url 图片URL
 * @returns {string} 完整的图片URL
 */
export function fixImageUrl(url) {
  if (!url) return ''
  
  // 如果已经是完整的HTTP/HTTPS URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  try {
    const baseUrl = getApiBaseUrl()
    // 去掉末尾的/api
    const serverUrl = baseUrl.replace(/\/api\/?$/, '')
    
    // 如果是以/开头的绝对路径，直接拼接
    if (url.startsWith('/')) {
      return `${serverUrl}${url}`
    }
    
    // 如果是相对路径，在前面加上/
    return `${serverUrl}/${url}`
  } catch (error) {
    console.error('修复图片URL失败:', error.message)
    return url // 返回原始URL，避免显示异常
  }
}

/**
 * 获取所有配置
 * @returns {Object} 配置对象
 */
export function getAllConfig() {
  return {
    apiBaseUrl: getConfig(CONFIG_KEYS.API_BASE_URL),
    apiTimeout: getConfig(CONFIG_KEYS.API_TIMEOUT)
  }
}

/**
 * 重置配置（清除localStorage中的配置）
 */
export function resetConfig() {
  Object.values(CONFIG_KEYS).forEach(key => {
    localStorage.removeItem(`config_${key}`)
  })
}

// 导出配置键名常量
export { CONFIG_KEYS } 