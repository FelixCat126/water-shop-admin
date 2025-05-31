<template>
    <div class="admin-list-container">
      <!-- 搜索和筛选 -->
      <el-card shadow="never" class="search-card">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索管理员用户名、姓名、邮箱"
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <div class="filter-actions">
            <el-button @click="handleRefresh" :loading="loading" class="search-button">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增管理员
            </el-button>
          </div>
        </div>
      </el-card>
  
      <!-- 表格工具栏和表格 -->
      <el-card shadow="never" class="table-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <span class="total-info">共 {{ pagination.total }} 个管理员账号</span>
          </div>
          <div class="toolbar-right">
            <el-tooltip content="刷新" placement="top">
              <el-button 
                type="text" 
                @click="getAdminList"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
  
        <!-- 管理员表格 -->
        <el-table
          v-loading="loading"
          :data="adminList"
          row-key="_id"
          border
          style="width: 100%"
        >
          <el-table-column prop="username" label="用户名" width="150" show-overflow-tooltip />
          
          <el-table-column prop="realName" label="真实姓名" width="150" show-overflow-tooltip />
          
          <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
          
          <el-table-column label="角色" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getRoleType(row.role)" size="small">
                {{ getRoleName(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.isActive"
                @change="(val) => handleToggleStatus(row, val)"
                :disabled="row.role === 'super_admin'"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="最后登录" width="160" align="center">
            <template #default="{ row }">
              <span class="date-text">{{ formatDate(row.lastLogin) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="创建时间" width="160" align="center">
            <template #default="{ row }">
              <span class="date-text">{{ formatDate(row.createdAt) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button 
                link 
                type="danger" 
                @click="handleDelete(row)"
                :disabled="row.role === 'super_admin'"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
  
      <!-- 管理员编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        :before-close="handleDialogClose"
      >
        <el-form
          ref="adminFormRef"
          :model="adminForm"
          :rules="adminRules"
          label-width="100px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="adminForm.username" 
              placeholder="请输入用户名"
              :disabled="!!adminForm._id"
            />
          </el-form-item>
          
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="adminForm.realName" placeholder="请输入真实姓名" />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="adminForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="adminForm.phone" placeholder="请输入手机号" />
          </el-form-item>
          
          <el-form-item label="角色" prop="role">
            <el-select v-model="adminForm.role" placeholder="请选择角色" style="width: 100%">
              <el-option label="超级管理员" value="super_admin" />
              <el-option label="管理员" value="admin" />
              <el-option label="操作员" value="operator" />
            </el-select>
          </el-form-item>
          
          <el-form-item v-if="!adminForm._id" label="密码" prop="password">
            <el-input 
              v-model="adminForm.password" 
              type="password" 
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item v-if="!adminForm._id" label="确认密码" prop="confirmPassword">
            <el-input 
              v-model="adminForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input 
              v-model="adminForm.remark" 
              type="textarea" 
              :rows="3"
              placeholder="请输入备注信息"
            />
          </el-form-item>
          
          <el-form-item label="状态">
            <el-switch
              v-model="adminForm.isActive"
              active-text="启用"
              inactive-text="禁用"
              :disabled="adminForm.role === 'super_admin'"
            />
            <div v-if="adminForm.role === 'super_admin'" class="form-tip">
              <el-text type="warning" size="small">超级管理员不能被禁用</el-text>
            </div>
          </el-form-item>
        </el-form>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, computed, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, Search, Refresh } from '@element-plus/icons-vue'
  import request from '../../api/request'
  
  // 响应式数据
  const loading = ref(false)
  const submitLoading = ref(false)
  const adminList = ref([])
  const dialogVisible = ref(false)
  const adminFormRef = ref()
  
  // 搜索表单
  const searchForm = reactive({
    keyword: ''
  })
  
  // 分页数据
  const pagination = reactive({
    page: 1,
    limit: 10,
    total: 0
  })
  
  // 管理员表单
  const adminForm = reactive({
    _id: '',
    username: '',
    realName: '',
    email: '',
    phone: '',
    role: 'operator',
    password: '',
    confirmPassword: '',
    remark: '',
    isActive: true
  })
  
  // 表单验证规则
  const adminRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    realName: [
      { required: true, message: '请输入真实姓名', trigger: 'blur' }
    ],
    email: [
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    role: [
      { required: true, message: '请选择角色', trigger: 'change' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== adminForm.password) {
            callback(new Error('两次输入密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }
  
  // 计算属性
  const dialogTitle = computed(() => {
    return adminForm._id ? '编辑管理员' : '新增管理员'
  })
  
  // 方法
  const getAdminList = async () => {
    loading.value = true
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchForm.keyword
      }
      
      const response = await request.get('/admin/administrators', { params })
      
      if (response.success) {
        adminList.value = response.data.administrators
        pagination.total = response.data.total
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error)
      ElMessage.error('获取管理员列表失败')
    } finally {
      loading.value = false
    }
  }
  
  const handleRefresh = () => {
    console.log('🔄 手动刷新管理员列表')
    getAdminList()
  }
  
  const handleAdd = () => {
    console.log('🆕 开始新增管理员...')
    resetForm()
    dialogVisible.value = true
  }
  
  const handleEdit = async (row) => {
    try {
      console.log('获取管理员详情:', row._id)
      
      // 直接使用列表中的数据填充表单
      Object.assign(adminForm, {
        _id: row._id || row.id,
        username: row.username,
        realName: row.realName,
        email: row.email,
        phone: row.phone,
        role: row.role,
        remark: row.remark,
        isActive: row.isActive
      })
      
      // 显示对话框
      dialogVisible.value = true
    } catch (error) {
      console.error('获取管理员详情失败:', error)
      ElMessage.error('获取管理员详情失败')
    }
  }
  
  const handleDelete = async (row) => {
    if (row.role === 'super_admin') {
      ElMessage.warning('超级管理员不能删除')
      return
    }
    
    try {
      await ElMessageBox.confirm('确定要删除这个管理员吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      const response = await request.delete(`/admin/administrators/${row._id || row.id}`)
      if (response.success) {
        ElMessage.success('删除成功')
        getAdminList()
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除管理员失败:', error)
        ElMessage.error('删除管理员失败')
      }
    }
  }
  
  const handleToggleStatus = async (row, newStatus) => {
    // 检查是否为超级管理员
    if (row.role === 'super_admin' && !newStatus) {
      ElMessage.warning('超级管理员不能被禁用')
      // 恢复原状态
      row.isActive = true
      return
    }
    
    try {
      const response = await request.put(`/admin/administrators/${row._id || row.id}`, {
        isActive: newStatus
      })
      
      if (response.success) {
        ElMessage.success(newStatus ? '启用成功' : '禁用成功')
        row.isActive = newStatus
      } else {
        // 如果失败，恢复原状态
        row.isActive = !newStatus
        ElMessage.error(response.message || '更新状态失败')
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      ElMessage.error(error.response?.data?.message || '更新状态失败')
      // 如果失败，恢复原状态
      row.isActive = !newStatus
    }
  }
  
  const handleSubmit = async () => {
    try {
      await adminFormRef.value.validate()
      
      submitLoading.value = true
      
      const url = adminForm._id 
        ? `/admin/administrators/${adminForm._id}`
        : '/admin/administrators'
      
      const method = adminForm._id ? 'put' : 'post'
      
      // 准备提交数据
      const submitData = { ...adminForm }
      if (adminForm._id) {
        // 编辑时不提交密码相关字段
        delete submitData.password
        delete submitData.confirmPassword
      }
      delete submitData._id
      
      const response = await request[method](url, submitData)
      
      if (response.success) {
        ElMessage.success(adminForm._id ? '更新成功' : '创建成功')
        dialogVisible.value = false
        getAdminList()
      }
    } catch (error) {
      console.error('保存管理员失败:', error)
      ElMessage.error('保存管理员失败')
    } finally {
      submitLoading.value = false
    }
  }
  
  const handleDialogClose = (done) => {
    adminFormRef.value?.resetFields()
    resetForm()
    done()
  }
  
  const resetForm = () => {
    Object.assign(adminForm, {
      _id: '',
      username: '',
      realName: '',
      email: '',
      phone: '',
      role: 'operator',
      password: '',
      confirmPassword: '',
      remark: '',
      isActive: true
    })
  }
  
  const handleSizeChange = (size) => {
    pagination.limit = size
    pagination.page = 1
    getAdminList()
  }
  
  const handleCurrentChange = (page) => {
    pagination.page = page
    getAdminList()
  }
  
  const getRoleName = (role) => {
    const roleMap = {
      super_admin: '超级管理员',
      admin: '管理员',
      operator: '操作员'
    }
    return roleMap[role] || role
  }
  
  const getRoleType = (role) => {
    const typeMap = {
      super_admin: 'danger',
      admin: 'primary',
      operator: 'success'
    }
    return typeMap[role] || 'info'
  }
  
  const formatDate = (date) => {
    if (!date) return '从未登录'
    return new Date(date).toLocaleString('zh-CN')
  }
  
  // 监听搜索关键词变化，实现输入即查询
  watch(
    () => searchForm.keyword,
    (newKeyword, oldKeyword) => {
      console.log('🔍 搜索关键词变化:', { newKeyword, oldKeyword })
      
      // 防抖处理
      clearTimeout(window.adminSearchTimeout)
      window.adminSearchTimeout = setTimeout(() => {
        // 当关键词被清空时，也要重新搜索
        if (newKeyword === '' || newKeyword.length >= 2) {
          console.log('🔍 触发自动搜索:', newKeyword)
          pagination.page = 1
          getAdminList()
        }
      }, 500)
    }
  )
  
  // 生命周期
  onMounted(() => {
    getAdminList()
  })
  </script>
  
  <style scoped>
  .admin-list-container {
    padding: 0;
    height: 100%;
    overflow-y: auto;
  }
  
  /* 搜索区域样式 */
  .search-card {
    margin-bottom: 10px;
    width: 100%;
  }
  
  .search-card :deep(.el-card__body) {
    padding: 12px;
  }
  
  .search-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 40px;
  }
  
  .search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .search-input {
    width: 420px;
  }
  
  .search-button {
    min-width: 80px;
  }
  
  .filter-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .filter-actions .el-button {
    min-width: 80px;
  }
  
  /* 表格样式 */
  .table-card {
    margin-bottom: 8px;
  }
  
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0;
  }
  
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .total-info {
    font-size: 14px;
    color: #666;
  }
  
  .date-text {
    font-size: 13px;
    color: #909399;
  }
  
  /* 分页样式 */
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding: 8px 0 0 0;
    width: 100%;
  }
  
  /* 对话框样式 */
  .dialog-footer {
    text-align: right;
  }
  
  .form-tip {
    margin-top: 4px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .admin-list-container {
      padding: 8px;
    }
    
    .search-bar {
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
    }
    
    .search-input-wrapper {
      width: 100%;
    }
    
    .search-input {
      width: 100%;
    }
    
    .filter-actions {
      flex-wrap: wrap;
      justify-content: flex-start;
    }
    
    .filter-actions .el-button {
      min-width: auto;
      flex: 1;
    }
    
    .pagination-container {
      justify-content: center;
    }
  }
  </style>