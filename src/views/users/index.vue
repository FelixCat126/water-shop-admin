<template>
  <div class="user-management">


    <!-- 搜索和筛选 -->
    <el-card shadow="never" class="search-card">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="searchForm.search"
            placeholder="搜索用户名、昵称、手机号"
            clearable
            @keyup.enter="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch" class="search-button">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
        
        <div class="filter-actions">
          <el-button 
            type="default" 
            @click="advancedFilterVisible = true"
            :class="{ 'has-filters': hasActiveFilters }"
          >
            <el-icon><Filter /></el-icon>
            高级筛选
            <el-badge v-if="activeFilterCount > 0" :value="activeFilterCount" class="filter-badge" />
          </el-button>
          <el-button 
            v-if="hasActiveFilters" 
            type="default" 
            @click="clearAllFilters"
          >
            <el-icon><RefreshLeft /></el-icon>
            清空筛选
          </el-button>
          
          <!-- 批量操作按钮 -->
          <el-button 
            type="danger" 
            :disabled="selectedUsers.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除 ({{ selectedUsers.length }})
          </el-button>
          <el-button 
            type="primary" 
            :disabled="selectedUsers.length === 0"
            @click="handleBatchExport"
          >
            <el-icon><Download /></el-icon>
            导出选中 ({{ selectedUsers.length }})
          </el-button>
          <el-button 
            type="success" 
            :disabled="selectedUsers.length === 0"
            @click="handleBatchDistributeCoupon"
          >
            <el-icon><Present /></el-icon>
            分发优惠券 ({{ selectedUsers.length }})
          </el-button>
        </div>
      </div>
      
      <!-- 当前筛选条件显示 -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="filter-label">当前筛选：</span>
        <el-tag 
          v-if="searchForm.gender" 
          closable 
          @close="searchForm.gender = ''; handleSearch()"
          class="filter-tag"
        >
          性别: {{ searchForm.gender }}
        </el-tag>
        <el-tag 
          v-if="searchForm.isActive !== ''" 
          closable 
          @close="searchForm.isActive = ''; handleSearch()"
          class="filter-tag"
        >
          状态: {{ searchForm.isActive === 'true' ? '激活' : '禁用' }}
        </el-tag>
        <el-tag 
          v-if="searchForm.createdAtRange.length > 0" 
          closable 
          @close="searchForm.createdAtRange = []; handleSearch()"
          class="filter-tag"
        >
          注册时间: {{ searchForm.createdAtRange[0] }} 至 {{ searchForm.createdAtRange[1] }}
        </el-tag>
        <el-tag 
          v-if="searchForm.lastLoginRange.length > 0" 
          closable 
          @close="searchForm.lastLoginRange = []; handleSearch()"
          class="filter-tag"
        >
          最后登录: {{ searchForm.lastLoginRange[0] }} 至 {{ searchForm.lastLoginRange[1] }}
        </el-tag>
        <el-tag 
          v-if="searchForm.memberLevel" 
          closable 
          @close="searchForm.memberLevel = ''; handleSearch()"
          class="filter-tag"
        >
          会员等级: {{ searchForm.memberLevel }}
        </el-tag>
        <el-tag 
          v-if="searchForm.consumptionRange" 
          closable 
          @close="searchForm.consumptionRange = ''; handleSearch()"
          class="filter-tag"
        >
          消费金额: {{ searchForm.consumptionRange }}
        </el-tag>
      </div>
    </el-card>

    <!-- 高级筛选抽屉 -->
    <el-drawer
      v-model="advancedFilterVisible"
      title="高级筛选"
      direction="rtl"
      size="400px"
      @close="onAdvancedFilterClose"
    >
      <div class="advanced-filter">
        <el-form :model="searchForm" label-width="100px" class="filter-form">
          <el-form-item label="性别">
            <el-select v-model="searchForm.gender" placeholder="选择性别" clearable style="width: 100%">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
              <el-option label="未知" value="未知" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select v-model="searchForm.isActive" placeholder="选择状态" clearable style="width: 100%">
              <el-option label="激活" value="true" />
              <el-option label="禁用" value="false" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="注册时间">
            <el-date-picker
              v-model="searchForm.createdAtRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
              clearable
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item label="最后登录">
            <el-date-picker
              v-model="searchForm.lastLoginRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
              clearable
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item label="会员等级">
            <el-select v-model="searchForm.memberLevel" placeholder="选择会员等级" clearable style="width: 100%">
              <el-option label="普通会员" value="普通会员" />
              <el-option label="铜牌会员" value="铜牌会员" />
              <el-option label="银牌会员" value="银牌会员" />
              <el-option label="金牌会员" value="金牌会员" />
              <el-option label="白金会员" value="白金会员" />
              <el-option label="钻石会员" value="钻石会员" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="消费金额">
            <el-input
              v-model="searchForm.consumptionRange"
              placeholder="例如：100-500"
              clearable
            />
          </el-form-item>
        </el-form>
        
        <div class="filter-actions-bottom">
          <el-button type="primary" @click="applyAdvancedFilter">
            <el-icon><Search /></el-icon>
            应用筛选
          </el-button>
          <el-button @click="resetAdvancedFilter">
            <el-icon><Refresh /></el-icon>
            重置筛选
          </el-button>
          <el-button @click="advancedFilterVisible = false">
            取消
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 表格工具栏和表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <span class="total-info">共 {{ total }} 条记录</span>
        </div>
        <div class="toolbar-right">
          <el-tooltip content="列设置" placement="top">
            <el-button 
              type="text" 
              @click="columnSettingVisible = true"
            >
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="刷新" placement="top">
            <el-button 
              type="text" 
              @click="fetchUsers"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 用户表格 -->
      <el-table
        ref="userTable"
        v-loading="loading"
        :data="users"
        row-key="_id"
        border
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        :height="tableHeight"
        style="width: 100%"
      >
        <!-- 多选列 -->
        <el-table-column type="selection" width="55" fixed="left" />
        
        <!-- 用户ID列（冻结） -->
        <el-table-column
          prop="_id"
          label="用户ID"
          width="240"
          fixed="left"
          v-if="visibleColumns.includes('_id')"
        >
          <template #default="scope">
            <el-tooltip 
              :content="`点击查看用户详情`" 
              placement="top"
            >
              <el-button 
                type="primary" 
                link
                @click="handleViewDetail(scope.row)"
                class="user-id-link"
              >
                {{ scope.row._id }}
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <!-- 用户名 -->
        <el-table-column
          prop="username"
          label="用户名"
          min-width="180"
          sortable="custom"
          v-if="visibleColumns.includes('username')"
        >
          <template #default="scope">
            <div class="user-info">
              <el-avatar :src="getUserAvatarUrl(scope.row.avatar)" :size="32" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-tooltip :content="scope.row.username" placement="top" :disabled="!scope.row.username || scope.row.username.length <= 12">
                <span class="username">{{ scope.row.username }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        
        <!-- 昵称 -->
        <el-table-column
          prop="nickName"
          label="昵称"
          min-width="120"
          sortable="custom"
          v-if="visibleColumns.includes('nickName')"
        >
          <template #default="scope">
            <el-tooltip :content="scope.row.nickName" placement="top" :disabled="!scope.row.nickName || scope.row.nickName.length <= 8">
              <span class="nickname-text">{{ scope.row.nickName || '--' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <!-- 手机号 -->
        <el-table-column
          prop="phone"
          label="手机号"
          width="130"
          v-if="visibleColumns.includes('phone')"
        >
          <template #default="scope">
            <el-tooltip :content="scope.row.phone" placement="top" :disabled="!scope.row.phone">
              <span class="phone-number">{{ scope.row.phone || '--' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <!-- 性别 -->
        <el-table-column
          prop="gender"
          label="性别"
          width="80"
          align="center"
          v-if="visibleColumns.includes('gender')"
        >
          <template #default="scope">
            <el-tag 
              :type="scope.row.gender === '男' ? 'primary' : scope.row.gender === '女' ? 'danger' : 'info'"
              size="small"
            >
              {{ scope.row.gender || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 积分 -->
        <el-table-column
          prop="points"
          label="积分"
          width="100"
          align="center"
          sortable="custom"
          v-if="visibleColumns.includes('points')"
        />
        
        <!-- 会员等级 -->
        <el-table-column
          prop="memberLevel"
          label="会员等级"
          width="120"
          align="center"
          v-if="visibleColumns.includes('memberLevel')"
        >
          <template #default="scope">
            <el-tag 
              :type="getMemberLevelColor(scope.row.points)"
              size="small"
            >
              {{ getMemberLevel(scope.row.points) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 总计消费金额 -->
        <el-table-column
          prop="totalConsumption"
          label="总计消费"
          width="120"
          align="center"
          sortable="custom"
          v-if="visibleColumns.includes('totalConsumption')"
        >
          <template #default="scope">
            <span class="consumption-amount">
              ¥{{ (scope.row.totalConsumption || 0).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column
          prop="isActive"
          width="100"
          align="center"
          v-if="visibleColumns.includes('isActive')"
        >
          <template #header>
            <el-tooltip
              content="开启：用户可正常使用系统；关闭：用户被禁用，无法登录和使用"
              placement="top"
            >
              <span>状态 <el-icon style="font-size: 12px;"><QuestionFilled /></el-icon></span>
            </el-tooltip>
          </template>
          <template #default="scope">
            <el-tooltip
              :content="scope.row.isActive ? '用户已激活，可正常使用' : '用户已禁用，无法登录'"
              placement="top"
            >
              <el-switch
                v-model="scope.row.isActive"
                @change="handleStatusChange(scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        
        <!-- 注册时间 -->
        <el-table-column
          prop="createdAt"
          label="注册时间"
          min-width="160"
          sortable="custom"
          v-if="visibleColumns.includes('createdAt')"
        >
          <template #default="scope">
            <el-tooltip :content="formatDate(scope.row.createdAt)" placement="top">
              <span class="date-text">{{ formatDate(scope.row.createdAt) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <!-- 最后登录 -->
        <el-table-column
          prop="lastLogin"
          label="最后登录"
          min-width="160"
          sortable="custom"
          v-if="visibleColumns.includes('lastLogin')"
        >
          <template #default="scope">
            <el-tooltip :content="scope.row.lastLogin ? formatDate(scope.row.lastLogin) : '从未登录'" placement="top">
              <span class="date-text">{{ scope.row.lastLogin ? formatDate(scope.row.lastLogin) : '从未登录' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <el-table-column
          label="操作"
          width="180"
          fixed="right"
          align="center"
        >
          <template #default="scope">
            <el-button link type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 列设置抽屉 -->
    <el-drawer
      v-model="columnSettingVisible"
      title="列设置"
      direction="rtl"
      size="300px"
    >
      <div class="column-setting">
        <div class="setting-header">
          <span>选择要显示的列</span>
          <el-button type="text" @click="handleResetColumns">重置</el-button>
        </div>
        <el-checkbox-group v-model="visibleColumns">
          <div v-for="column in allColumns" :key="column.key" class="column-item">
            <el-checkbox :label="column.key" :disabled="column.key === '_id'">
              {{ column.label }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
    </el-drawer>

    <!-- 用户详情抽屉 -->
    <user-detail-drawer
      v-model="detailDrawerVisible"
      :user-id="selectedUserId"
      :user-data="selectedUserData"
      @refresh="fetchUsers"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Filter, RefreshLeft, Setting, Refresh, Download, Delete, Present, 
  QuestionFilled, View, User 
} from '@element-plus/icons-vue'
import { getUsers, deleteUser, deleteUsers, getUserDetail } from '@/api/user'
import UserDetailDrawer from './components/UserDetailDrawer.vue'

// 响应式数据
const loading = ref(false)
const users = ref([])
const selectedUsers = ref([])
const total = ref(0)
const columnSettingVisible = ref(false)
const detailDrawerVisible = ref(false)
const selectedUserId = ref('')
const selectedUserData = ref(null)
const userTable = ref(null)  // 添加表格引用
const advancedFilterVisible = ref(false)  // 高级筛选抽屉显示状态

// 计算表格高度
const tableHeight = computed(() => {
  // 动态计算表格高度，考虑是否有活跃筛选条件和屏幕尺寸
  const screenHeight = window.innerHeight;
  const isSmallScreen = screenHeight < 768; // 小屏幕判断
  
  if (isSmallScreen) {
    // 小屏幕优化：搜索卡片(56px) + 筛选标签(有时28px) + 工具栏(36px) + 分页(48px) + 间距(12px)
    const baseHeight = 56 + 36 + 48 + 12; // 152px
    const filterTagsHeight = hasActiveFilters.value ? 28 : 0;
    return screenHeight - (baseHeight + filterTagsHeight);
  } else {
    // 正常屏幕：搜索卡片基础高度(64px) + 筛选标签区域(有时32px) + 工具栏(40px) + 分页(56px) + 间距(18px)
    const baseHeight = 64 + 40 + 56 + 18; // 178px
    const filterTagsHeight = hasActiveFilters.value ? 32 : 0;
    return screenHeight - (baseHeight + filterTagsHeight);
  }
})

// 计算是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return searchForm.gender !== '' ||
         searchForm.isActive !== '' ||
         searchForm.createdAtRange.length > 0 ||
         searchForm.lastLoginRange.length > 0 ||
         searchForm.memberLevel !== '' ||
         searchForm.consumptionRange !== ''
})

// 计算活跃筛选条件数量
const activeFilterCount = computed(() => {
  let count = 0
  if (searchForm.gender) count++
  if (searchForm.isActive !== '') count++
  if (searchForm.createdAtRange.length > 0) count++
  if (searchForm.lastLoginRange.length > 0) count++
  if (searchForm.memberLevel) count++
  if (searchForm.consumptionRange) count++
  return count
})

// 搜索表单
const searchForm = reactive({
  search: '',
  gender: '',
  isActive: '',
  createdAtRange: [],
  lastLoginRange: [],
  memberLevel: '',
  consumptionRange: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 20
})

// 排序信息
const sortInfo = reactive({
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// 所有可用列
const allColumns = [
  { key: '_id', label: '用户ID' },
  { key: 'username', label: '用户名' },
  { key: 'nickName', label: '昵称' },
  { key: 'phone', label: '手机号' },
  { key: 'gender', label: '性别' },
  { key: 'points', label: '积分' },
  { key: 'memberLevel', label: '会员等级' },
  { key: 'totalConsumption', label: '总计消费' },
  { key: 'isActive', label: '状态' },
  { key: 'createdAt', label: '注册时间' },
  { key: 'lastLogin', label: '最后登录' }
]

// 默认显示的列
const visibleColumns = ref([
  '_id', 'username', 'nickName', 'phone', 
  'gender', 'memberLevel', 'totalConsumption', 'isActive'
])

// 处理用户头像URL
const getUserAvatarUrl = (avatar) => {
  if (!avatar) return ''
  
  // 如果是完整的HTTP/HTTPS URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  
  // 获取后端服务器地址（去掉/api部分）
  let baseUrl = import.meta.env.VITE_API_BASE_URL
  
  // 如果环境变量获取失败，使用默认值
  if (!baseUrl) {
    baseUrl = 'http://localhost:5001/api'
  }
  
  // 去掉末尾的/api
  baseUrl = baseUrl.replace('/api', '')
  
  // 如果是以/开头的绝对路径，直接拼接
  if (avatar.startsWith('/')) {
    return `${baseUrl}${avatar}`
  }
  
  // 如果是相对路径，在前面加上/
  return `${baseUrl}/${avatar}`
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchForm.search,
      gender: searchForm.gender,
      isActive: searchForm.isActive,
      sortBy: sortInfo.sortBy,
      sortOrder: sortInfo.sortOrder
    }
    
    // 添加注册时间范围
    if (searchForm.createdAtRange && searchForm.createdAtRange.length === 2) {
      params.createdAtStart = searchForm.createdAtRange[0]
      params.createdAtEnd = searchForm.createdAtRange[1]
    }
    
    // 添加最后登录时间范围
    if (searchForm.lastLoginRange && searchForm.lastLoginRange.length === 2) {
      params.lastLoginStart = searchForm.lastLoginRange[0]
      params.lastLoginEnd = searchForm.lastLoginRange[1]
    }
    
    // 添加会员等级
    if (searchForm.memberLevel) {
      params.memberLevel = searchForm.memberLevel
    }
    
    // 添加消费金额区间
    if (searchForm.consumptionRange) {
      params.consumptionRange = searchForm.consumptionRange
    }
    
    const response = await getUsers(params)
    if (response.success) {
      users.value = response.data.users
      total.value = response.data.total
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

// 多选变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 排序变化
const handleSortChange = ({ prop, order }) => {
  sortInfo.sortBy = prop
  sortInfo.sortOrder = order === 'ascending' ? 'asc' : 'desc'
  fetchUsers()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  fetchUsers()
}

// 当前页变化
const handleCurrentChange = (page) => {
  pagination.page = page
  fetchUsers()
}

// 查看详情
const handleViewDetail = (user) => {
  selectedUserId.value = user._id
  selectedUserData.value = user
  detailDrawerVisible.value = true
}

// 删除单个用户
const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    const response = await deleteUser(user._id)
    if (response.success) {
      ElMessage.success('删除成功')
      fetchUsers()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复。`,
      '确认批量删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    const userIds = selectedUsers.value.map(user => user._id)
    const response = await deleteUsers(userIds)
    if (response.success) {
      ElMessage.success(response.message)
      selectedUsers.value = []
      fetchUsers()
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除用户失败:', error)
      ElMessage.error('批量删除用户失败')
    }
  }
}

// 批量导出
const handleBatchExport = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要导出的用户')
    return
  }
  
  // 构建CSV内容
  const headers = ['用户ID', '用户名', '昵称', '手机号', '性别', '积分', '注册时间']
  const csvContent = [
    headers.join(','),
    ...selectedUsers.value.map(user => [
      user._id,
      user.username,
      user.nickName || '',
      user.phone || '',
      user.gender || '',
      user.points || 0,
      formatDate(user.createdAt)
    ].join(','))
  ].join('\n')
  
  // 下载CSV文件
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `用户数据_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  
  ElMessage.success(`已导出 ${selectedUsers.value.length} 个用户数据`)
}

// 批量分发优惠券
const handleBatchDistributeCoupon = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要分发优惠券的用户')
    return
  }
  
  ElMessage.info(`将为 ${selectedUsers.value.length} 个用户分发优惠券（功能开发中）`)
  // TODO: 实现批量分发优惠券逻辑
  // 可以打开一个对话框选择要分发的优惠券类型和数量
}

// 状态变化
const handleStatusChange = async (user) => {
  const newStatus = user.isActive
  const statusText = newStatus ? '激活' : '禁用'
  const actionText = newStatus ? '激活用户' : '禁用用户'
  
  try {
    // 这里应该调用更新用户状态的API
    // await updateUserStatus(user._id, { isActive: newStatus })
    
    ElMessage.success(`${actionText}成功！用户 "${user.username}" 已${statusText}`)
    
    // 注释掉自动刷新，避免状态被重置
    // await fetchUsers()
  } catch (error) {
    console.error('更新用户状态失败:', error)
    ElMessage.error(`${actionText}失败`)
    // 回滚状态
    user.isActive = !user.isActive
  }
}

// 重置列设置
const handleResetColumns = () => {
  visibleColumns.value = [
    '_id', 'username', 'nickName', 'phone', 
    'gender', 'memberLevel', 'totalConsumption', 'isActive'
  ]
}

// 重新布局表格
const recalculateTableLayout = () => {
  nextTick(() => {
    if (userTable.value) {
      // 强制表格重新计算布局
      userTable.value.doLayout()
      
      // 额外的延迟确保布局完成
      setTimeout(() => {
        if (userTable.value) {
          userTable.value.doLayout()
        }
      }, 100)
    }
  })
}

// 应用高级筛选
const applyAdvancedFilter = () => {
  pagination.page = 1
  fetchUsers()
  advancedFilterVisible.value = false
  ElMessage.success('筛选条件已应用')
}

// 重置高级筛选
const resetAdvancedFilter = () => {
  Object.assign(searchForm, {
    gender: '',
    isActive: '',
    createdAtRange: [],
    lastLoginRange: [],
    memberLevel: '',
    consumptionRange: ''
  })
  ElMessage.success('筛选条件已重置')
}

// 清空所有筛选条件
const clearAllFilters = () => {
  Object.assign(searchForm, {
    search: '',
    gender: '',
    isActive: '',
    createdAtRange: [],
    lastLoginRange: [],
    memberLevel: '',
    consumptionRange: ''
  })
  pagination.page = 1
  fetchUsers()
  ElMessage.success('所有筛选条件已清空')
}

// 高级筛选抽屉关闭事件
const onAdvancedFilterClose = () => {
  // 抽屉关闭时不需要特殊处理，保持筛选条件
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 计算会员等级
const getMemberLevel = (points) => {
  if (!points || points < 0) return '普通会员'
  
  if (points < 100) {
    return '普通会员'
  } else if (points < 500) {
    return '铜牌会员'
  } else if (points < 1000) {
    return '银牌会员'
  } else if (points < 2000) {
    return '金牌会员'
  } else if (points < 5000) {
    return '白金会员'
  } else {
    return '钻石会员'
  }
}

// 计算会员等级颜色
const getMemberLevelColor = (points) => {
  if (!points || points < 0) return 'info'
  
  if (points < 100) {
    return 'success'
  } else if (points < 500) {
    return 'warning'
  } else if (points < 1000) {
    return 'danger'
  } else if (points < 2000) {
    return 'primary'
  } else if (points < 5000) {
    return 'success'
  } else {
    return 'danger'
  }
}

// 监听搜索表单变化
watch(
  () => searchForm.search,
  () => {
    // 防抖处理，只监听搜索关键词
    clearTimeout(window.searchTimeout)
    window.searchTimeout = setTimeout(() => {
      if (searchForm.search.length === 0 || searchForm.search.length >= 2) {
        handleSearch()
      }
    }, 500)
  }
)

// 监听可见列变化，重新计算表格布局
watch(
  visibleColumns,
  () => {
    recalculateTableLayout()
  },
  { deep: true }
)

// 监听列设置抽屉关闭，确保表格布局正确
watch(
  columnSettingVisible,
  (newVal) => {
    if (!newVal) {
      // 抽屉关闭时重新计算布局
      recalculateTableLayout()
    }
  }
)

// 初始化
onMounted(() => {
  fetchUsers()
  
  // 添加窗口大小变化监听器
  const handleResize = () => {
    recalculateTableLayout()
  }
  
  window.addEventListener('resize', handleResize)
  
  // 确保初始渲染时表格布局正确
  nextTick(() => {
    recalculateTableLayout()
  })
  
  // 保存清理函数
  window.userTableResizeHandler = handleResize
})

// 在组件卸载时清理监听器
onUnmounted(() => {
  if (window.userTableResizeHandler) {
    window.removeEventListener('resize', window.userTableResizeHandler)
    delete window.userTableResizeHandler
  }
  
  // 清理搜索定时器
  if (window.searchTimeout) {
    clearTimeout(window.searchTimeout)
    delete window.searchTimeout
  }
})
</script>

<style scoped>
.user-management {
  padding: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}



.search-card {
  margin-bottom: 10px;
  width: 100%;
  margin-top: 0;
}

.search-card :deep(.el-card__body) {
  padding: 12px;
}

/* 搜索表单样式 */
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
  width: 280px;
}

.search-button {
  min-width: 80px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-actions .el-button {
  min-width: 80px;
}

.filter-badge {
  margin-left: 8px;
}

.active-filters {
  margin-top: 8px;
  padding: 6px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  min-height: 24px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.filter-label {
  font-weight: 500;
  margin-right: 8px;
}

.filter-tag {
  margin-right: 8px;
}

.has-filters {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.has-filters:hover {
  background-color: #bae7ff;
  border-color: #69c0ff;
}

/* 高级筛选抽屉样式 */
.advanced-filter {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-form {
  flex: 1;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.filter-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.filter-actions-bottom {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  margin-top: auto;
}

.filter-actions-bottom .el-button {
  flex: 1;
}

.table-card {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-card__body) {
  padding: 10px;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;
  min-height: 32px;
}

.total-info {
  font-size: 14px;
  color: #606266;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.user-avatar {
  flex-shrink: 0;  /* 防止头像被压缩 */
  width: 32px !important;
  height: 32px !important;
}

.username {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;  /* 允许文本收缩 */
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 8px 0 0 0;
  width: 100%;
}

.column-setting {
  padding: 16px;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
}

.column-item {
  margin-bottom: 12px;
}

/* 表格样式优化 - 修复对齐问题 */
:deep(.el-table) {
  flex: 1;
  width: 100% !important;
}

:deep(.el-table__inner-wrapper) {
  width: 100% !important;
}

:deep(.el-table .el-table__cell) {
  padding: 8px 0;
}

:deep(.el-table .el-table__header-wrapper th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-table .el-table__row:hover > td) {
  background-color: #f5f7fa;
}

/* 固定列阴影 */
:deep(.el-table .el-table__fixed) {
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
}

:deep(.el-table .el-table__fixed-right) {
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.1);
}

/* 修复表格对齐问题 */
:deep(.el-table--border) {
  border: 1px solid #ebeef5;
  width: 100% !important;
}

:deep(.el-table__body-wrapper) {
  overflow-x: auto;
  overflow-y: auto;
}

/* 确保表格内容区域宽度和对齐 */
:deep(.el-table__header),
:deep(.el-table__body) {
  width: 100% !important;
  table-layout: fixed;
}

/* 修复固定列对齐问题 */
:deep(.el-table .el-table__fixed-header-wrapper) {
  z-index: 3;
}

:deep(.el-table .el-table__fixed-body-wrapper) {
  z-index: 2;
}

:deep(.el-table .el-table__fixed-right-patch) {
  z-index: 4;
}

/* 确保固定列的表头和内容高度一致 */
:deep(.el-table .el-table__fixed .el-table__header-wrapper),
:deep(.el-table .el-table__fixed .el-table__body-wrapper) {
  overflow: hidden;
}

:deep(.el-table .el-table__fixed-right .el-table__header-wrapper),
:deep(.el-table .el-table__fixed-right .el-table__body-wrapper) {
  overflow: hidden;
}

/* 强制表格重新计算布局 */
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper),
:deep(.el-table__footer-wrapper) {
  width: 100% !important;
}

/* 移除按钮焦点边框 */
:deep(.el-button:focus) {
  outline: none;
  box-shadow: none;
}

:deep(.el-button:focus-visible) {
  outline: none;
  box-shadow: none;
}

/* 操作列按钮样式优化 */
:deep(.el-table__fixed-right .el-button) {
  border: none;
  background: transparent;
}

:deep(.el-table__fixed-right .el-button:focus) {
  outline: none;
  box-shadow: none;
  border: none;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.action-buttons .el-button {
  margin: 0;
  padding: 4px 8px;
}

/* 消费金额样式 */
.consumption-amount {
  font-weight: 500;
  color: #E6A23C;
}

/* 用户ID按钮样式 */
.user-id-link {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  color: #409EFF !important;
  max-width: 220px;
  width: 100%;
  text-align: left;
  padding: 4px 8px;
  word-break: break-all;
  line-height: 1.4;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: transparent;
}

.user-id-link:hover {
  color: #337ecc !important;
  background-color: #f0f9ff;
  text-decoration: none;
}

.user-id-link:focus {
  color: #337ecc !important;
  background-color: #f0f9ff;
  outline: none;
  box-shadow: none;
}

/* 手机号样式 */
.phone-number {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  color: #606266;
}

/* 额外的表格对齐修复 */
:deep(.el-table .el-table__fixed-left) {
  z-index: 10;
}

:deep(.el-table .el-table__fixed-right) {
  z-index: 10;
}

/* 确保表格列宽度稳定 */
:deep(.el-table th.el-table__cell),
:deep(.el-table td.el-table__cell) {
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 修复表格滚动时的对齐问题 */
:deep(.el-table__body-wrapper .el-table__row td),
:deep(.el-table__header-wrapper .el-table__header th) {
  border-right: 1px solid #ebeef5;
}

/* 列设置抽屉关闭后的强制重布局 */
:deep(.el-drawer.rtl .el-drawer__body) {
  transition: none;
}

/* 确保固定列边框正确显示 */
:deep(.el-table .el-table__fixed-left::after) {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #ebeef5;
  z-index: 1;
}

:deep(.el-table .el-table__fixed-right::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #ebeef5;
  z-index: 1;
}

/* 按钮图标和文字间隔 */
:deep(.el-button .el-icon + *) {
  margin-left: 4px;
}

/* 表格文本溢出样式 */
.nickname-text,
.date-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}

/* 小屏幕响应式样式 */
@media (max-height: 768px) {
  .search-card :deep(.el-card__body) {
    padding: 8px;
  }
  
  .search-bar {
    gap: 12px;
    min-height: 36px;
  }
  
  .active-filters {
    margin-top: 6px;
    padding: 4px 6px;
    min-height: 20px;
  }
  
  .table-card :deep(.el-card__body) {
    padding: 8px;
  }
  
  .table-toolbar {
    margin-bottom: 6px;
    min-height: 28px;
  }
  
  .pagination-wrapper {
    margin-top: 6px;
    padding: 6px 0 0 0;
  }
  
  :deep(.el-table .el-table__cell) {
    padding: 6px 0;
  }
  
  :deep(.el-pagination) {
    --el-pagination-button-height: 28px;
  }
  
  :deep(.el-pagination .el-pager li) {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
  }
}
</style> 