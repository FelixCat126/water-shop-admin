<template>
  <el-dialog
    v-model="visible"
    title="分发优惠券"
    width="800px"
    :before-close="handleClose"
  >
    <!-- 目标用户信息 -->
    <div class="target-users">
      <h4>目标用户</h4>
      <div v-if="targetUsers.length === 1" class="single-user">
        <el-tag type="primary" size="large">
          {{ targetUsers[0].username }} ({{ targetUsers[0].phone || '无手机号' }})
        </el-tag>
      </div>
      <div v-else class="batch-users">
        <el-tag type="success" size="large">
          批量分发给 {{ targetUsers.length }} 位用户
        </el-tag>
        <div class="user-preview">
          <el-tag 
            v-for="(user, index) in targetUsers.slice(0, 5)" 
            :key="user._id"
            size="small"
            style="margin: 4px"
          >
            {{ user.username }}
          </el-tag>
          <span v-if="targetUsers.length > 5" class="more-hint">
            等 {{ targetUsers.length }} 位用户
          </span>
        </div>
      </div>
    </div>

    <!-- 选择优惠券 -->
    <div class="coupon-selection">
      <h4>选择优惠券</h4>
      <div v-loading="couponLoading" class="coupon-list">
        <div
          v-for="(coupon, index) in availableCoupons"
          :key="`coupon-item-${coupon._id}-${index}`"
          class="coupon-item"
          :class="{ selected: isSelectedCoupon(coupon._id) }"
        >
          <div class="coupon-info">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-desc">{{ coupon.description || '暂无描述' }}</div>
            <div class="coupon-details">
              <span class="coupon-type">{{ getCouponTypeText(coupon.type) }}</span>
              <span class="coupon-value">{{ formatDiscount(coupon) }}</span>
              <span class="coupon-min">满{{ coupon.minOrderAmount || 0 }}元可用</span>
            </div>
          </div>
          <div class="coupon-stock">
            <div class="stock-info">
              剩余 {{ getRemainingCountText(coupon) }}
            </div>
            <div v-if="isSelectedCoupon(coupon._id)" class="count-input">
              <div class="count-label">分发数量:</div>
              <el-input-number
                v-model="getSelectedCoupon(coupon._id).count"
                :min="1"
                :max="getMaxCount(coupon)"
                size="small"
                @change="validateCount"
                @click.stop
              />
              <!-- 库存不足警告 -->
              <div 
                v-if="isStockInsufficient(coupon)" 
                class="stock-warning"
              >
                <el-icon><WarningFilled /></el-icon>
                库存不足
              </div>
            </div>
          </div>
          <div class="selection-indicator">
            <el-checkbox
              :key="`checkbox-${coupon._id}-${index}`"
              :name="`coupon-checkbox-${coupon._id}-${index}`"
              :model-value="isSelectedCoupon(coupon._id)"
              @change="(checked) => handleCheckboxChange(coupon, checked)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 分发汇总 -->
    <div v-if="selectedCoupons.length > 0" class="distribution-summary">
      <h4>分发汇总</h4>
      <div class="summary-list">
        <div v-for="coupon in selectedCoupons" :key="coupon._id" class="summary-item">
          <span class="coupon-name">{{ coupon.name }}</span>
          <span class="coupon-count">共 {{ coupon.count }} 张</span>
          <span v-if="targetUsers.length === 1" class="total-count">
            (该用户获得 {{ coupon.count }} 张)
          </span>
          <span v-else class="total-count">
            (每人获得 {{ coupon.count }} 张，共需 {{ coupon.count * targetUsers.length }} 张)
          </span>
        </div>
      </div>
      
      <!-- 分发说明 -->
      <div class="distribution-note">
        <el-alert
          v-if="targetUsers.length > 1"
          title="分发说明"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            每种优惠券选择的数量代表每个用户将获得的数量。
            <br />
            例如：选择5张，则 {{ targetUsers.length }} 位用户每人都会获得5张该优惠券。
          </template>
        </el-alert>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleDistribute"
          :loading="distributing"
          :disabled="selectedCoupons.length === 0"
        >
          确认分发
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { getCoupons, distributeCoupons } from '@/api/coupon'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  targetUsers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const couponLoading = ref(false)
const distributing = ref(false)
const availableCoupons = ref([])
const selectedCoupons = ref([])

