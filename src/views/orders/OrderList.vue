<template>
  <div class="order-list-container">
    <!-- 搜索和操作栏 -->
    <el-card shadow="never" class="search-card">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索订单号、下单账号、收货人、联系方式、收货地址"
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
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
            class="date-picker"
          />
          <el-button type="primary" @click="handleSearch" :loading="loading" class="search-button">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出订单
          </el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 订单状态标签 -->
    <div class="status-tabs">
      <el-radio-group v-model="activeStatus" @change="handleStatusChange">
        <el-radio-button :label="''" value="">全部订单</el-radio-button>
        <el-radio-button :label="'pending_payment'" value="pending_payment">待付款</el-radio-button>
        <el-radio-button :label="'pending_shipment'" value="pending_shipment">待发货</el-radio-button>
        <el-radio-button :label="'pending_receipt'" value="pending_receipt">待收货</el-radio-button>
        <el-radio-button :label="'completed'" value="completed">已完成</el-radio-button>
        <el-radio-button :label="'canceled'" value="canceled">已取消</el-radio-button>
      </el-radio-group>
    </div>
    
    <!-- 表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="orderList"
        border
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无数据'"
        table-layout="fixed"
      >
        <el-table-column prop="orderNumber" label="订单号" width="180" fixed="left">
          <template #default="scope">
            <el-tooltip :content="scope.row.orderNumber" placement="top">
              <span class="order-number-text">{{ scope.row.orderNumber }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="下单账号" width="120">
          <template #default="scope">
            <el-tooltip :content="getUserName(scope.row)" placement="top">
              <span class="username-text">{{ getUserName(scope.row) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="收货人" width="100">
          <template #default="scope">
            <el-tooltip :content="getCustomerName(scope.row)" placement="top">
              <span class="customer-name-text">{{ getCustomerName(scope.row) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="customerPhone" label="联系电话" width="130">
          <template #default="scope">
            <el-tooltip :content="getCustomerPhone(scope.row)" placement="top">
              <span class="phone-number-text">{{ getCustomerPhone(scope.row) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="shippingAddress" label="配送地址" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            {{ getFullAddress(scope.row.shippingAddress) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalPrice" label="订单金额" width="100" align="center">
          <template #default="scope">
            ¥{{ scope.row.totalPrice?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="160" align="center">
          <template #default="scope">
            <el-tooltip :content="formatTime(scope.row.createdAt)" placement="top">
              <span class="date-text">{{ formatTime(scope.row.createdAt) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="100" align="center">
          <template #default="scope">
            {{ getPaymentMethodText(scope.row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column label="商品信息" width="120" align="center">
          <template #default="scope">
            <el-popover
              placement="top"
              :width="400"
              trigger="hover"
              :show-after="200"
              :hide-after="100"
            >
              <template #reference>
                <div class="product-count-display">
                  <span class="product-count-number">
                    共 {{ scope.row.orderItems?.length || 0 }} 种商品
                  </span>
                </div>
              </template>
              <template #default>
                <div class="product-details-popup">
                  <h4 class="popup-title">商品详情</h4>
                  <div class="product-list">
                    <div 
                      v-for="(item, index) in scope.row.orderItems" 
                      :key="index" 
                      class="product-item"
                    >
                      <div class="product-info">
                        <div class="product-name">{{ item.name }}</div>
                        <div class="product-details">
                          <span class="product-price">¥{{ item.price?.toFixed(2) || '0.00' }}</span>
                          <span class="product-quantity">x {{ item.quantity }}</span>
                          <span class="product-subtotal">小计: ¥{{ (item.price * item.quantity)?.toFixed(2) || '0.00' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="popup-footer">
                    <strong>总计: ¥{{ scope.row.totalPrice?.toFixed(2) || '0.00' }}</strong>
                  </div>
                </div>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button>
            
            <template v-if="scope.row.status === 'pending_payment'">
              <el-button link type="warning" @click="handleConfirmPayment(scope.row)">确认付款</el-button>
              <el-button link type="danger" @click="handleCancel(scope.row)">取消</el-button>
            </template>
            
            <template v-if="scope.row.status === 'pending_shipment'">
              <el-button link type="success" @click="handleDeliver(scope.row)">发货</el-button>
            </template>
            
            <template v-if="scope.row.status === 'pending_receipt'">
              <el-button link type="success" @click="handleComplete(scope.row)">完成订单</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 确认支付对话框 -->
    <el-dialog
      v-model="paymentDialogVisible"
      title="确认收款"
      width="500px"
    >
      <el-form
        ref="paymentFormRef"
        :model="paymentForm"
        label-width="100px"
        status-icon
      >
        <el-form-item label="订单号">
          <el-input v-model="paymentForm.orderNumber" disabled />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input v-model="paymentForm.amount" disabled>
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod" required>
          <el-select v-model="paymentForm.paymentMethod" style="width: 100%">
            <el-option label="现金支付" value="cash" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="银行卡" value="card" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="paymentForm.remark"
            type="textarea"
            rows="3"
            placeholder="可选"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="paymentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPayment" :loading="paymentLoading">
            确认收款
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 订单详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="订单详情"
      direction="rtl"
      :size="drawerSize"
      :with-header="true"
      :modal="true"
      :lock-scroll="true"
    >
      <div v-if="selectedOrderData" class="order-detail">
        <!-- 订单基本信息 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>订单信息</span>
            </div>
          </template>
          
          <div class="order-info">
            <div class="info-row">
              <label>订单号：</label>
              <span class="order-number">{{ selectedOrderData.orderNumber }}</span>
            </div>
            <div class="info-row">
              <label>订单状态：</label>
              <el-tag :type="getStatusType(selectedOrderData.status)">
                {{ getStatusText(selectedOrderData.status) }}
              </el-tag>
            </div>
            <div class="info-row">
              <label>订单金额：</label>
              <span class="price">¥{{ selectedOrderData.totalPrice?.toFixed(2) || '0.00' }}</span>
            </div>
            <div class="info-row">
              <label>支付方式：</label>
              <span>{{ getPaymentMethodText(selectedOrderData.paymentMethod) }}</span>
            </div>
            <div class="info-row">
              <label>下单时间：</label>
              <span>{{ formatTime(selectedOrderData.createdAt) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 订单状态进度 -->
        <el-card shadow="never" class="detail-card" v-if="selectedOrderData.status !== 'cancelled'">
          <template #header>
            <div class="card-header">
              <span>订单状态进度</span>
            </div>
          </template>
          
          <div class="order-progress">
            <div class="progress-steps">
              <div 
                v-for="(step, index) in getOrderSteps(selectedOrderData.status)" 
                :key="step.key"
                class="progress-step"
                :class="{
                  'completed': step.completed,
                  'current': step.current,
                  'pending': !step.completed && !step.current
                }"
              >
                <div class="step-icon">
                  <el-icon v-if="step.completed">
                    <Check />
                  </el-icon>
                  <span v-else-if="step.current" class="step-number">{{ index + 1 }}</span>
                  <span v-else class="step-number">{{ index + 1 }}</span>
                </div>
                <div class="step-content">
                  <div class="step-title">{{ step.title }}</div>
                  <div v-if="step.description" class="step-description">{{ step.description }}</div>
                  <div v-if="step.time" class="step-time">{{ step.time }}</div>
                </div>
                <div v-if="index < getOrderSteps(selectedOrderData.status).length - 1" class="step-line"></div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 操作日志 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>操作日志</span>
            </div>
          </template>
          
          <div class="order-timeline">
            <el-timeline>
              <el-timeline-item
                v-for="(log, index) in getOrderLogs(selectedOrderData)"
                :key="index"
                :timestamp="log.time"
                :type="log.type"
                :color="log.color"
                placement="top"
              >
                <div class="timeline-content">
                  <div class="timeline-title">{{ log.title }}</div>
                  <div v-if="log.description" class="timeline-description">{{ log.description }}</div>
                  <div v-if="log.operator" class="timeline-operator">操作人：{{ log.operator }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>

        <!-- 客户信息 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>客户信息</span>
            </div>
          </template>
          
          <div class="customer-info">
            <div class="info-row">
              <label>下单账号：</label>
              <span>{{ getUserName(selectedOrderData) }}</span>
            </div>
            <div class="info-row">
              <label>收货人：</label>
              <span>{{ getCustomerName(selectedOrderData) }}</span>
            </div>
            <div class="info-row">
              <label>联系电话：</label>
              <span>{{ getCustomerPhone(selectedOrderData) }}</span>
            </div>
            <div class="info-row">
              <label>收货地址：</label>
              <span>{{ getFullAddress(selectedOrderData.shippingAddress) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 商品信息 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>商品信息</span>
            </div>
          </template>
          
          <div class="products-info">
            <div v-if="selectedOrderData.orderItems && selectedOrderData.orderItems.length > 0" class="product-list">
              <div v-for="(item, index) in selectedOrderData.orderItems" :key="index" class="product-item">
                <div class="product-image">
                  <el-image
                    :src="item.imageUrl || '/assets/images/products/default.png'"
                    fit="cover"
                    style="width: 60px; height: 60px; border-radius: 4px;"
                  >
                    <template #error>
                      <div class="image-slot">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
                <div class="product-details">
                  <div class="product-name">{{ item.name || '商品名称' }}</div>
                  <div class="product-description" v-if="item.description">
                    {{ item.description }}
                  </div>
                  <div class="product-spec">
                    <span class="price">¥{{ (item.price || 0).toFixed(2) }}</span>
                    <span class="quantity">x{{ item.quantity || 1 }}</span>
                  </div>
                </div>
                <div class="product-total">
                  <div class="total-amount">¥{{ ((item.price || 0) * (item.quantity || 1)).toFixed(2) }}</div>
                </div>
              </div>
              
              <!-- 订单总计 -->
              <div class="order-summary">
                <div class="summary-row">
                  <span class="summary-label">商品总数：</span>
                  <span class="summary-value">{{ selectedOrderData.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0) }} 件</span>
                </div>
                <div class="summary-row total-row">
                  <span class="summary-label">订单总金额：</span>
                  <span class="summary-value total-price">¥{{ selectedOrderData.totalPrice?.toFixed(2) || '0.00' }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-products">
              <el-empty description="暂无商品信息" />
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <template v-if="selectedOrderData.status === 'pending_payment'">
            <el-button type="success" @click="handleConfirmPayment(selectedOrderData)">
              确认收款
            </el-button>
            <el-button type="danger" @click="handleCancel(selectedOrderData)">
              取消订单
            </el-button>
          </template>
          <template v-else-if="selectedOrderData.status === 'pending_shipment'">
            <el-button type="primary" @click="handleDeliver(selectedOrderData)">
              确认发货
            </el-button>
            <el-button type="danger" @click="handleCancel(selectedOrderData)">
              取消订单
            </el-button>
          </template>
          <template v-else-if="selectedOrderData.status === 'pending_receipt'">
            <el-button type="success" @click="handleComplete(selectedOrderData)">
              确认完成
            </el-button>
          </template>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Search, RefreshLeft, Picture, Check } from '@element-plus/icons-vue'
import { getOrderList, updateOrderStatus } from '@/api/order'
import request from '@/api/request'

const router = useRouter()
const loading = ref(false)
const paymentLoading = ref(false)
const orderList = ref([])
const total = ref(0)
const activeStatus = ref('')
const dateRange = ref([])
const paymentDialogVisible = ref(false)
const paymentFormRef = ref(null)
const currentOrder = ref(null)
const detailDrawerVisible = ref(false)
const selectedOrderId = ref('')
const selectedOrderData = ref(null)

// 动态设置抽屉尺寸
const drawerSize = computed(() => {
  const screenWidth = window.innerWidth
  if (screenWidth < 768) {
    return '100%'  // 小屏幕全屏
  } else if (screenWidth < 1200) {
    return '80%'   // 中等屏幕80%
  } else {
    return '700px' // 大屏幕固定宽度
  }
})

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  startDate: '',
  endDate: ''
})

// 支付表单
const paymentForm = reactive({
  orderNumber: '',
  amount: '',
  paymentMethod: 'cash',
  remark: ''
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 获取管理员订单列表 - 使用真实API
const fetchOrderList = async () => {
  loading.value = true
  try {
    const params = {
      page: queryParams.page,
      limit: queryParams.pageSize
    }
    
    // 添加搜索关键词 - 支持订单号、下单账号、收货人、联系方式、收货地址模糊搜索
    if (queryParams.keyword) {
      params.keyword = queryParams.keyword
      console.log('🔍 添加搜索关键词:', queryParams.keyword)
    }
    
    // 添加订单状态筛选
    if (queryParams.status) {
      params.status = queryParams.status
    }
    
    // 添加日期范围筛选
    if (queryParams.startDate) {
      params.startDate = queryParams.startDate
    }
    if (queryParams.endDate) {
      params.endDate = queryParams.endDate
    }

    // 使用管理员API路由
    const response = await request({
      url: '/admin/orders',
      method: 'get',
      params
    })

    if (response && response.success) {
      // 处理订单数据，确保字段完整
      orderList.value = (response.data?.orders || response.data || []).map(order => ({
        ...order,
        _id: order._id || order.id,
        orderNumber: order.orderNumber || `WS${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
        totalPrice: order.totalPrice || 0,
        status: order.status || 'pending_payment',
        paymentMethod: order.paymentMethod || '',
        createdAt: order.createdAt || new Date().toISOString()
      }))
      
      total.value = response.data?.total || response.total || orderList.value.length
      console.log('获取订单列表成功:', orderList.value)
    } else {
      console.error('获取订单列表失败:', response)
      ElMessage.error(response?.message || '获取订单列表失败')
      orderList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取订单列表出错:', error)
    ElMessage.error('获取订单列表失败')
    orderList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  
  // 处理日期范围
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startDate = dateRange.value[0]
    queryParams.endDate = dateRange.value[1]
  } else {
    queryParams.startDate = ''
    queryParams.endDate = ''
  }
  
  fetchOrderList()
}

// 重置搜索条件
const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.status = ''
  dateRange.value = []
  queryParams.startDate = ''
  queryParams.endDate = ''
  activeStatus.value = ''
  handleSearch()
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending_payment': '待付款',
    'pending_shipment': '待发货',
    'pending_receipt': '待收货',
    'completed': '已完成',
    'canceled': '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    'pending_payment': 'warning',
    'pending_shipment': 'info',
    'pending_receipt': 'primary',
    'completed': 'success',
    'canceled': 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const methodMap = {
    'cash': '现金',
    'wechat': '微信',
    'alipay': '支付宝',
    'card': '银行卡'
  }
  return methodMap[method] || '-'
}

// 获取完整地址
const getFullAddress = (address) => {
  if (!address) return '暂无地址'
  const { province, city, district, address: detail } = address
  return `${province || ''}${city || ''}${district || ''}${detail || ''}`
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理状态变化
const handleStatusChange = (status) => {
  activeStatus.value = status
  queryParams.status = status
  queryParams.page = 1
  fetchOrderList()
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  fetchOrderList()
}

// 处理当前页变化
const handleCurrentChange = (page) => {
  queryParams.page = page
  fetchOrderList()
}

// 查看订单详情
const handleDetail = (row) => {
  selectedOrderId.value = row._id
  selectedOrderData.value = row
  detailDrawerVisible.value = true
}

// 确认付款对话框
const handleConfirmPayment = (row) => {
  currentOrder.value = row
  paymentForm.orderNumber = row.orderNumber
  paymentForm.amount = row.totalPrice?.toFixed(2) || '0.00'
  paymentForm.paymentMethod = 'cash'
  paymentForm.remark = ''
  paymentDialogVisible.value = true
}

// 确认付款
const confirmPayment = async () => {
  paymentLoading.value = true
  try {
    const response = await request({
      url: `/admin/orders/${currentOrder.value._id}/status`,
      method: 'put',
      data: {
        status: 'pending_shipment',
        paymentMethod: paymentForm.paymentMethod,
        remark: paymentForm.remark
      }
    })

    if (response && response.success) {
      ElMessage.success('确认收款成功')
      paymentDialogVisible.value = false
      fetchOrderList()
    } else {
      ElMessage.error(response?.message || '确认收款失败')
    }
  } catch (error) {
    console.error('确认收款失败:', error)
    ElMessage.error('确认收款失败')
  } finally {
    paymentLoading.value = false
  }
}

// 发货
const handleDeliver = (row) => {
  ElMessageBox.confirm(
    `确定发货订单 ${row.orderNumber} ?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      const response = await request({
        url: `/admin/orders/${row._id}/status`,
        method: 'put',
        data: {
          status: 'pending_receipt'
        }
      })

      if (response && response.success) {
        ElMessage.success('订单发货成功')
        fetchOrderList()
      } else {
        ElMessage.error(response?.message || '订单发货失败')
      }
    } catch (error) {
      console.error('订单发货失败:', error)
      ElMessage.error('订单发货失败')
    }
  }).catch(() => {})
}

// 完成订单
const handleComplete = (row) => {
  ElMessageBox.confirm(
    `确定将订单 ${row.orderNumber} 标记为已完成?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      const response = await request({
        url: `/admin/orders/${row._id}/status`,
        method: 'put',
        data: {
          status: 'completed'
        }
      })

      if (response && response.success) {
        ElMessage.success('订单完成成功')
        fetchOrderList()
      } else {
        ElMessage.error(response?.message || '订单完成失败')
      }
    } catch (error) {
      console.error('订单完成失败:', error)
      ElMessage.error('订单完成失败')
    }
  }).catch(() => {})
}

// 取消订单
const handleCancel = (row) => {
  ElMessageBox.confirm(
    `确定取消订单 ${row.orderNumber} ?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await request({
        url: `/admin/orders/${row._id}/status`,
        method: 'put',
        data: {
          status: 'canceled'
        }
      })

      if (response && response.success) {
        ElMessage.success('订单取消成功')
        fetchOrderList()
      } else {
        ElMessage.error(response?.message || '订单取消失败')
      }
    } catch (error) {
      console.error('订单取消失败:', error)
      ElMessage.error('订单取消失败')
    }
  }).catch(() => {})
}

// 导出订单
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 获取下单账号名
const getUserName = (row) => {
  return row.user?.username || 
         row.user?.nickName || 
         row.customerInfo?.username ||
         '未知账号'
}

// 获取客户名称（收货人）
const getCustomerName = (row) => {
  return row.shippingAddress?.name || 
         row.shippingAddress?.contactName || 
         row.customerInfo?.name || 
         '未知用户'
}

// 获取客户电话
const getCustomerPhone = (row) => {
  return row.shippingAddress?.phone || 
         row.customerInfo?.phone || 
         '暂无电话'
}

// 获取订单进度步骤
const getOrderSteps = (status) => {
  const allSteps = [
    {
      key: 'pending_payment',
      title: '待付款',
      description: '等待买家付款',
      completed: false,
      current: false,
      time: null
    },
    {
      key: 'pending_shipment', 
      title: '待发货',
      description: '买家已付款，等待发货',
      completed: false,
      current: false,
      time: null
    },
    {
      key: 'pending_receipt',
      title: '配送中',
      description: '商品正在配送中',
      completed: false,
      current: false,
      time: null
    },
    {
      key: 'completed',
      title: '已完成',
      description: '订单已完成',
      completed: false,
      current: false,
      time: null
    }
  ]

  // 根据当前订单状态设置步骤状态
  const statusIndex = allSteps.findIndex(step => step.key === status)
  
  if (statusIndex !== -1) {
    if (status === 'completed') {
      // 对于已完成的订单，所有步骤都标记为completed
      for (let i = 0; i <= statusIndex; i++) {
        allSteps[i].completed = true
        // 模拟时间戳（实际项目中应该从订单数据中获取）
        allSteps[i].time = formatTime(new Date(Date.now() - (statusIndex - i) * 24 * 60 * 60 * 1000))
      }
    } else {
      // 对于其他状态，设置已完成的步骤和当前步骤
      for (let i = 0; i < statusIndex; i++) {
        allSteps[i].completed = true
        // 模拟时间戳（实际项目中应该从订单数据中获取）
        allSteps[i].time = formatTime(new Date(Date.now() - (statusIndex - i) * 24 * 60 * 60 * 1000))
      }
      
      // 设置当前步骤
      allSteps[statusIndex].current = true
      allSteps[statusIndex].time = formatTime(new Date())
    }
  }

  return allSteps
}

// 获取订单操作日志
const getOrderLogs = (order) => {
  const logs = []
  
  // 创建订单日志
  logs.push({
    title: '订单创建',
    description: `订单 ${order.orderNumber} 创建成功`,
    time: formatTime(order.createdAt),
    type: 'primary',
    color: '#409EFF',
    operator: getUserName(order)
  })

  // 根据订单状态添加相应日志
  const statusLogs = {
    'pending_payment': [],
    'pending_shipment': [
      {
        title: '确认付款',
        description: '买家付款已确认，订单进入待发货状态',
        time: formatTime(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 模拟2小时前
        type: 'success',
        color: '#67C23A',
        operator: '系统'
      }
    ],
    'pending_receipt': [
      {
        title: '确认付款',
        description: '买家付款已确认，订单进入待发货状态',
        time: formatTime(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), // 模拟1天前
        type: 'success',
        color: '#67C23A',
        operator: '系统'
      },
      {
        title: '确认发货',
        description: '商品已发货，正在配送中',
        time: formatTime(new Date(Date.now() - 4 * 60 * 60 * 1000)), // 模拟4小时前
        type: 'warning',
        color: '#E6A23C',
        operator: '管理员'
      }
    ],
    'completed': [
      {
        title: '确认付款',
        description: '买家付款已确认，订单进入待发货状态',
        time: formatTime(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 模拟3天前
        type: 'success',
        color: '#67C23A',
        operator: '系统'
      },
      {
        title: '确认发货',
        description: '商品已发货，正在配送中',
        time: formatTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 模拟2天前
        type: 'warning',
        color: '#E6A23C',
        operator: '管理员'
      },
      {
        title: '订单完成',
        description: '买家确认收货，订单完成',
        time: formatTime(new Date(Date.now() - 1 * 60 * 60 * 1000)), // 模拟1小时前
        type: 'success',
        color: '#67C23A',
        operator: '系统'
      }
    ],
    'canceled': [
      {
        title: '订单取消',
        description: '订单已被取消',
        time: formatTime(order.cancelledAt || new Date(Date.now() - 30 * 60 * 1000)), // 使用取消时间或模拟30分钟前
        type: 'danger',
        color: '#F56C6C',
        operator: '管理员'
      }
    ]
  }

  // 添加状态相关的日志
  if (statusLogs[order.status]) {
    logs.push(...statusLogs[order.status])
  }

  // 按时间倒序排列（最新的在前面）
  return logs.sort((a, b) => new Date(b.time) - new Date(a.time))
}

// 监听搜索关键词变化
watch(
  () => queryParams.keyword,
  (newKeyword, oldKeyword) => {
    console.log('🔍 搜索关键词变化:', { newKeyword, oldKeyword })
    
    // 防抖处理
    clearTimeout(window.searchTimeout)
    window.searchTimeout = setTimeout(() => {
      // 当关键词被清空时，也要重新搜索
      if (newKeyword === '' || newKeyword.length >= 2) {
        console.log('🔍 触发自动搜索:', newKeyword)
        queryParams.page = 1
        fetchOrderList()
      }
    }, 500)
  }
)

// 监听日期范围变化
watch(
  () => dateRange.value,
  (newDateRange) => {
    console.log('📅 日期范围变化:', newDateRange)
    // 当日期范围被清空时，也要重新搜索
    if (!newDateRange || newDateRange.length === 0) {
      queryParams.startDate = ''
      queryParams.endDate = ''
      queryParams.page = 1
      fetchOrderList()
    }
  }
)

onMounted(() => {
  fetchOrderList()
})

// 组件卸载时清理
onUnmounted(() => {
  if (window.searchTimeout) {
    clearTimeout(window.searchTimeout)
    delete window.searchTimeout
  }
})
</script>

<style scoped>
.order-list-container {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}

.search-card {
  margin-bottom: 10px;
  width: 100%;
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

.date-picker {
  width: 240px;
}

.status-tabs {
  margin-bottom: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 8px 0 0 0;
  width: 100%;
}

.username-text {
  color: #409EFF;
  font-weight: 500;
  font-size: 13px;
}

.customer-name-text {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.phone-number-text {
  color: #606266;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
}

.order-items {
  line-height: 1.4;
}

.order-item {
  font-size: 12px;
  color: #606266;
  margin-bottom: 2px;
}

.more-items {
  font-size: 12px;
  color: #909399;
}

/* 商品数量显示样式 */
.product-count-display {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-block;
}

.product-count-display:hover {
  background-color: #f0f9ff;
}

.product-count-number {
  color: #409EFF;
  font-weight: 500;
  font-size: 13px;
}

/* 商品详情弹窗样式 */
.product-details-popup {
  max-height: 300px;
  overflow-y: auto;
}

.popup-title {
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.product-list {
  margin-bottom: 12px;
}

.product-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #f5f7fa;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1.4;
}

.product-details {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.product-price {
  color: #E6A23C;
  font-weight: 500;
  font-size: 13px;
}

.product-quantity {
  color: #606266;
  font-size: 13px;
}

.product-subtotal {
  color: #909399;
  font-size: 12px;
}

.popup-footer {
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
  text-align: right;
  color: #E6A23C;
}

/* 移除按钮焦点边框 */
:deep(.el-button:focus) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.el-button:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.el-radio-button__inner:focus) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.el-radio-button__inner:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
}

/* 表格操作列按钮样式 */
:deep(.el-table .el-button) {
  border: none;
  background: transparent;
}

:deep(.el-table .el-button:focus) {
  outline: none !important;
  box-shadow: none !important;
  border: none;
}

/* 表格布局优化 */
:deep(.el-table) {
  table-layout: fixed !important;
}

:deep(.el-table .el-table__cell) {
  padding: 8px 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-table .el-table__header-wrapper th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-table .el-table__row:hover > td) {
  background-color: #f5f7fa;
}

:deep(.el-table .el-table__fixed) {
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
}

:deep(.el-table .el-table__fixed-right) {
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.1);
}

/* 确保文本不换行 */
.username-text,
.customer-name-text,
.phone-number-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

/* 按钮图标和文字间隔 */
:deep(.el-button .el-icon + *) {
  margin-left: 4px;
}

/* 表格文本溢出样式 */
.order-number-text,
.username-text,
.customer-name-text,
.phone-number-text,
.date-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}

/* 订单详情抽屉样式 */
.order-detail {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.detail-card {
  margin-bottom: 16px;
}

.detail-card :deep(.el-card__header) {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

.detail-card :deep(.el-card__body) {
  padding: 16px;
}

.card-header {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.order-info,
.customer-info {
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
  font-size: 14px;
}

.info-row span {
  color: #303133;
  word-break: break-all;
  font-size: 14px;
}

.order-number {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-weight: 600;
  color: #409EFF;
}

.price {
  color: #E6A23C;
  font-weight: 600;
  font-size: 16px;
}

/* 订单状态进度样式 */
.order-progress {
  padding: 8px 0;
}

.progress-steps {
  display: flex;
  align-items: flex-start;
  position: relative;
  width: 100%;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 0;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  margin-bottom: 8px;
}

.progress-step.completed .step-icon {
  background-color: #67C23A;
  color: white;
  border: 2px solid #67C23A;
}

.progress-step.current .step-icon {
  background-color: #409EFF;
  color: white;
  border: 2px solid #409EFF;
}

.progress-step.pending .step-icon {
  background-color: #f5f7fa;
  color: #909399;
  border: 2px solid #dcdfe6;
}

.step-number {
  font-size: 14px;
  font-weight: 600;
}

.step-content {
  text-align: center;
  width: 100%;
  padding: 0 8px;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.step-description {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  line-height: 1.4;
}

.step-time {
  font-size: 11px;
  color: #C0C4CC;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.step-line {
  position: absolute;
  top: 16px;
  left: calc(50% + 16px);
  right: calc(-50% + 16px);
  height: 2px;
  background-color: #dcdfe6;
  z-index: 1;
}

.progress-step.completed .step-line {
  background-color: #67C23A;
}

.progress-step:last-child .step-line {
  display: none;
}

/* 操作日志样式 */
.order-timeline {
  padding: 8px 0;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.timeline-description {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
  line-height: 1.4;
}

.timeline-operator {
  font-size: 12px;
  color: #909399;
}

/* Element Plus Timeline 样式覆盖 */
:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: #909399;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

:deep(.el-timeline-item__content) {
  padding-left: 16px;
}

/* 商品信息样式 */
.products-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.product-image {
  flex-shrink: 0;
  margin-right: 8px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
  border-radius: 4px;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  word-break: break-all;
}

.product-description {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  line-height: 1.4;
}

.product-spec {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-spec .price {
  font-size: 14px;
  color: #E6A23C;
  font-weight: 600;
}

.product-spec .quantity {
  font-size: 13px;
  color: #606266;
}

.product-total {
  flex-shrink: 0;
  text-align: right;
  margin-left: 12px;
}

.total-amount {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.order-summary {
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-size: 14px;
  color: #606266;
}

.summary-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.total-row {
  border-top: 1px solid #e4e7ed;
  padding-top: 12px;
  margin-top: 12px;
  margin-bottom: 0;
}

.total-price {
  font-size: 18px;
  font-weight: 700;
  color: #E6A23C;
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

/* 响应式样式 */
@media (max-width: 768px) {
  .order-detail {
    padding: 12px;
  }
  
  .detail-card :deep(.el-card__body) {
    padding: 12px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-height: auto;
    margin-bottom: 8px;
  }
  
  .info-row label {
    width: auto;
    font-size: 13px;
  }
  
  .info-row span {
    font-size: 13px;
  }
  
  .product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }
  
  .product-image {
    align-self: center;
    margin-right: 0;
  }
  
  .product-details {
    width: 100%;
    text-align: center;
  }
  
  .product-spec {
    justify-content: center;
  }
  
  .product-total {
    margin-left: 0;
    text-align: center;
  }
  
  .progress-steps {
    flex-direction: column;
    gap: 16px;
  }
  
  .progress-step {
    flex-direction: row;
    align-items: center;
    width: 100%;
  }
  
  .step-icon {
    margin-bottom: 0;
    margin-right: 12px;
  }
  
  .step-content {
    text-align: left;
    flex: 1;
  }
  
  .step-line {
    display: none;
  }
}
</style> 