<template>
  <div class="login-container">
    <!-- 背景装饰元素 -->
    <div class="bg-decoration">
      <div class="bubble bubble-1"></div>
      <div class="bubble bubble-2"></div>
      <div class="bubble bubble-3"></div>
      <div class="wave-1"></div>
      <div class="wave-2"></div>
    </div>
    
    <div class="login-box">
      <div class="login-header">
        <div class="brand-logo">
          <div class="logo-icon">
            <i class="el-icon-water-drop"></i>
            <span class="logo-text">S</span>
          </div>
        </div>
        <h1 class="brand-title">SPRINKLE</h1>
                    <p class="brand-subtitle">管理后台</p>
        <div class="header-divider"></div>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        autocomplete="off"
      >
        <el-form-item prop="username">
          <div class="input-wrapper">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              clearable
              size="large"
              @keyup.enter="handleLogin"
            />
          </div>
        </el-form-item>
        
        <el-form-item prop="password">
          <div class="input-wrapper">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              clearable
              size="large"
              @keyup.enter="handleLogin"
            />
          </div>
        </el-form-item>
        
        <el-form-item class="login-button-item">
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            size="large"
            @click="handleLogin"
          >
            <span v-if="!loading">立即登录</span>
            <span v-else>登录中...</span>
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <div v-if="showDemoTips" class="demo-tips">
          <el-alert
            title="演示账号信息"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p><strong>超级管理员：</strong>superadmin / admin123456</p>
              <p><strong>普通管理员：</strong>admin / admin123</p>
            </template>
          </el-alert>
        </div>
        
        <div class="copyright">
          <p>© {{ currentYear }} SPRINKLE</p>
          <p>专业 · 安全 · 可靠</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const { loading, error } = storeToRefs(userStore)
const loginFormRef = ref(null)

// 控制演示账号信息显示
const showDemoTips = ref(false)

// 键盘按键状态
const keysPressed = reactive({
  cmd: false,
  q: false,
  p: false
})

// 获取当前年份
const currentYear = computed(() => {
  return new Date().getFullYear()
})

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度为 6-30 个字符', trigger: 'blur' }
  ]
}

// 检查是否同时按下了 Command+Q+P
const checkKeyCombo = () => {
  if (keysPressed.cmd && keysPressed.q && keysPressed.p) {
    showDemoTips.value = !showDemoTips.value
    if (showDemoTips.value) {
      ElMessage.success('演示账号信息已显示')
    } else {
      ElMessage.info('演示账号信息已隐藏')
    }
  }
}

// 键盘按下事件
const handleKeyDown = (event) => {
  if (event.metaKey || event.ctrlKey) {
    keysPressed.cmd = true
  }
  if (event.key.toLowerCase() === 'q') {
    keysPressed.q = true
  }
  if (event.key.toLowerCase() === 'p') {
    keysPressed.p = true
  }
  
  checkKeyCombo()
}

// 键盘释放事件
const handleKeyUp = (event) => {
  if (!event.metaKey && !event.ctrlKey) {
    keysPressed.cmd = false
  }
  if (event.key.toLowerCase() === 'q') {
    keysPressed.q = false
  }
  if (event.key.toLowerCase() === 'p') {
    keysPressed.p = false
  }
}

// 处理登录
const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      await userStore.login(loginForm)
    } else {
      ElMessage.warning('请填写完整的登录信息')
      return false
    }
  })
}

// 页面标题和事件监听
onMounted(() => {
  document.title = 'SPRINKLE 后台管理'
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
})

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
})
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, 
    #1e3c72 0%,
    #2563eb 25%, 
    #1d4ed8 50%, 
    #1e40af 75%,
    #1e3c72 100%);
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 背景装饰元素 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  animation: float 8s ease-in-out infinite;
  backdrop-filter: blur(2px);
}

.bubble-1 {
  width: 120px;
  height: 120px;
  left: 8%;
  top: 15%;
  animation-delay: 0s;
}

.bubble-2 {
  width: 180px;
  height: 180px;
  right: 12%;
  top: 60%;
  animation-delay: 3s;
}

.bubble-3 {
  width: 80px;
  height: 80px;
  left: 75%;
  top: 25%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg) scale(1); 
    opacity: 0.6;
  }
  50% { 
    transform: translateY(-30px) rotate(180deg) scale(1.1); 
    opacity: 0.8;
  }
}

.wave-1, .wave-2 {
  position: absolute;
  width: 300%;
  height: 300px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
}

.wave-1 {
  bottom: -150px;
  left: -100%;
  animation: wave 25s linear infinite;
}

.wave-2 {
  top: -150px;
  right: -100%;
  animation: wave 30s linear infinite reverse;
}

@keyframes wave {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 登录框样式 */
.login-box {
  width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  border-radius: 24px;
  padding: 48px 40px 40px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 12px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.25);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.brand-logo {
  margin-bottom: 20px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #1e3c72 0%, #1d4ed8 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 10px 30px rgba(30, 60, 114, 0.4);
}

.logo-text {
  font-size: 36px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #1e3c72 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0 0 24px 0;
  font-weight: 400;
}

.header-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #1e3c72 0%, #1d4ed8 100%);
  margin: 0 auto;
  border-radius: 2px;
}

/* 表单样式 */
.login-form {
  margin-bottom: 32px;
}

.input-wrapper {
  margin-bottom: 4px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__wrapper) {
  background-color: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: none;
  transition: all 0.3s ease;
  padding: 12px 16px;
}

:deep(.el-input__wrapper:hover) {
  border-color: #1d4ed8;
  background-color: #ffffff;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #1d4ed8 !important;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
}

:deep(.el-input__inner) {
  font-size: 16px;
  color: #2d3748;
}

:deep(.el-input__inner::placeholder) {
  color: #a0aec0;
  font-size: 15px;
}

.login-button-item {
  margin-bottom: 0;
}

.login-button {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #1e3c72 0%, #1d4ed8 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(30, 60, 114, 0.4);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(29, 78, 216, 0.5);
}

.login-button:active {
  transform: translateY(0);
}

/* 页脚样式 */
.login-footer {
  margin-top: 32px;
}

.demo-tips {
  margin-bottom: 24px;
}

:deep(.el-alert) {
  border-radius: 12px;
  border: none;
  background-color: #f0f9ff;
  border-left: 4px solid #1d4ed8;
}

:deep(.el-alert__content) {
  padding-left: 8px;
}

:deep(.el-alert__title) {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 8px;
}

.demo-tips p {
  margin: 4px 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

.copyright {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.copyright p {
  margin: 4px 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
}

.copyright p:first-child {
  font-weight: 500;
  color: #64748b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-box {
    width: 90%;
    max-width: 380px;
    padding: 32px 24px;
    margin: 20px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .logo-icon {
    width: 64px;
    height: 64px;
  }
  
  .logo-text {
    font-size: 28px;
  }
}

/* 加载状态动画 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.login-button.is-loading {
  animation: pulse 1.5s ease-in-out infinite;
}
</style> 