// 监听弹窗显示
watch(visible, (newVal) => {
  if (newVal) {
    fetchCoupons()
    selectedCoupons.value = []
  }
})

// 优化的选中状态判断
const isSelectedCoupon = (couponId) => {
  return selectedCoupons.value.some(c => c._id === couponId)
}

// 获取选中的优惠券对象
const getSelectedCoupon = (couponId) => {
  return selectedCoupons.value.find(c => c._id === couponId)
}

// 获取优惠券列表
const fetchCoupons = async () => {
  couponLoading.value = true
  try {
    const response = await getCoupons({
      page: 1,
      limit: 100,
      isActive: true
    })
    
    console.log('获取到的优惠券响应:', response) // 添加调试日志
    
    if (response && response.success) {
      // 检查是否有重复的ID
      const allCoupons = response.data?.coupons || []
      const uniqueIds = new Set()
      const duplicateIds = []
      
      allCoupons.forEach(coupon => {
        if (uniqueIds.has(coupon._id)) {
          duplicateIds.push(coupon._id)
        } else {
          uniqueIds.add(coupon._id)
        }
      })
      
      if (duplicateIds.length > 0) {
        console.warn('发现重复的优惠券ID:', duplicateIds)
      }
      
      // 过滤可用的优惠券
      availableCoupons.value = allCoupons.filter(coupon => {
        if (!coupon.totalCount) return true // 无限制优惠券
        
        const remaining = coupon.totalCount - coupon.usedCount
        if (props.targetUsers.length === 1) {
          return remaining > 0 // 单人分发只需要有剩余即可
        } else {
          return remaining >= props.targetUsers.length // 多人分发需要至少每人1张
        }
      })
      
      console.log('过滤后的可用优惠券:', availableCoupons.value) // 添加调试日志
      console.log('可用优惠券IDs:', availableCoupons.value.map(c => c._id)) // 检查ID
    }
  } catch (error) {
    console.error('获取优惠券失败:', error)
    ElMessage.error('获取优惠券失败')
  } finally {
    couponLoading.value = false
  }
}

// 处理复选框变化 - 这是唯一的优惠券选择控制函数
const handleCheckboxChange = (coupon, checked) => {
  console.log(`=== 优惠券选择变化 ===`)
  console.log(`优惠券ID: ${coupon._id}`)
  console.log(`优惠券名称: ${coupon.name}`)
  console.log(`选中状态: ${checked}`)
  console.log(`变化前选中的优惠券数量: ${selectedCoupons.value.length}`)
  
  if (checked) {
    // 选中：如果没有在列表中，则添加
    const exists = selectedCoupons.value.find(c => c._id === coupon._id)
    if (!exists) {
      selectedCoupons.value.push({
        ...coupon,
        count: 1
      })
      console.log(`✅ 已添加优惠券: ${coupon.name}`)
    } else {
      console.log(`⚠️ 优惠券已存在，跳过添加: ${coupon.name}`)
    }
  } else {
    // 取消选中：从列表中移除
    const index = selectedCoupons.value.findIndex(c => c._id === coupon._id)
    if (index > -1) {
      const removed = selectedCoupons.value.splice(index, 1)
      console.log(`❌ 已移除优惠券: ${removed[0].name}`)
    } else {
      console.log(`⚠️ 未找到要移除的优惠券: ${coupon.name}`)
    }
  }
  
  console.log(`变化后选中的优惠券数量: ${selectedCoupons.value.length}`)
  console.log('当前选中的优惠券:', selectedCoupons.value.map(c => `${c.name}(${c._id})`))
  console.log(`==================`)
}

// 验证分发数量
const validateCount = () => {
  selectedCoupons.value.forEach(coupon => {
    const remaining = getRemainingCount(coupon)
    if (remaining === null) {
      // 不限量优惠券，只需要检查合理上限
      const maxReasonable = props.targetUsers.length === 1 ? 100 : 50
      if (coupon.count > maxReasonable) {
        coupon.count = maxReasonable
      }
    } else {
      // 有限量优惠券，需要检查总需求量
      const totalNeed = coupon.count * props.targetUsers.length
      if (totalNeed > remaining) {
        // 如果总需求超过剩余数量，调整为最大可分配数量
        coupon.count = Math.floor(remaining / props.targetUsers.length)
      }
    }
    
    if (coupon.count < 1) {
      coupon.count = 1
    }
  })
}

