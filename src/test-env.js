// 测试环境变量
console.log('=== 环境变量测试 ===')
console.log('import.meta.env:', import.meta.env)
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('类型检查:', typeof import.meta.env.VITE_API_BASE_URL)

// 测试replace操作
const testUrl = import.meta.env.VITE_API_BASE_URL
console.log('测试URL:', testUrl)
if (testUrl) {
  console.log('replace后:', testUrl.replace('/api', ''))
} else {
  console.log('URL为空或undefined')
} 