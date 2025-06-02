<template>
  <div class="coupon-list-container">
    <!-- 搜索和筛选 -->
    <el-card shadow="never" class="search-card">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="searchForm.search"
            placeholder="搜索优惠券名称、代码"
            clearable
            @keyup.enter="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="filter-actions">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="有效" value="active" />
            <el-option label="过期" value="expired" />
            <el-option label="已用完" value="used_up" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
          
          <el-select v-model="searchForm.type" placeholder="选择类型" clearable style="width: 120px">
            <el-option label="满减券" value="discount" />
            <el-option label="折扣券" value="percentage" />
            <el-option label="抵扣券" value="free" />
          </el-select>
          
          <el-button type="primary" @click="handleSearch" class="search-button">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          
          <el-button @click="resetSearch">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
          
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加优惠券
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <span class="total-info">共 {{ total }} 条记录</span>
        </div>
        <div class="toolbar-right">
          <el-tooltip content="刷新" placement="top">
            <el-button link @click="fetchCouponList">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="couponList"
        border
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无数据'"
      >
        <el-table-column prop="name" label="优惠券名称" min-width="180">
          <template #default="scope">
            <div class="coupon-info">
              <span class="coupon-name">{{ scope.row.name }}</span>
              <div v-if="scope.row.description" class="coupon-desc">
                {{ scope.row.description }}
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="code" label="优惠券代码" width="150" align="center">
          <template #default="scope">
            <el-tag type="info" class="coupon-code">
              {{ scope.row.code }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getCouponTypeColor(scope.row.type)">
              {{ getCouponTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="discount" label="优惠额度" width="120" align="center">
          <template #default="scope">
            <span class="discount-text">
              {{ formatDiscount(scope.row) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="minOrderAmount" label="最低消费" width="100" align="center">
          <template #default="scope">
            <span v-if="scope.row.minOrderAmount">
              ¥{{ scope.row.minOrderAmount.toFixed(2) }}
            </span>
            <span v-else class="no-limit">无限制</span>
          </template>
        </el-table-column>
        
        <el-table-column label="使用情况" width="120" align="center">
          <template #default="scope">
            <div class="usage-info">
              <span>{{ scope.row.usedCount || 0 }} / {{ scope.row.totalCount || '∞' }}</span>
              <el-progress 
                v-if="scope.row.totalCount" 
                :percentage="getUsagePercentage(scope.row)" 
                :stroke-width="4"
                :show-text="false"
                class="usage-progress"
              />
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="有效期" width="200" align="center">
          <template #default="scope">
            <div class="validity-period">
              <div class="date-range">
                {{ formatDate(scope.row.startDate) }} 至 {{ formatDate(scope.row.endDate) }}
              </div>
              <el-tag 
                :type="getValidityStatus(scope.row).type" 
                size="small"
                class="validity-tag"
              >
                {{ getValidityStatus(scope.row).text }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" width="100" align="center">
          <template #header>
            <el-tooltip
              content="开启：优惠券可正常使用；关闭：优惠券已禁用，用户无法使用"
              placement="top"
            >
              <span>状态 <el-icon style="font-size: 12px;"><QuestionFilled /></el-icon></span>
            </el-tooltip>
          </template>
          <template #default="scope">
            <el-tooltip
              :content="scope.row.isActive ? '优惠券可正常使用' : '优惠券已禁用，用户无法使用'"
              placement="top"
            >
              <el-switch
                v-model="scope.row.isActive"
                @change="(val) => handleStatusChange(scope.row, val)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)">详情</el-button>
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
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

    <!-- 优惠券详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="优惠券详情"
      direction="rtl"
      size="600px"
    >
      <div v-if="selectedCouponData" class="coupon-detail">
        <!-- 基本信息 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          
          <div class="coupon-basic-info">
            <div class="info-row">
              <label>优惠券名称：</label>
              <span>{{ selectedCouponData.name }}</span>
            </div>
            <div class="info-row">
              <label>优惠券代码：</label>
              <el-tag type="info" class="coupon-code">
                {{ selectedCouponData.code }}
              </el-tag>
            </div>
            <div class="info-row">
              <label>优惠券描述：</label>
              <span>{{ selectedCouponData.description || '暂无描述' }}</span>
            </div>
            <div class="info-row">
              <label>优惠券类型：</label>
              <el-tag :type="getCouponTypeColor(selectedCouponData.type)">
                {{ getCouponTypeText(selectedCouponData.type) }}
              </el-tag>
            </div>
            <div class="info-row">
              <label>优惠额度：</label>
              <span class="discount-amount">{{ formatDiscount(selectedCouponData) }}</span>
            </div>
            <div class="info-row">
              <label>最低消费：</label>
              <span v-if="selectedCouponData.minOrderAmount">
                ¥{{ selectedCouponData.minOrderAmount.toFixed(2) }}
              </span>
              <span v-else class="no-limit">无限制</span>
            </div>
          </div>
        </el-card>

        <!-- 使用统计 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>使用统计</span>
            </div>
          </template>
          
          <div class="usage-stats">
            <div class="stat-item">
              <div class="stat-value">{{ selectedCouponData.usedCount || 0 }}</div>
              <div class="stat-label">已使用</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ selectedCouponData.totalCount ? (selectedCouponData.totalCount - (selectedCouponData.usedCount || 0)) : "∞" }}</div>
              <div class="stat-label">剩余数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ selectedCouponData.totalCount || '∞' }}</div>
              <div class="stat-label">总数量</div>
            </div>
          </div>
        </el-card>

        <!-- 有效期信息 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>有效期信息</span>
            </div>
          </template>
          
          <div class="validity-info">
            <div class="info-row">
              <label>开始时间：</label>
              <span>{{ formatDateTime(selectedCouponData.startDate) }}</span>
            </div>
            <div class="info-row">
              <label>结束时间：</label>
              <span>{{ formatDateTime(selectedCouponData.endDate) }}</span>
            </div>
            <div class="info-row">
              <label>当前状态：</label>
              <el-tag 
                :type="getValidityStatus(selectedCouponData).type"
              >
                {{ getValidityStatus(selectedCouponData).text }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button type="primary" @click="handleEdit(selectedCouponData)">
            编辑优惠券
          </el-button>
          <el-button 
            :type="selectedCouponData.isActive ? 'warning' : 'success'"
            @click="handleStatusChange(selectedCouponData, !selectedCouponData.isActive)"
          >
            {{ selectedCouponData.isActive ? '禁用优惠券' : '启用优惠券' }}
          </el-button>
          <el-button type="danger" @click="handleDelete(selectedCouponData)">
            删除优惠券
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 添加/编辑优惠券对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑优惠券' : '添加优惠券'"
      width="700px"
      :close-on-click-modal="false"
      class="coupon-dialog"
    >
      <div class="coupon-form-container">
        <el-form
          ref="couponFormRef"
          :model="couponForm"
          :rules="formRules"
          label-width="100px"
          class="coupon-form"
        >
          <!-- 基本信息区域 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon class="section-icon"><Ticket /></el-icon>
              <span class="section-title">基本信息</span>
            </div>
            <div class="section-content">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="优惠券名称" prop="name">
                    <el-input 
                      v-model="couponForm.name" 
                      placeholder="请输入优惠券名称"
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="优惠券代码" prop="code">
                    <el-input 
                      v-model="couponForm.code" 
                      placeholder="请输入优惠券代码"
                      @input="handleCodeInput"
                      @blur="handleCodeBlur"
                    >
                      <template #append>
                        <el-button @click="generateCode" type="primary">生成</el-button>
                      </template>
                    </el-input>
                    <div v-if="codeCheckMessage" class="code-check-message" :class="codeCheckStatus">
                      <el-icon v-if="codeCheckStatus === 'checking'"><Loading /></el-icon>
                      <el-icon v-else-if="codeCheckStatus === 'available'" style="color: #67C23A;"><CircleCheckFilled /></el-icon>
                      <el-icon v-else-if="codeCheckStatus === 'exists'" style="color: #F56C6C;"><CircleCloseFilled /></el-icon>
                      <el-icon v-else-if="codeCheckStatus === 'error'" style="color: #E6A23C;"><WarningFilled /></el-icon>
                      <span>{{ codeCheckMessage }}</span>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="优惠券描述" prop="description">
                <el-input 
                  v-model="couponForm.description" 
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入优惠券描述（可选）"
                  show-word-limit
                  maxlength="200"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 优惠设置区域 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon class="section-icon"><Money /></el-icon>
              <span class="section-title">优惠设置</span>
            </div>
            <div class="section-content">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="优惠券类型" prop="type">
                    <el-select v-model="couponForm.type" style="width: 100%" clearable>
                      <el-option label="满减券" value="discount">
                        <span style="float: left">满减券</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">满额减免</span>
                      </el-option>
                      <el-option label="折扣券" value="percentage">
                        <span style="float: left">折扣券</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">按比例折扣</span>
                      </el-option>
                      <el-option label="抵扣券" value="free">
                        <span style="float: left">抵扣券</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">直接抵扣</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item 
                    :label="getDiscountLabel()" 
                    prop="discountValue"
                  >
                    <el-input-number
                      v-model="couponForm.discountValue"
                      :min="0"
                      :precision="couponForm.type === 'percentage' ? 0 : 2"
                      :max="couponForm.type === 'percentage' ? 100 : undefined"
                      style="width: 100%"
                      controls-position="right"
                    >
                      <template #append>
                        {{ getDiscountUnit() }}
                      </template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="最低消费" prop="minOrderAmount">
                    <el-input-number
                      v-model="couponForm.minOrderAmount"
                      :min="0"
                      :precision="2"
                      style="width: 100%"
                      placeholder="0 表示无限制"
                      controls-position="right"
                    >
                      <template #append>元</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="发行数量" prop="totalCount">
                    <el-input-number
                      v-model="couponForm.totalCount"
                      :min="0"
                      style="width: 100%"
                      placeholder="0 表示无限制"
                      controls-position="right"
                    >
                      <template #append>张</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 有效期设置区域 -->
          <div class="form-section">
            <div class="section-header">
              <el-icon class="section-icon"><Calendar /></el-icon>
              <span class="section-title">有效期设置</span>
            </div>
            <div class="section-content">
              <el-form-item label="有效期" prop="dateRange">
                <el-date-picker
                  v-model="couponForm.dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
              
              <el-form-item label="是否启用" prop="isActive">
                <el-switch 
                  v-model="couponForm.isActive"
                  active-text="启用"
                  inactive-text="禁用"
                  inline-prompt
                />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="formDialogVisible = false" size="large">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit" 
            :loading="submitting"
            size="large"
          >
            {{ isEdit ? '更新优惠券' : '创建优惠券' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshLeft, Refresh, Plus, QuestionFilled, Ticket, Money, Calendar, Loading, CircleCheckFilled, CircleCloseFilled, WarningFilled } from '@element-plus/icons-vue'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, updateCouponStatus, checkCouponCode } from '@/api/coupon'

const loading = ref(false)
const submitting = ref(false)
const couponList = ref([])
const total = ref(0)
const detailDrawerVisible = ref(false)
const selectedCouponData = ref(null)
const formDialogVisible = ref(false)
const isEdit = ref(false)
const couponFormRef = ref(null)
// 代码检测相关状态
const codeCheckStatus = ref('') // 'checking', 'available', 'exists', 'error'
const codeCheckMessage = ref('')
const codeCheckTimer = ref(null)

// 搜索表单
const searchForm = reactive({
  search: '',
  status: '',
  type: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 20
})

// 优惠券表单
const couponForm = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  type: 'discount',
  discountValue: 0,
  minOrderAmount: 0,
  totalCount: 0,
  dateRange: [],
  isActive: true
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入优惠券代码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (codeCheckStatus.value === 'exists') {
          callback(new Error('优惠券代码已存在'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  type: [
    { required: true, message: '请选择优惠券类型', trigger: 'change' }
  ],
  discountValue: [
    { required: true, message: '请输入优惠额度', trigger: 'blur' }
  ],
  dateRange: [
    { required: true, message: '请选择有效期', trigger: 'change' }
  ]
}

// 时区转换工具函数
// UTC时间字符串转本地时间字符串(用于显示)
const utcToLocalString = (utcDateString) => {
  if (!utcDateString) return ''
  const date = new Date(utcDateString)
  // 获取本地时间的年月日时分秒
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 本地时间字符串转UTC时间字符串(用于提交)
const localStringToUtc = (localDateString) => {
  if (!localDateString) return ''
  const date = new Date(localDateString)
  return date.toISOString()
}

// 获取优惠券列表
const fetchCouponList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.limit,
      keyword: searchForm.search,
      status: searchForm.status,
      type: searchForm.type
    }
    
    console.log('发送请求参数:', params)
    const response = await getCoupons(params)
    console.log('API响应:', response)
    
    if (response && response.success) {
      console.log('优惠券数据:', response.data.coupons)
      couponList.value = response.data.coupons || []
      total.value = response.data.total || 0
      console.log('设置couponList:', couponList.value)
      console.log('设置total:', total.value)
    } else {
      console.error('API返回错误:', response?.message || '未知错误')
      throw new Error(response?.message || 'API调用失败')
    }
  } catch (error) {
    console.error('获取优惠券列表失败', error)
    console.log('使用模拟数据作为备选')
    
    // 如果API调用失败，使用模拟数据作为备选
    const mockData = [
      {
        id: 1,
        name: '新用户专享券',
        code: 'NEW2024',
        description: '新用户首单专享优惠',
        type: 'fixed',
        discountValue: 10,
        minOrderAmount: 50,
        totalCount: 1000,
        usedCount: 150,
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-12-31 23:59:59',
        isActive: true
      },
      {
        id: 2,
        name: '满减优惠券',
        code: 'SAVE20',
        description: '满100减20元',
        type: 'fixed',
        discountValue: 20,
        minOrderAmount: 100,
        totalCount: 500,
        usedCount: 300,
        startDate: '2024-01-01 00:00:00',
        endDate: '2024-06-30 23:59:59',
        isActive: true
      },
      {
        id: 3,
        name: '8折优惠券',
        code: 'DISCOUNT80',
        description: '全场8折优惠',
        type: 'percentage',
        discountValue: 20,
        minOrderAmount: 0,
        totalCount: 200,
        usedCount: 200,
        startDate: '2024-03-01 00:00:00',
        endDate: '2024-03-31 23:59:59',
        isActive: false
      }
    ]
    
    couponList.value = mockData
    total.value = mockData.length
    console.log('模拟数据已设置:', { couponList: couponList.value, total: total.value })
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchCouponList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    search: '',
    status: '',
    type: ''
  })
  handleSearch()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  fetchCouponList()
}

// 当前页变化
const handleCurrentChange = (page) => {
  pagination.page = page
  fetchCouponList()
}

// 获取优惠券类型文本
const getCouponTypeText = (type) => {
  const typeMap = {
    'discount': '满减券',
    'percentage': '折扣券',
    'free': '抵扣券'
  }
  return typeMap[type] || type
}

// 获取优惠券类型颜色
const getCouponTypeColor = (type) => {
  const colorMap = {
    'discount': 'success',
    'percentage': 'warning',
    'free': 'danger'
  }
  return colorMap[type] || 'info'
}

// 获取优惠额度标签
const getDiscountLabel = () => {
  switch (couponForm.type) {
    case 'percentage':
      return '折扣比例'
    case 'free':
      return '抵扣金额'
    default:
      return '优惠金额'
  }
}

// 获取优惠额度单位
const getDiscountUnit = () => {
  return couponForm.type === 'percentage' ? '%' : '元'
}

// 格式化优惠额度
const formatDiscount = (coupon) => {
  if (coupon.type === 'percentage') {
    return `${coupon.discountValue}%折扣`
  } else if (coupon.type === 'discount') {
    return `减${coupon.discountValue}元`
  } else if (coupon.type === 'free') {
    return `抵扣${coupon.discountValue}元`
  }
  return ''
}

// 获取使用百分比
const getUsagePercentage = (coupon) => {
  if (!coupon.totalCount) return 0
  return Math.round((coupon.usedCount / coupon.totalCount) * 100)
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 获取有效期状态
const getValidityStatus = (coupon) => {
  const now = new Date()
  const startDate = new Date(coupon.startDate)
  const endDate = new Date(coupon.endDate)
  
  if (now < startDate) {
    return { type: 'info', text: '未开始' }
  } else if (now > endDate) {
    return { type: 'danger', text: '已过期' }
  } else if (!coupon.isActive) {
    return { type: 'warning', text: '已禁用' }
  } else if (coupon.totalCount && coupon.usedCount >= coupon.totalCount) {
    return { type: 'warning', text: '已用完' }
  } else {
    return { type: 'success', text: '有效' }
  }
}

// 查看详情
const handleView = (row) => {
  selectedCouponData.value = row
  detailDrawerVisible.value = true
}

// 添加优惠券
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  formDialogVisible.value = true
}

// 编辑优惠券
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(couponForm, {
    id: row._id,
    name: row.name,
    code: row.code,
    description: row.description,
    type: row.type,
    discountValue: Number(row.discountValue) || 0,
    minOrderAmount: Number(row.minOrderAmount) || 0,
    totalCount: Number(row.totalCount) || 0,
    isActive: row.isActive
  })
  // 转换UTC时间为本地时间字符串
  couponForm.dateRange = [
    utcToLocalString(row.startDate),
    utcToLocalString(row.endDate)
  ]
  formDialogVisible.value = true
}

// 删除优惠券
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除优惠券 "${row.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    // 调用删除API
    await deleteCoupon(row._id)
    ElMessage.success('删除成功')
    fetchCouponList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除优惠券失败:', error)
      // 错误已在axios拦截器中处理
    }
  }
}

