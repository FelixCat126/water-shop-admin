<template>
    <div class="app-wrapper">
      <!-- 侧边栏 -->
      <div class="sidebar-container" :class="{ 'is-collapsed': isCollapse }">
        <div class="logo-container">
          <div class="logo-text" v-if="!isCollapse">SPRINKLE</div>
          <div class="logo-text-collapsed" v-else>S</div>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          :collapse="isCollapse"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse-transition="false"
          router
        >
          <el-menu-item index="/">
            <el-icon><Odometer /></el-icon>
            <template #title>控制台</template>
          </el-menu-item>
          
          <el-sub-menu index="products">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/products">商品列表</el-menu-item>
            <el-menu-item index="/coupons">优惠券管理</el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <template #title>订单管理</template>
          </el-menu-item>
          
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          
          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="/banners">轮播图管理</el-menu-item>
            <el-menu-item index="/contents">内容管理</el-menu-item>
            <el-menu-item v-if="userInfo.role === 'super_admin' || userInfo.role === 'admin'" index="/admins">管理员账号</el-menu-item>
            <el-menu-item index="/settings">通用配置</el-menu-item>
          </el-sub-menu>
        </el-menu>
        
        <div class="sidebar-footer">
          <el-tooltip
            effect="dark"
            :content="isCollapse ? '展开菜单' : '收起菜单'"
            placement="right"
          >
            <el-button
              link
              class="collapse-btn"
              @click="toggleSidebar"
            >
              <el-icon v-if="isCollapse"><Expand /></el-icon>
              <el-icon v-else><Fold /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
      
      <!-- 主要内容区 -->
      <div class="main-container">
        <!-- 顶部导航 -->
        <div class="navbar">
          <div class="left-menu">
            <breadcrumb />
          </div>
          <div class="right-menu">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="avatar-wrapper">
                <el-avatar :size="32" icon="UserFilled" />
                <div class="user-info">
                  <span class="user-name">{{ userInfo.realName || userInfo.username || '管理员' }}</span>
                  <span class="user-account">{{ userInfo.username }}</span>
                </div>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="password">
                    <el-icon><Key /></el-icon>修改密码
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <!-- 内容区域 -->
        <div class="app-main">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog 
      v-model="passwordDialogVisible" 
      title="修改密码" 
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="passwordFormRef" 
        :model="passwordForm" 
        :rules="passwordRules" 
        label-width="100px"
        @submit.prevent
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelPassword">取消</el-button>
          <el-button type="primary" @click="handleConfirmPassword" :loading="passwordLoading" :disabled="passwordLoading">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, computed, reactive } from 'vue'
  import { useRoute } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { ElMessage } from 'element-plus'
  import { Key } from '@element-plus/icons-vue'
  import { useUserStore } from '../store/user'
  import { changePassword } from '../api/auth'
  import Breadcrumb from '../components/Breadcrumb.vue'
  
  const route = useRoute()
  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)
  const isCollapse = ref(false)
  
  // 修改密码相关状态
  const passwordDialogVisible = ref(false)
  const passwordLoading = ref(false)
  const passwordFormRef = ref(null)
  
  // 修改密码表单
  const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // 密码验证函数
  const validatePassword = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入新密码'))
    } else if (value.length < 8) {
      callback(new Error('密码不能少于8位'))
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(value)) {
      callback(new Error('密码必须由字母和数字组成'))
    } else {
      callback()
    }
  }
  
  // 确认密码验证函数
  const validateConfirmPassword = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请再次输入新密码'))
    } else if (value !== passwordForm.newPassword) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }
  
  // 密码表单验证规则
  const passwordRules = {
    oldPassword: [
      { required: true, message: '请输入原密码', trigger: 'blur' }
    ],
    newPassword: [
      { required: true, validator: validatePassword, trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, validator: validateConfirmPassword, trigger: 'blur' }
    ]
  }
  
  // 当前激活的菜单项
  const activeMenu = computed(() => {
    const { meta, path } = route
    if (meta.activeMenu) {
      return meta.activeMenu
    }
    return path
  })
  
  // 切换侧边栏状态
  const toggleSidebar = () => {
    isCollapse.value = !isCollapse.value
  }
  
  // 处理下拉菜单操作
  const handleCommand = (command) => {
    switch (command) {
      case 'password':
        passwordDialogVisible.value = true
        break
      case 'logout':
        userStore.logout()
        break
    }
  }
  
  // 取消修改密码
  const handleCancelPassword = () => {
    passwordDialogVisible.value = false
    // 重置表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    if (passwordFormRef.value) {
      passwordFormRef.value.clearValidate()
    }
  }
  
  // 确认修改密码
  const handleConfirmPassword = async () => {
    if (!passwordFormRef.value) return
    
    // 防止重复提交
    if (passwordLoading.value) return
    
    // 验证表单
    const valid = await passwordFormRef.value.validate().catch(() => false)
    if (!valid) return
    
    passwordLoading.value = true
    
    try {
      const response = await changePassword({
        currentPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      
      ElMessage.success('密码修改成功，请重新登录')
      // 关闭密码修改窗口
      handleCancelPassword()
      // 修改密码后需要重新登录
      setTimeout(() => {
        userStore.logout()
      }, 1000)
    } catch (error) {
      // 从错误响应中提取具体错误信息
      let errorMsg = '密码修改失败'
      if (error.response && error.response.data) {
        errorMsg = error.response.data.message || errorMsg
      }
      ElMessage.error(errorMsg)
    } finally {
      passwordLoading.value = false
    }
  }
  </script>
  
  <style scoped>
  .app-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    overflow: hidden;
  }
  
  .sidebar-container {
    width: 210px;
    height: 100%;
    background: #304156;
    transition: width 0.28s;
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
    position: relative;
    z-index: 10;
  }
  
  .sidebar-container.is-collapsed {
    width: 64px;
  }
  
  .logo-container {
    height: 60px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b3649;
  }
  
  .logo-text {
    font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
    font-size: 20px;
    font-weight: bold;
    color: #ffffff;
    letter-spacing: 2px;
    text-align: center;
    transition: all 0.3s ease;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }
  
  .logo-text:hover {
    color: #409EFF;
    text-shadow: 0 1px 3px rgba(64, 158, 255, 0.3);
  }
  
  .logo-text-collapsed {
    font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
    transition: all 0.3s ease;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }
  
  .logo-text-collapsed:hover {
    color: #409EFF;
    text-shadow: 0 1px 3px rgba(64, 158, 255, 0.3);
  }
  
  .sidebar-menu {
    border-right: none;
  }
  
  .sidebar-footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    background-color: #2b3649;
  }
  
  .collapse-btn {
    color: #bfcbd9;
    font-size: 16px;
    padding: 8px;
    border-radius: 4px;
    transition: all 0.3s;
  }
  
  .collapse-btn:hover {
    color: #409EFF;
    background-color: rgba(64, 158, 255, 0.1);
  }
  
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .navbar {
    height: 60px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 9;
  }
  
  .left-menu {
    display: flex;
    align-items: center;
  }
  
  .right-menu {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .avatar-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .avatar-wrapper:hover {
    background-color: #f5f7fa;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .user-name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    line-height: 1.2;
  }
  
  .user-account {
    font-size: 12px;
    color: #909399;
    line-height: 1.2;
  }
  
  .app-main {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #f0f2f5;
  }
  
  /* 过渡动画 */
  .fade-transform-leave-active,
  .fade-transform-enter-active {
    transition: all 0.5s;
  }
  
  .fade-transform-enter-from {
    opacity: 0;
    transform: translateX(-30px);
  }
  
  .fade-transform-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .sidebar-container {
      position: fixed;
      z-index: 1001;
      height: 100vh;
      transform: translateX(-100%);
      transition: transform 0.28s;
    }
    
    .sidebar-container.is-open {
      transform: translateX(0);
    }
    
    .main-container {
      margin-left: 0;
    }
    
    .app-main {
      padding: 10px;
    }
  }
  </style>