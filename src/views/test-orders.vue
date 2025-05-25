<template>
  <div class="test-container">
    <el-card>
      <template #header>
        <span>订单API测试</span>
      </template>
      
      <el-space direction="vertical" style="width: 100%">
        <el-button type="primary" @click="testOrderAPI" :loading="loading">
          测试订单API
        </el-button>
        
        <el-divider />
        
        <div v-if="result">
          <h4>测试结果:</h4>
          <pre>{{ JSON.stringify(result, null, 2) }}</pre>
        </div>
        
        <div v-if="error" style="color: red;">
          <h4>错误信息:</h4>
          <pre>{{ error }}</pre>
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const loading = ref(false)
const result = ref(null)
const error = ref(null)

const testOrderAPI = async () => {
  loading.value = true
  result.value = null
  error.value = null
  
  try {
    console.log('开始测试订单API...')
    
    const response = await request({
      url: '/admin/orders',
      method: 'get',
      params: {
        page: 1,
        limit: 5
      }
    })
    
    result.value = response
    console.log('API测试成功:', response)
    ElMessage.success('API测试成功')
    
  } catch (err) {
    error.value = err.message || err.toString()
    console.error('API测试失败:', err)
    ElMessage.error('API测试失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-container {
  padding: 20px;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 400px;
  overflow: auto;
}
</style> 