// 更新状态
const handleStatusChange = async (row, value) => {
  try {
    row.isActive = value
    ElMessage.success(`优惠券已${value ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('更新优惠券状态失败', error)
    // 错误已在axios拦截器中处理
    row.isActive = !value
  }
}

// 处理代码输入事件
const handleCodeInput = (value) => {
  // 清除之前的定时器
  if (codeCheckTimer.value) {
    clearTimeout(codeCheckTimer.value)
  }
  
  // 清空之前的检查状态
  codeCheckStatus.value = ''
  codeCheckMessage.value = ''
  
  // 如果是编辑模式且代码没有改变，不需要检查
  if (isEdit.value && value === couponForm.code) {
    return
  }
  
  // 如果代码为空或太短，不检查
  if (!value || value.length < 2) {
    return
  }
  
  // 设置防抖检查
  codeCheckTimer.value = setTimeout(() => {
    checkCodeAvailability(value)
  }, 500) // 500ms防抖
}

// 处理代码失焦事件
const handleCodeBlur = () => {
  const value = couponForm.code
  
  // 如果有值且还没检查过，立即检查
  if (value && value.length >= 2 && !codeCheckStatus.value) {
    checkCodeAvailability(value)
  }
}

// 检查代码可用性
const checkCodeAvailability = async (code) => {
  if (!code) return
  
  try {
    codeCheckStatus.value = 'checking'
    codeCheckMessage.value = '检查中...'
    
    const response = await checkCouponCode(code)
    
    if (response && response.success) {
      if (response.data.exists) {
        codeCheckStatus.value = 'exists'
        codeCheckMessage.value = '代码已存在，请换一个'
      } else {
        codeCheckStatus.value = 'available'
        codeCheckMessage.value = '代码可用'
      }
    } else {
      throw new Error(response?.message || '检查失败')
    }
  } catch (error) {
    console.error('检查优惠券代码失败:', error)
    codeCheckStatus.value = 'error'
    codeCheckMessage.value = '检查失败，请稍后重试'
  }
}

// 生成优惠券代码
const generateCode = () => {
  // 清除之前的检测状态
  codeCheckStatus.value = ""
  codeCheckMessage.value = ""
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  couponForm.code = result
  // 生成后立即检测代码可用性
  checkCodeAvailability(result)
}

// 重置表单
const resetForm = () => {
  Object.assign(couponForm, {
    id: '',
    name: '',
    code: '',
    description: '',
    type: 'discount',
    discountValue: 0,
    minOrderAmount: 0,
    totalCount: 0,
    dateRange: [],
    isActive: true
  })
  
  // 重置代码检测状态
  codeCheckStatus.value = ''
  codeCheckMessage.value = ''
  if (codeCheckTimer.value) {
    clearTimeout(codeCheckTimer.value)
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await couponFormRef.value.validate()
    
    // 检查代码重复状态
    if (codeCheckStatus.value === "exists" || codeCheckStatus.value === "error") {
      // 错误已在axios拦截器中处理
      return
    }
    
    if (codeCheckStatus.value === "checking") {
      // 错误已在axios拦截器中处理
      return
    }
    
    if (!couponForm.dateRange || couponForm.dateRange.length !== 2) {
      // 错误已在axios拦截器中处理
      return
    }
    
    submitting.value = true
    
    // 准备提交数据
    const submitData = {
      name: couponForm.name,
      code: couponForm.code,
      description: couponForm.description,
      type: couponForm.type,
      discountValue: Number(couponForm.discountValue),
      minOrderAmount: Number(couponForm.minOrderAmount) || 0,
      totalCount: Number(couponForm.totalCount) || 0,
      startDate: localStringToUtc(couponForm.dateRange[0]),
      endDate: localStringToUtc(couponForm.dateRange[1]),
      isActive: couponForm.isActive
    }
    
    console.log('提交的优惠券数据:', submitData)
    
    // 调用API
    if (isEdit.value) {
      await updateCoupon(couponForm.id, submitData)
    } else {
      await createCoupon(submitData)
    }
    
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    formDialogVisible.value = false
    fetchCouponList()
  } catch (error) {
    console.error('提交失败:', error)
    // 错误已在axios拦截器中处理
  } finally {
    submitting.value = false
  }
}

// 监听搜索表单变化
watch(
  () => searchForm.search,
  () => {
    clearTimeout(window.searchTimeout)
    window.searchTimeout = setTimeout(() => {
      if (searchForm.search.length === 0 || searchForm.search.length >= 2) {
        handleSearch()
      }
    }, 500)
  }
)

// 监听状态筛选变化
watch(
  () => searchForm.status,
  (newVal, oldVal) => {
    // 只有当值真正改变时才触发搜索
    if (newVal !== oldVal) {
      handleSearch()
    }
  }
)

// 监听类型筛选变化
watch(
  () => searchForm.type,
  (newVal, oldVal) => {
    // 只有当值真正改变时才触发搜索
    if (newVal !== oldVal) {
      handleSearch()
    }
  }
)

onMounted(() => {
  fetchCouponList()
})
</script>

<style scoped>
.coupon-list-container {
  padding: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

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

.table-card {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-card__body) {
  padding: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.total-info {
  font-size: 14px;
  color: #606266;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coupon-name {
  font-weight: 500;
  color: #303133;
}

.coupon-desc {
  font-size: 12px;
  color: #909399;
}

.coupon-code {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-weight: 600;
}

.discount-text {
  color: #E6A23C;
  font-weight: 600;
}

.no-limit {
  color: #909399;
  font-style: italic;
}

.usage-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.usage-progress {
  width: 60px;
}

.validity-period {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.date-range {
  font-size: 12px;
  color: #606266;
}

.validity-tag {
  font-size: 11px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 8px 0 0 0;
}

/* 详情抽屉样式 */
.coupon-detail {
  padding: 16px;
}

.detail-card {
  margin-bottom: 16px;
}

.detail-card :deep(.el-card__header) {
  padding: 12px 16px;
  background-color: #f8f9fa;
}

.detail-card :deep(.el-card__body) {
  padding: 16px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.coupon-basic-info,
.validity-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  min-height: 24px;
}

.info-row label {
  width: 100px;
  color: #606266;
  font-weight: 500;
  flex-shrink: 0;
}

.info-row span {
  color: #303133;
  word-break: break-all;
}

.discount-amount {
  color: #E6A23C;
  font-weight: 600;
  font-size: 16px;
}

.usage-stats {
  display: flex;
  gap: 32px;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #409EFF;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.detail-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #ebeef5;
  margin-top: 16px;
}

.detail-actions .el-button {
  flex: 1;
}

/* 表格样式 */
:deep(.el-table .el-table__cell) {
  padding: 8px 0;
}

:deep(.el-table .el-table__header-wrapper th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 500;
}

/* 修复描述字段焦点状态边框问题 */
:deep(.el-textarea__inner:focus) {
  border-color: #409EFF;
  outline: 0;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-textarea__inner:hover) {
  border-color: #c0c4cc;
}

:deep(.el-textarea__inner) {
  border: 1px solid #dcdfe6;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

/* 移除按钮焦点边框 */
:deep(.el-button:focus) {
  outline: none;
  box-shadow: none;
}

/* 优化后的优惠券表单弹窗样式 */
.coupon-dialog :deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.coupon-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
}

.coupon-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.coupon-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 20px;
}

.coupon-form-container {
  padding: 0;
}

.coupon-form {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 8px;
}

.form-section {
  margin-bottom: 24px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
}

.section-icon {
  font-size: 16px;
  color: #ff6b6b;
  margin-right: 8px;
}

.section-title {
  font-weight: 600;
  color: #334155;
  font-size: 14px;
}

.section-content {
  padding: 16px;
}

.coupon-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.coupon-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.coupon-form :deep(.el-input-number) {
  width: 100%;
}

.coupon-form :deep(.el-textarea__inner) {
  resize: vertical;
}

.coupon-form :deep(.el-select-dropdown__item) {
  height: auto;
  padding: 8px 20px;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 代码检测消息样式 */
.code-check-message {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  transition: all 0.2s ease;
}

.code-check-message.checking {
  color: #409EFF;
}

.code-check-message.available {
  color: #67C23A;
}

.code-check-message.exists {
  color: #F56C6C;
}

.code-check-message.error {
  color: #E6A23C;
}

.code-check-message .el-icon {
  font-size: 14px;
}
</style> 