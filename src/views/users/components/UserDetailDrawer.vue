<template>
  <el-drawer
    v-model="visible"
    :title="`用户详情 - ${userDetail.username || ''}`"
    direction="rtl"
    size="60%"
    @close="handleClose"
    :style="{
      '--el-drawer-header-height': '25px',
      '--el-drawer-header-padding': '4px 20px'
    }"
    class="custom-drawer"
  >
    <div v-loading="loading" class="user-detail-content">
      <div v-if="userDetail._id" class="detail-container">
        <!-- 用户基本信息卡片 -->
        <el-card shadow="never" class="info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          
          <div class="user-basic-info">
            <div class="user-avatar-section">
              <el-avatar :src="userAvatarUrl" :size="80" class="large-avatar">
                <el-icon size="40"><User /></el-icon>
              </el-avatar>
              <div class="user-status">
                <el-tag 
                  :type="userDetail.isActive ? 'success' : 'danger'"
                  size="small"
                >
                  {{ userDetail.isActive ? '激活' : '禁用' }}
                </el-tag>
              </div>
            </div>
            
            <div class="user-info-grid">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="用户ID">
                  {{ userDetail._id }}
                </el-descriptions-item>
                <el-descriptions-item label="用户名">
                  {{ userDetail.username }}
                </el-descriptions-item>
                <el-descriptions-item label="昵称">
                  {{ userDetail.nickName || '未设置' }}
                </el-descriptions-item>
                <el-descriptions-item label="手机号">
                  {{ userDetail.phone || '未设置' }}
                </el-descriptions-item>
                <el-descriptions-item label="性别">
                  {{ formatGender(userDetail.gender) }}
                </el-descriptions-item>
                <el-descriptions-item label="生日">
                  {{ formatBirthday(userDetail.birthday) }}
                </el-descriptions-item>
                <el-descriptions-item label="邮箱">
                  {{ userDetail.email || '未设置' }}
                </el-descriptions-item>
                <el-descriptions-item label="积分">
                  {{ userDetail.points || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="注册时间">
                  {{ formatDate(userDetail.createdAt) }}
                </el-descriptions-item>
                <el-descriptions-item label="最后登录">
                  {{ userDetail.lastLogin ? formatDate(userDetail.lastLogin) : '从未登录' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>

        <!-- 统计信息卡片 -->
        <el-card shadow="never" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>消费统计</span>
            </div>
          </template>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.orders ? userDetail.orders.length : 0 }}</div>
              <div class="stat-label">订单总数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">¥{{ userDetail.totalConsumption || 0 }}</div>
              <div class="stat-label">总消费金额</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" :style="{ color: memberLevelInfo.color }">{{ memberLevelInfo.level }}</div>
              <div class="stat-label">会员等级</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.userCoupons ? userDetail.userCoupons.length : 0 }}</div>
              <div class="stat-label">拥有优惠券</div>
            </div>
          </div>
        </el-card>

        <!-- 订单列表 -->
        <el-card shadow="never" class="orders-card">
          <template #header>
            <div class="card-header">
              <span>订单列表</span>
              <span class="order-count">共 {{ userDetail.orders ? userDetail.orders.length : 0 }} 个订单</span>
            </div>
          </template>
          
          <div v-if="userDetail.orders && userDetail.orders.length > 0" class="orders-list">
            <el-table 
              :data="paginatedOrders" 
              style="width: 100%"
              size="small"
              max-height="400"
              @expand-change="handleExpandChange"
            >
              <el-table-column type="expand" width="40">
                <template #default="{ row }">
                  <div class="expanded-order-items">
                    <h4>订单商品明细：</h4>
                    <el-table
                      :data="row.orderItems"
                      size="small"
                      style="margin-left: 20px;"
                    >
                      <el-table-column prop="name" label="商品名称" width="200">
                        <template #default="scope">
                          <el-tooltip :content="scope.row.name" placement="top" :disabled="!scope.row.name || scope.row.name.length <= 15">
                            <span class="product-name-text">{{ scope.row.name }}</span>
                          </el-tooltip>
                        </template>
                      </el-table-column>
                      <el-table-column prop="quantity" label="数量" width="80" align="center">
                        <template #default="scope">
                          ×{{ scope.row.quantity }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="price" label="单价" width="100" align="center">
                        <template #default="scope">
                          ¥{{ scope.row.price }}
                        </template>
                      </el-table-column>
                      <el-table-column label="小计" width="120" align="center">
                        <template #default="scope">
                          ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="description" label="规格说明" min-width="150">
                        <template #default="scope">
                          <el-tooltip :content="scope.row.description || '无'" placement="top" :disabled="!scope.row.description || scope.row.description.length <= 10">
                            <span class="description-text">{{ scope.row.description || '无' }}</span>
                          </el-tooltip>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="orderNumber" label="订单号" width="180">
                <template #default="scope">
                  <el-tooltip :content="scope.row.orderNumber" placement="top">
                    <span class="order-number-text">{{ scope.row.orderNumber }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="totalPrice" label="订单金额" width="120" align="center">
                <template #default="scope">
                  ¥{{ scope.row.totalPrice }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="订单状态" width="100" align="center">
                <template #default="scope">
                  <el-tag 
                    :type="getOrderStatusType(scope.row.status)"
                    size="small"
                  >
                    {{ getOrderStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="isPaid" label="支付状态" width="100" align="center">
                <template #default="scope">
                  <el-tag 
                    :type="scope.row.isPaid ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ scope.row.isPaid ? '已支付' : '未支付' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="isDelivered" label="配送状态" width="100" align="center">
                <template #default="scope">
                  <el-tag 
                    :type="scope.row.isDelivered ? 'success' : 'info'"
                    size="small"
                  >
                    {{ scope.row.isDelivered ? '已配送' : '未配送' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="下单时间" min-width="140">
                <template #default="scope">
                  <el-tooltip :content="formatDate(scope.row.createdAt)" placement="top">
                    <span class="date-text">{{ formatDate(scope.row.createdAt) }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column label="商品数量" width="100" align="center">
                <template #default="scope">
                  {{ scope.row.orderItems ? scope.row.orderItems.length : 0 }} 种商品
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 订单分页 -->
            <div class="order-pagination">
              <el-pagination
                v-model:current-page="orderPagination.page"
                v-model:page-size="orderPagination.pageSize"
                :page-sizes="[5, 10, 20, 50]"
                :total="orderPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                small
                @size-change="handleOrderPageSizeChange"
                @current-change="handleOrderPageChange"
              />
            </div>
          </div>
          <div v-else class="empty-orders">
            <el-empty description="该用户暂无订单" />
          </div>
        </el-card>

        <!-- 优惠券列表 -->
        <el-card shadow="never" class="coupons-list-card">
          <template #header>
            <div class="card-header">
              <span>优惠券列表</span>
              <div class="coupon-header-right">
                <div class="coupon-summary">
                  <span class="coupon-count">总共 {{ couponStats.total }} 张</span>
                  <span class="coupon-available">可用 {{ couponStats.available }} 张</span>
                  <span class="coupon-used">已用 {{ couponStats.used }} 张</span>
                  <span class="coupon-expired">过期 {{ couponStats.expired }} 张</span>
                </div>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleDistributeCoupon"
                  style="margin-left: 16px;"
                >
                  <el-icon><Plus /></el-icon>
                  分发优惠券
                </el-button>
              </div>
            </div>
          </template>
          
          <div v-if="userDetail.userCoupons && userDetail.userCoupons.length > 0" class="coupons-table">
            <el-table 
              :data="userDetail.userCoupons" 
              style="width: 100%"
              size="small"
              max-height="400"
            >
              <el-table-column prop="coupon.name" label="优惠券名称" width="200">
                <template #default="scope">
                  {{ scope.row.coupon?.name || '优惠券' }}
                </template>
              </el-table-column>
              <el-table-column prop="coupon.description" label="描述" min-width="150">
                <template #default="scope">
                  {{ scope.row.coupon?.description || '无描述' }}
                </template>
              </el-table-column>
              <el-table-column prop="coupon.value" label="优惠金额" width="120" align="center">
                <template #default="scope">
                  {{ scope.row.coupon?.type === 'amount' ? `¥${scope.row.coupon.value}` : `${scope.row.coupon?.value}折` }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="scope">
                  <el-tag 
                    :type="getCouponStatusType(scope.row)"
                    size="small"
                  >
                    {{ getCouponStatusText(scope.row) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="coupon.expirationDate" label="有效期" width="140" align="center">
                <template #default="scope">
                  <span v-if="scope.row.coupon?.expirationDate">
                    {{ formatDate(scope.row.coupon.expirationDate) }}
                  </span>
                  <span v-else style="color: #67C23A; font-weight: 500;">永久有效</span>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="获得时间" width="140">
                <template #default="scope">
                  {{ formatDate(scope.row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="usedAt" label="使用时间" width="140">
                <template #default="scope">
                  <span v-if="scope.row.isUsed">
                    {{ formatDate(scope.row.usedAt) }}
                  </span>
                  <span v-else style="color: #909399;">--</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-else class="empty-coupons">
            <el-empty description="该用户暂无优惠券" />
          </div>
        </el-card>

        <!-- 优惠券信息（保留原有的卡片显示） -->
        <el-card shadow="never" class="coupons-card" v-if="false && userDetail.userCoupons && userDetail.userCoupons.length > 0">
          <template #header>
            <div class="card-header">
              <span>优惠券信息</span>
              <span class="coupon-count">共 {{ userDetail.userCoupons.length }} 张</span>
            </div>
          </template>
          
          <div class="coupons-grid">
            <div 
              v-for="userCoupon in userDetail.userCoupons" 
              :key="userCoupon.id"
              class="coupon-item"
              :class="{ 
                'used': userCoupon.isUsed,
                'expired': !userCoupon.isUsed && isCouponExpired(userCoupon.coupon)
              }"
            >
              <div class="coupon-content">
                <div class="coupon-name">{{ userCoupon.coupon?.name || '优惠券' }}</div>
                <div class="coupon-desc">{{ userCoupon.coupon?.description || '' }}</div>
                <div class="coupon-value">
                  {{ userCoupon.coupon?.type === 'amount' ? `¥${userCoupon.coupon.value}` : `${userCoupon.coupon?.value}折` }}
                </div>
              </div>
              <div class="coupon-status">
                <el-tag 
                  :type="getCouponStatusType(userCoupon)"
                  size="small"
                >
                  {{ getCouponStatusText(userCoupon) }}
                </el-tag>
                <div class="coupon-date">
                  {{ formatCouponDate(userCoupon) }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, watch, computed, reactive, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, User } from '@element-plus/icons-vue'
import { getUserDetail } from '@/api/user'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    default: ''
  },
  userData: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'refresh', 'distribute-coupon'])

// 响应式数据
const loading = ref(false)
const userDetail = ref({})

// 订单分页数据
const orderPagination = reactive({
  page: 1,
  pageSize: 5,
  total: 0
})

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 计算属性 - 分页后的订单列表
const paginatedOrders = computed(() => {
  const orders = userDetail.value.orders || []
  orderPagination.total = orders.length
  
  const start = (orderPagination.page - 1) * orderPagination.pageSize
  const end = start + orderPagination.pageSize
  return orders.slice(start, end)
})

// 计算属性 - 用户头像URL（简化版本）
const userAvatarUrl = computed(() => {
  const avatar = userDetail.value?.avatar
  console.log('原始头像:', avatar)
  
  if (!avatar) return ''
  
  // 如果是完整URL，直接返回
  if (avatar.startsWith('http')) {
    console.log('完整URL:', avatar)
    return avatar
  }
  
  // 否则使用localhost:5001拼接
  const result = `http://localhost:5001${avatar.startsWith('/') ? avatar : '/' + avatar}`
  console.log('拼接结果:', result)
  return result
})

// 获取用户详情
const fetchUserDetail = async () => {
  if (!props.userId) return
  
  loading.value = true
  try {
    const response = await getUserDetail(props.userId)
    if (response.success) {
      userDetail.value = response.data
      console.log('==== 用户详情调试信息 ====')
      console.log('完整用户数据:', userDetail.value)
      console.log('原始头像字段:', userDetail.value.avatar)
      console.log('头像字段类型:', typeof userDetail.value.avatar)
      console.log('==========================')
      
      // 如果传递了最新的用户数据，使用最新的状态信息
      if (props.userData) {
        userDetail.value.isActive = props.userData.isActive
        userDetail.value.points = props.userData.points
        userDetail.value.totalConsumption = props.userData.totalConsumption
      }
    } else {
      ElMessage.error(response.message || '获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  } finally {
    loading.value = false
  }
}

// 监听userId变化
watch(() => props.userId, (newUserId) => {
  if (newUserId && props.modelValue) {
    fetchUserDetail()
  }
})

// 强制移除margin-bottom的函数
const forceRemoveMarginBottom = () => {
  nextTick(() => {
    const headers = document.querySelectorAll('.custom-drawer .el-drawer__header')
    headers.forEach(header => {
      if (header) {
        header.style.marginBottom = '0px'
        header.style.setProperty('margin-bottom', '0px', 'important')
      }
    })
  })
}

// 监听抽屉显示状态
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.userId) {
    fetchUserDetail()
    // 强制移除margin-bottom
    forceRemoveMarginBottom()
  }
})

// 监听userData变化
watch(() => props.userData, (newUserData) => {
  if (newUserData && userDetail.value._id) {
    // 更新用户状态信息
    userDetail.value.isActive = newUserData.isActive
    userDetail.value.points = newUserData.points
    userDetail.value.totalConsumption = newUserData.totalConsumption
  }
}, { deep: true })

// 关闭抽屉
const handleClose = () => {
  userDetail.value = {}
  // 重置订单分页
  orderPagination.page = 1
  orderPagination.pageSize = 5
  orderPagination.total = 0
  emit('update:modelValue', false)
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

// 格式化性别
const formatGender = (gender) => {
  // 处理中文性别值（后端存储的实际值）
  if (gender === '男' || gender === '女' || gender === '未知') {
    return gender
  }
  
  // 兼容英文性别值（以防万一）
  const genderMap = {
    'male': '男',
    'female': '女', 
    'unknown': '未知'
  }
  return genderMap[gender] || '未设置'
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const statusMap = {
    'pending_payment': 'warning',
    'pending_shipment': 'primary',
    'pending_receipt': 'info',
    'completed': 'success',
    'canceled': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    'pending_payment': '待付款',
    'pending_shipment': '待配送',
    'pending_receipt': '配送中',
    'completed': '已完成',
    'canceled': '已取消'
  }
  return statusMap[status] || '处理中'
}

// 计算会员等级
const getMemberLevel = (points) => {
  if (!points || points < 0) return { level: '普通会员', color: '#909399' }
  
  if (points < 100) {
    return { level: '普通会员', color: '#909399' }
  } else if (points < 500) {
    return { level: '铜牌会员', color: '#CD7F32' }
  } else if (points < 1000) {
    return { level: '银牌会员', color: '#C0C0C0' }
  } else if (points < 2000) {
    return { level: '金牌会员', color: '#FFD700' }
  } else if (points < 5000) {
    return { level: '白金会员', color: '#E5E4E2' }
  } else {
    return { level: '钻石会员', color: '#B9F2FF' }
  }
}

// 计算属性 - 会员等级信息
const memberLevelInfo = computed(() => {
  return getMemberLevel(userDetail.value.points)
})

// 处理订单分页
const handleOrderPageChange = (newPage) => {
  orderPagination.page = newPage
}

const handleOrderPageSizeChange = (newPageSize) => {
  orderPagination.pageSize = newPageSize
}

// 处理展开行
const handleExpandChange = (row) => {
  // 实现展开行逻辑
}

// 处理分发优惠券
const handleDistributeCoupon = () => {
  // 触发分发优惠券事件，传递用户信息
  emit('distribute-coupon', {
    userId: userDetail.value._id,
    username: userDetail.value.username,
    type: 'single'
  })
}

// 检查优惠券是否过期
const isCouponExpired = (coupon) => {
  if (!coupon?.expirationDate) return false
  return new Date(coupon.expirationDate) < new Date()
}

// 获取优惠券状态类型
const getCouponStatusType = (userCoupon) => {
  if (userCoupon.isUsed) return 'info'
  if (isCouponExpired(userCoupon.coupon)) return 'danger'
  return 'success'
}

// 获取优惠券状态文本
const getCouponStatusText = (userCoupon) => {
  if (userCoupon.isUsed) return '已使用'
  if (isCouponExpired(userCoupon.coupon)) return '已过期'
  return '可使用'
}

// 格式化优惠券日期
const formatCouponDate = (userCoupon) => {
  if (userCoupon.isUsed) {
    return `使用时间: ${formatDate(userCoupon.usedAt)}`
  }
  if (userCoupon.coupon?.expirationDate) {
    return `有效期至: ${formatDate(userCoupon.coupon.expirationDate)}`
  }
  return `获得时间: ${formatDate(userCoupon.createdAt)}`
}

// 计算有效优惠券统计
const couponStats = computed(() => {
  const coupons = userDetail.value.userCoupons || []
  const total = coupons.length
  const used = coupons.filter(uc => uc.isUsed).length
  const expired = coupons.filter(uc => !uc.isUsed && isCouponExpired(uc.coupon)).length
  const available = total - used - expired
  
  return { total, used, expired, available }
})

// 格式化生日
const formatBirthday = (birthday) => {
  if (!birthday) return '未设置'
  
  try {
    const date = new Date(birthday)
    // 检查是否为有效日期
    if (isNaN(date.getTime())) return '未设置'
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    console.error('生日格式化错误:', error)
    return '未设置'
  }
}

// 组件挂载后执行
onMounted(() => {
  forceRemoveMarginBottom()
})
</script>

<style scoped>
/* 恢复正常样式 */
.user-detail-content {
  padding: 0;
  margin: 0;
}

/* 重点调整：压缩抽屉组件本身的标题栏高度 */
.custom-drawer ::v-deep(.el-drawer__header) {
  padding: 10px 20px !important;
  margin: 0 !important;
  margin-bottom: 0px !important;
  border-bottom: 1px solid #ebeef5 !important;
  background-color: #fafafa !important;
  min-height: 35px !important;
  max-height: 35px !important;
  height: 35px !important;
  line-height: 15px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
  overflow: hidden !important;
}

.custom-drawer ::v-deep(.el-drawer__title) {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: #303133 !important;
  line-height: 15px !important;
  margin: 0 !important;
  padding: 0 !important;
  flex: 1 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.custom-drawer .el-drawer__close-btn {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

.custom-drawer .el-drawer__close-btn:focus,
.custom-drawer .el-drawer__close-btn:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
}

::v-deep(.el-drawer) {
  display: flex;
  flex-direction: column;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin: 12px;
  padding: 0;
}

.info-card {
  margin: 0;
}

.info-card :deep(.el-card__header) {
  padding: 12px 20px;
}

.info-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.order-count,
.coupon-count {
  font-size: 14px;
  color: #909399;
}

/* 基本信息样式 */
.user-basic-info {
  display: flex;
  gap: 20px;
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 120px;
}

.large-avatar {
  border: 3px solid #f0f2f5;
}

.user-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.user-info-grid {
  flex: 1;
}

/* 统计信息样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-extra {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
  line-height: 1.2;
}

/* 订单列表样式 */
.orders-list {
  margin-top: 16px;
}

.expanded-order-items {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin: 8px 0;
}

.expanded-order-items h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.empty-orders {
  margin-top: 20px;
}

/* 优惠券样式 */
.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.coupon-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
  transition: all 0.3s ease;
}

.coupon-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.coupon-item.used {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
}

.coupon-item.used:hover {
  border-color: #909399;
  box-shadow: 0 2px 8px rgba(144, 147, 153, 0.1);
}

.coupon-item.expired {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
}

.coupon-item.expired:hover {
  border-color: #909399;
  box-shadow: 0 2px 8px rgba(144, 147, 153, 0.1);
}

.coupon-content {
  margin-bottom: 12px;
}

.coupon-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.coupon-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.coupon-value {
  font-size: 18px;
  font-weight: bold;
  color: #E6A23C;
}

.coupon-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-date {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-basic-info {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .coupons-grid {
    grid-template-columns: 1fr;
  }
}

.order-pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

/* 优惠券摘要样式 */
.coupon-header-right {
  display: flex;
  align-items: center;
}

.coupon-summary {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.coupon-count {
  color: #409EFF;
  font-weight: 500;
}

.coupon-available {
  color: #67C23A;
  font-weight: 500;
}

.coupon-used {
  color: #909399;
}

.coupon-expired {
  color: #F56C6C;
}

/* 表格文本溢出样式 */
.order-number-text,
.date-text,
.product-name-text,
.description-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}
</style>

<!-- 全局样式来强制覆盖 -->
<style>
.el-drawer__header {
  margin-bottom: 0px !important;
}

.custom-drawer .el-drawer__header {
  padding: 10px 20px !important;
  margin: 0 !important;
  margin-bottom: 0px !important;
  border-bottom: 1px solid #ebeef5 !important;
  background-color: #fafafa !important;
  min-height: 35px !important;
  max-height: 35px !important;
  height: 35px !important;
  line-height: 15px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
  overflow: hidden !important;
}

.custom-drawer .el-drawer__title {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: #303133 !important;
  line-height: 15px !important;
  margin: 0 !important;
  padding: 0 !important;
  flex: 1 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
</style> 