<template>
  <div class="settings-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>通用配置</span>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存设置
          </el-button>
        </div>
      </template>
      
      <div class="settings-section">
        <div class="section-title">基本设置</div>
        <el-form 
          ref="settingsFormRef"
          :model="settingsForm" 
          :rules="settingsRules"
          label-width="120px"
        >
          <el-form-item label="系统名称" prop="systemName">
            <el-input 
              v-model="settingsForm.systemName" 
              placeholder="请输入系统名称"
              maxlength="50"
              show-word-limit
            />
            <div class="form-tip">
              <el-text type="info" size="small">系统名称将显示在页面标题和登录页面</el-text>
            </div>
          </el-form-item>
          
          <el-form-item label="系统版本" prop="systemVersion">
            <el-input 
              v-model="settingsForm.systemVersion" 
              placeholder="请输入系统版本"
              maxlength="20"
            />
            <div class="form-tip">
              <el-text type="info" size="small">系统版本信息，如：1.0.0</el-text>
            </div>
          </el-form-item>
          
          <el-form-item label="系统描述" prop="systemDescription">
            <el-input 
              v-model="settingsForm.systemDescription" 
              type="textarea"
              :rows="3"
              placeholder="请输入系统描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="备案信息" prop="recordNumber">
            <el-input 
              v-model="settingsForm.recordNumber" 
              placeholder="请输入备案号"
              maxlength="50"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <div class="settings-section">
        <div class="section-title">数据源配置</div>
        <el-form 
          ref="dataSourceFormRef"
          :model="dataSourceForm" 
          :rules="dataSourceRules"
          label-width="120px"
        >
          <el-form-item label="API服务地址" prop="apiBaseUrl">
            <el-input 
              v-model="dataSourceForm.apiBaseUrl" 
              placeholder="请输入API服务器地址，如：http://localhost:5001/api"
              maxlength="200"
            />
            <div class="form-tip">
              <el-text type="info" size="small">API服务器的完整地址，包含协议和端口号</el-text>
            </div>
          </el-form-item>
          
          <el-form-item label="请求超时时间" prop="apiTimeout">
            <el-input-number 
              v-model="dataSourceForm.apiTimeout" 
              :min="5000"
              :max="60000"
              :step="1000"
              placeholder="请输入超时时间（毫秒）"
            />
            <div class="form-tip">
              <el-text type="info" size="small">API请求的超时时间，单位：毫秒（建议5000-30000）</el-text>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSaveDataSource" :loading="savingDataSource">
              保存数据源配置
            </el-button>
            <el-button @click="handleResetDataSource">
              重置为默认值
            </el-button>
            <el-button @click="handleTestConnection" :loading="testingConnection">
              测试连接
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="settings-section">
        <div class="section-title">系统信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="当前版本">
            {{ settingsForm.systemVersion || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="系统名称">
            {{ settingsForm.systemName || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="最后更新时间">
            {{ formatDate(settingsForm.updatedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新人员">
            {{ settingsForm.updatedBy || '系统' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import request from '../../api/request'
import { getAllConfig, setConfig, resetConfig, getApiBaseUrl, CONFIG_KEYS } from '../../config/index'

// 响应式数据
const saving = ref(false)
const settingsFormRef = ref()
const dataSourceFormRef = ref()
const savingDataSource = ref(false)
const testingConnection = ref(false)

// 设置表单数据
const settingsForm = reactive({
  systemName: '',
  systemVersion: '',
  systemDescription: '',
  recordNumber: '',
  updatedAt: '',
  updatedBy: ''
})

// 数据源配置表单
const dataSourceForm = reactive({
  apiBaseUrl: '',
  apiTimeout: 15000
})

// 表单验证规则
const settingsRules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '系统名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  systemVersion: [
    { required: true, message: '请输入系统版本', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+$/, message: '版本格式应为 x.x.x', trigger: 'blur' }
  ],
  systemDescription: [
    { max: 200, message: '系统描述不能超过200个字符', trigger: 'blur' }
  ],
  recordNumber: [
    { max: 50, message: '备案信息不能超过50个字符', trigger: 'blur' }
  ]
}

// 数据源配置验证规则
const dataSourceRules = {
  apiBaseUrl: [
    { required: true, message: '请输入API服务地址', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' },
    { max: 200, message: 'URL长度不能超过200个字符', trigger: 'blur' }
  ],
  apiTimeout: [
    { required: true, message: '请输入超时时间', trigger: 'blur' },
    { type: 'number', min: 5000, max: 60000, message: '超时时间应在5000-60000毫秒之间', trigger: 'blur' }
  ]
}

// 方法
const getSettings = async () => {
  try {
    const response = await request.get('/admin/settings')
    if (response.success) {
      Object.assign(settingsForm, response.data.settings)
    }
  } catch (error) {
    console.error('获取设置失败:', error)
    // 如果获取失败，使用默认值
    settingsForm.systemName = 'SPRINKLE'
    settingsForm.systemVersion = '1.0.0'
    settingsForm.systemDescription = '水站管理系统'
  }
}

const handleSave = async () => {
  try {
    await settingsFormRef.value.validate()
    
    saving.value = true
    
    const response = await request.put('/admin/settings', {
      systemName: settingsForm.systemName,
      systemVersion: settingsForm.systemVersion,
      systemDescription: settingsForm.systemDescription,
      recordNumber: settingsForm.recordNumber
    })
    
    if (response.success) {
      ElMessage.success('设置保存成功')
      // 重新获取最新数据
      await getSettings()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('保存失败，请稍后重试')
    }
  } finally {
    saving.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '未更新'
  return new Date(date).toLocaleString('zh-CN')
}

// 数据源配置相关方法
const loadDataSourceConfig = () => {
  try {
    const config = getAllConfig()
    Object.assign(dataSourceForm, config)
  } catch (error) {
    console.error('加载数据源配置失败:', error)
    ElMessage.warning('加载数据源配置失败，请检查配置')
  }
}

const handleSaveDataSource = async () => {
  try {
    await dataSourceFormRef.value.validate()
    
    savingDataSource.value = true
    
    // 保存到localStorage
    setConfig(CONFIG_KEYS.API_BASE_URL, dataSourceForm.apiBaseUrl)
    setConfig(CONFIG_KEYS.API_TIMEOUT, dataSourceForm.apiTimeout)
    
    ElMessage.success('数据源配置保存成功')
    
    // 提示用户可能需要刷新页面
    ElMessage.info('配置已保存，建议刷新页面使新配置生效')
  } catch (error) {
    console.error('保存数据源配置失败:', error)
    ElMessage.error('保存失败，请检查配置格式')
  } finally {
    savingDataSource.value = false
  }
}

const handleResetDataSource = () => {
  ElMessageBox.confirm(
    '确定要重置数据源配置为默认值吗？',
    '重置确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    resetConfig()
    loadDataSourceConfig()
    ElMessage.success('已重置为默认配置')
  }).catch(() => {
    // 用户取消操作
  })
}

const handleTestConnection = async () => {
  try {
    await dataSourceFormRef.value.validate()
    
    testingConnection.value = true
    
    // 临时使用新配置进行测试
    const testRequest = axios.create({
      baseURL: dataSourceForm.apiBaseUrl,
      timeout: dataSourceForm.apiTimeout
    })
    
    const token = localStorage.getItem('token')
    if (token) {
      testRequest.defaults.headers.Authorization = `Bearer ${token}`
    }
    
    // 测试连接 - 调用获取用户信息接口
    const response = await testRequest.get('/admin/auth/profile')
    
    if (response.data && response.data.success) {
      ElMessage.success('连接测试成功！API服务器响应正常')
    } else {
      ElMessage.warning('连接成功但响应异常，请检查API服务器状态')
    }
  } catch (error) {
    console.error('连接测试失败:', error)
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('连接超时，请检查服务器地址和网络状态')
    } else if (error.response?.status === 401) {
      ElMessage.error('认证失败，请检查登录状态')
    } else if (error.response?.status) {
      ElMessage.error(`连接失败：HTTP ${error.response.status}`)
    } else {
      ElMessage.error('连接失败，请检查API服务器地址和网络状态')
    }
  } finally {
    testingConnection.value = false
  }
}

// 生命周期
onMounted(() => {
  getSettings()
  loadDataSourceConfig()
})
</script>

<style scoped>
.settings-container {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-section {
  margin-bottom: 24px;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
  color: #303133;
}

.form-tip {
  margin-top: 4px;
}

/* 表单样式优化 */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-textarea) {
  width: 100%;
}

/* 描述列表样式 */
:deep(.el-descriptions) {
  background-color: #fff;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  color: #606266;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    padding: 8px;
  }
  
  .settings-section {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  :deep(.el-descriptions) {
    --el-descriptions-item-bordered-label-background: #fafafa;
  }
}
</style> 