// 获取剩余数量
const getRemainingCount = (coupon) => {
  if (!coupon.totalCount) return null // 无限制返回null
  return coupon.totalCount - coupon.usedCount
}

// 获取剩余数量显示文本
const getRemainingCountText = (coupon) => {
  const remaining = getRemainingCount(coupon)
  return remaining === null ? '不限量' : `${remaining} 张`
}

// 获取数量输入框的最大值
const getMaxCount = (coupon) => {
  const remaining = getRemainingCount(coupon)
  if (remaining === null) {
    // 不限量的情况下，设置合理上限
    return props.targetUsers.length === 1 ? 100 : 50
  }
  
  // 有限量的情况下，计算每人最多能分配多少
  const maxPerUser = Math.floor(remaining / props.targetUsers.length)
  return Math.max(1, maxPerUser)
}

// 检查库存是否不足
const isStockInsufficient = (coupon) => {
  const selectedCoupon = getSelectedCoupon(coupon._id)
  if (!selectedCoupon) return false
  
  const remaining = getRemainingCount(coupon)
  if (remaining === null) return false // 不限量不会不足
  
  const totalNeed = selectedCoupon.count * props.targetUsers.length
  return totalNeed > remaining
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

// 执行分发
const handleDistribute = async () => {
  if (selectedCoupons.value.length === 0) {
    ElMessage.warning('请选择要分发的优惠券')
    return
  }

  // 验证数量是否足够
  for (const coupon of selectedCoupons.value) {
    const remaining = getRemainingCount(coupon)
    if (remaining !== null) {
      const totalNeed = coupon.count * props.targetUsers.length
      if (totalNeed > remaining) {
        ElMessage.error(`优惠券"${coupon.name}"数量不足，需要${totalNeed}张，但只剩余${remaining}张`)
        return
      }
    }
  }

  try {
    await ElMessageBox.confirm(
      `确定要分发 ${selectedCoupons.value.length} 种优惠券给 ${props.targetUsers.length} 位用户吗？`,
      '确认分发',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    distributing.value = true

    // 准备分发数据 - 修正数据格式以匹配后端期望
    const distributionData = {
      type: props.targetUsers.length === 1 ? 'single' : 'batch',
      coupons: selectedCoupons.value.map(coupon => ({
        couponId: coupon._id,
        count: coupon.count
      }))
    }

    // 根据分发类型添加用户信息
    if (props.targetUsers.length === 1) {
      distributionData.userId = props.targetUsers[0]._id
    } else {
      distributionData.userIds = props.targetUsers.map(user => user._id)
    }

    console.log('发送分发请求数据:', distributionData) // 添加调试日志

    const response = await distributeCoupons(distributionData)

    if (response && response.success) {
      ElMessage.success('优惠券分发成功！')
      visible.value = false
      emit('success')
    } else {
      ElMessage.error(response?.message || '分发失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('分发优惠券失败:', error)
      // 提供更详细的错误信息
      if (error.response && error.response.data && error.response.data.message) {
        ElMessage.error(`分发失败: ${error.response.data.message}`)
      } else {
        ElMessage.error('分发失败，请检查网络连接或联系管理员')
      }
    }
  } finally {
    distributing.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.target-users {
  margin-bottom: 20px;
}

.target-users h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.single-user {
  padding: 10px 0;
}

.batch-users {
  padding: 10px 0;
}

.user-preview {
  margin-top: 8px;
}

.more-hint {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.coupon-selection h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.coupon-list {
  max-height: 400px;
  overflow-y: auto;
}

.coupon-item {
  border: 2px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.coupon-item.selected {
  border-color: #409EFF;
  background-color: #f0f9ff;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.coupon-desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.coupon-details {
  display: flex;
  gap: 12px;
}

.coupon-type {
  padding: 2px 6px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

.coupon-value {
  color: #f56c6c;
  font-weight: 600;
}

.coupon-min {
  color: #606266;
  font-size: 12px;
}

.coupon-stock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 15px;
}

.stock-info {
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
}

.count-input {
  width: 120px;
}

.count-label {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
  text-align: center;
}

.stock-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  color: #f56c6c;
  font-size: 12px;
}

.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
}

.distribution-summary {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.distribution-summary h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.summary-list {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.coupon-name {
  font-weight: 500;
  color: #303133;
}

.coupon-count {
  color: #409EFF;
  font-weight: 600;
}

.total-count {
  font-size: 12px;
  color: #909399;
}

.distribution-note {
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 