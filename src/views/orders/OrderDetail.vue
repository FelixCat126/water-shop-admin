<template>
  <div class="order-detail-container" v-loading="loading">
    <div class="page-header">
      <div class="left">
        <el-page-header @back="goBack" :content="`订单详情: ${orderInfo.orderNumber || ''}`" />
      </div>
      <div class="right">
        <el-button @click="handlePrint">
          <el-icon><Printer /></el-icon> 打印订单
        </el-button>
      </div>
    </div>
    
    <!-- 订单状态 -->
    <el-card class="status-card" shadow="never">
      <div class="order-status">
        <div class="status-icon">
          <el-icon :class="getStatusIconClass(orderInfo.status)">
            <component :is="getStatusIcon(orderInfo.status)" />
          </el-icon>
        </div>
        <div class="status-info">
                  <div class="status-text">{{ getStatusText(orderInfo.status) }}</div>
        <div class="status-desc">{{ getStatusDesc(orderInfo.status) }}</div>
        </div>
      </div>
      
      <div class="status-timeline" v-if="orderInfo.status !== 'canceled'">
        <el-steps :active="getStatusStep(orderInfo.status)" finish-status="success" align-center>
          <el-step title="下单" description="客户下单成功"></el-step>
          <el-step title="付款" description="订单已支付"></el-step>
          <el-step title="配送" description="订单配送中"></el-step>
          <el-step title="完成" description="订单已完成"></el-step>
        </el-steps>
      </div>
      
      <div class="status-actions">
        <template v-if="orderInfo.status === 'pending_payment' || orderInfo.status === 'pending'">
          <el-button type="primary" @click="handleConfirmPayment">确认付款</el-button>
          <el-button type="danger" @click="handleCancel">取消订单</el-button>
        </template>
        
        <template v-if="orderInfo.status === 'pending_shipment' || orderInfo.status === 'paid'">
          <el-button type="primary" @click="handleShip">开始发货</el-button>
          <el-button type="danger" @click="handleCancel">取消订单</el-button>
        </template>
        
        <template v-if="orderInfo.status === 'pending_receipt' || orderInfo.status === 'shipping'">
          <el-button type="primary" @click="handleComplete">完成订单</el-button>
          <el-button type="warning" @click="handleRefund">申请退款</el-button>
        </template>
        
        <template v-if="orderInfo.status === 'completed'">
          <el-button type="warning" @click="handleRefund">申请退款</el-button>
        </template>
      </div>
    </el-card>
    
    <!-- 订单信息 -->
    <div class="order-info-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>订单信息</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="订单编号">{{ orderInfo.orderNumber }}</el-descriptions-item>
              <el-descriptions-item label="下单时间">{{ orderInfo.orderTime }}</el-descriptions-item>
              <el-descriptions-item label="支付方式">{{ getPaymentMethodText(orderInfo.paymentMethod) }}</el-descriptions-item>
              <el-descriptions-item label="支付时间">{{ orderInfo.paymentTime || '-' }}</el-descriptions-item>
              <el-descriptions-item label="订单备注">{{ orderInfo.remark || '无' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>收货信息</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="收货人">{{ orderInfo.customerName }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ orderInfo.phone }}</el-descriptions-item>
              <el-descriptions-item label="配送地址">{{ orderInfo.address }}</el-descriptions-item>
              <el-descriptions-item label="下单账号">{{ orderInfo.orderUsername || '未知账号' }}</el-descriptions-item>
              <el-descriptions-item label="会员等级">{{ orderInfo.memberLevel || '普通会员' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 商品信息 -->
    <el-card shadow="never" class="goods-card">
      <template #header>
        <div class="card-header">
          <span>商品信息</span>
        </div>
      </template>
      
      <!-- 商品列表 -->
      <div class="goods-list">
        <div 
          v-for="(item, index) in orderInfo.items" 
          :key="index" 
          class="goods-item"
        >
          <div class="goods-image">
            <el-image 
              :src="item.image || item.imageUrl || item.product?.imageUrl || '/static/images/products/default.jpg'" 
              :preview-src-list="[item.image || item.imageUrl || item.product?.imageUrl || '/static/images/products/default.jpg']"
              style="width: 60px; height: 60px"
              fit="cover"
              lazy
            >
              <template #error>
                <div style="display: flex; justify-content: center; align-items: center; width: 60px; height: 60px; background: #f5f7fa; color: #909399; font-size: 20px;">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="goods-details">
            <div class="goods-name">{{ item.name }}</div>
            <div class="goods-info">
              <span class="goods-price">¥{{ item.price.toFixed(2) }}</span>
              <span class="goods-quantity">× {{ item.quantity }}</span>
              <span class="goods-subtotal">小计: ¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-amount">
        <div class="amount-item">
          <span class="label">商品总价：</span>
          <span class="value">¥{{ orderInfo.itemsAmount ? orderInfo.itemsAmount.toFixed(2) : '0.00' }}</span>
        </div>
        <div class="amount-item">
          <span class="label">配送费：</span>
          <span class="value">¥{{ orderInfo.shippingFee ? orderInfo.shippingFee.toFixed(2) : '0.00' }}</span>
        </div>
        <div class="amount-item">
          <span class="label">订单总金额：</span>
          <span class="value">¥{{ orderInfo.originalAmount ? orderInfo.originalAmount.toFixed(2) : '0.00' }}</span>
        </div>
        <div class="amount-item" v-if="orderInfo.discount && orderInfo.discount > 0">
          <span class="label">优惠金额：</span>
          <span class="value discount">-¥{{ orderInfo.discount.toFixed(2) }}</span>
        </div>
        <div class="amount-item" v-if="orderInfo.couponInfo">
          <span class="label">使用优惠券：</span>
          <span class="value coupon-name">{{ orderInfo.couponInfo.name }}</span>
        </div>
        <div class="amount-item total">
          <span class="label">实付金额：</span>
          <span class="value total-amount">¥{{ orderInfo.totalAmount ? orderInfo.totalAmount.toFixed(2) : '0.00' }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 配送信息 -->
    <el-card shadow="never" class="delivery-card" v-if="orderInfo.status !== 'pending_payment' && orderInfo.status !== 'pending'">
      <template #header>
        <div class="card-header">
          <span>配送信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="配送方式">{{ orderInfo.deliveryMethod || '自营配送' }}</el-descriptions-item>
        <el-descriptions-item label="配送人员">{{ orderInfo.deliveryStaff || '-' }}</el-descriptions-item>
        <el-descriptions-item label="配送电话">{{ orderInfo.deliveryPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="预计送达">{{ orderInfo.estimatedDeliveryTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <div v-if="orderInfo.trackingInfo && orderInfo.trackingInfo.length > 0" class="tracking-info">
        <div class="section-title">配送追踪</div>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in orderInfo.trackingInfo"
            :key="index"
            :timestamp="item.time"
            :type="index === 0 ? 'primary' : ''"
          >
            {{ item.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
    
    <!-- 操作日志 -->
    <el-card shadow="never" class="log-card">
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in orderInfo.activities"
          :key="index"
          :timestamp="activity.time"
          :type="getActivityType(activity.type)"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
    
    <!-- 添加备注 -->
    <el-card shadow="never" class="remark-card">
      <template #header>
        <div class="card-header">
          <span>添加备注</span>
        </div>
      </template>
      <el-form :model="remarkForm" ref="remarkFormRef">
        <el-form-item prop="content">
          <el-input
            v-model="remarkForm.content"
            type="textarea"
            rows="3"
            placeholder="添加订单备注..."
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAddRemark" :loading="remarkLoading">保存备注</el-button>
        </el-form-item>
      </el-form>
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
          <el-input v-model="paymentForm.orderNo" disabled />
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
        <el-form-item label="交易流水号" prop="transactionId">
          <el-input v-model="paymentForm.transactionId" placeholder="可选" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const remarkLoading = ref(false)
const paymentLoading = ref(false)
const paymentDialogVisible = ref(false)
const paymentFormRef = ref(null)
const remarkFormRef = ref(null)

// 订单信息
const orderInfo = reactive({
  id: '',
  orderNumber: '',
  customerName: '',
  phone: '',
  address: '',
  totalAmount: 0,
  itemsAmount: 0,
  shippingFee: 0,
  originalAmount: 0, // 原价（商品总价 + 配送费）
  discount: 0,
  orderTime: '',
  paymentTime: '',
  status: '',
  paymentMethod: '',
  remark: '',
  orderUsername: '',
  memberLevel: '',
  deliveryMethod: '',
  deliveryStaff: '',
  deliveryPhone: '',
  estimatedDeliveryTime: '',
  items: [],
  trackingInfo: [],
  activities: []
})

console.log('🔧 订单信息对象初始化完成，初始状态:', orderInfo.status)

// 支付表单
const paymentForm = reactive({
  orderNo: '',
  amount: '',
  paymentMethod: 'cash',
  transactionId: '',
  remark: ''
})

// 备注表单
const remarkForm = reactive({
  content: ''
})

// 获取订单详情
const fetchOrderDetail = async (id) => {
  loading.value = true
  try {
    console.log('🚀 开始获取订单详情，ID:', id);
    console.log('🔧 当前token:', localStorage.getItem('token') ? '已设置' : '未设置');
    
    // 调用真实API获取订单详情
    const response = await request({
      url: `/admin/orders/${id}`,
      method: 'get'
    })
    
    console.log('📡 完整API响应:', response);
    console.log('📡 响应类型:', typeof response);
    console.log('📡 响应键值:', Object.keys(response || {}));
    
    if (response && response.success) {
      const order = response.data
      console.log('📦 原始订单数据:', order);
      console.log('📦 订单数据类型:', typeof order);
      console.log('📦 订单键值:', Object.keys(order || {}));
      console.log('🎯 原始状态值:', { status: order.status, type: typeof order.status });
      
      console.log('');
      console.log('🕐 ========== 详细时间字段分析 ==========');
      const timeFields = ['createdAt', 'paidAt', 'deliveredAt', 'completedAt', 'updatedAt', 'finishedAt', 'receivedAt', 'canceledAt'];
      timeFields.forEach(field => {
        const value = order[field];
        console.log(`⏰ ${field}:`);
        console.log(`   原始值: ${value}`);
        console.log(`   数据类型: ${typeof value}`);
        console.log(`   是否为空: ${!value}`);
        if (value) {
          console.log(`   转换为Date: ${new Date(value)}`);
          console.log(`   时间戳: ${new Date(value).getTime()}`);
          console.log(`   是否有效日期: ${!isNaN(new Date(value).getTime())}`);
        }
        console.log('');
      });
      console.log('🕐 ===================================');
      console.log('');
      
      // 在赋值前记录状态
      console.log('🔄 开始赋值前orderInfo.status:', orderInfo.status);
      
      // 统一字段映射
      Object.assign(orderInfo, {
        id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.shippingAddress?.name || order.shippingAddress?.contactName || order.user?.username || '未知用户',
        phone: order.shippingAddress?.phone || '暂无电话',
        address: getFullAddress(order.shippingAddress),
        totalAmount: order.totalPrice || 0, // 支付金额（最终金额）
        itemsAmount: order.itemsPrice || 0,
        shippingFee: order.shippingPrice || 0,
        originalAmount: (order.totalPrice || 0) + (order.discountAmount || 0), // 原价 = 支付金额 + 优惠金额
        discount: order.discountAmount || 0, // 优惠金额
        // 优惠券信息
        couponInfo: (() => {
          // 优先使用parsedCouponInfo
          if (order.parsedCouponInfo) {
            return {
              name: order.parsedCouponInfo.name || '',
              type: order.parsedCouponInfo.type || 'fixed',
              value: order.parsedCouponInfo.value || 0
            };
          }
          // 否则使用usedCoupon字段
          if (order.usedCoupon && order.usedCoupon.coupon) {
            return {
              name: order.usedCoupon.coupon.name || '',
              type: order.usedCoupon.coupon.type || 'fixed',
              value: order.usedCoupon.coupon.value || 0
            };
          }
          return null;
        })(),
        orderTime: formatTime(order.createdAt),
        paymentTime: order.paidAt ? formatTime(order.paidAt) : '',
        status: order.status, // 移除默认值，直接使用API返回的状态
        paymentMethod: order.paymentMethod || '',
        remark: order.remark || '',
        orderUsername: order.user?.username || order.user?.nickName || '未知账号',
        memberLevel: getMemberLevel(order.user?.points || 0),
        items: (order.orderItems || []).map(item => ({
          id: item._id,
          name: item.name,
          image: item.image || item.imageUrl || item.product?.imageUrl || '/static/images/products/default.jpg',
          imageUrl: item.imageUrl || item.image || item.product?.imageUrl || '/static/images/products/default.jpg',
          price: item.price || 0,
          quantity: item.quantity || 1
        })),
        activities: (() => {
          console.log('🎭 ========== 开始生成Activities ==========');
          const activities = []
          
          // 客户下单
          console.log('👤 处理客户下单活动');
          console.log('👤 创建时间原始值:', order.createdAt);
          const createActivity = {
            type: 'create',
            content: '客户下单',
            time: formatTime(order.createdAt)
          }
          console.log('👤 生成的创建活动:', createActivity);
          activities.push(createActivity)
          
          // 订单已支付
          if (order.paidAt) {
            console.log('💰 处理订单支付活动');
            console.log('💰 支付时间原始值:', order.paidAt);
            const paymentActivity = {
              type: 'payment',
              content: '订单已支付',
              time: formatTime(order.paidAt)
            }
            console.log('💰 生成的支付活动:', paymentActivity);
            activities.push(paymentActivity)
          } else {
            console.log('💰 无支付时间，跳过支付活动');
          }
          
          // 订单已发货
          if (order.deliveredAt) {
            console.log('🚚 处理订单发货活动');
            console.log('🚚 发货时间原始值:', order.deliveredAt);
            const shippingActivity = {
              type: 'shipping',
              content: '订单已发货',
              time: formatTime(order.deliveredAt)
            }
            console.log('🚚 生成的发货活动:', shippingActivity);
            activities.push(shippingActivity)
          } else {
            console.log('🚚 无发货时间，跳过发货活动');
          }
          
          // 订单已完成 - 只有在有明确完成时间时才显示
          console.log('✅ 检查完成时间字段');
          console.log('✅ completedAt:', order.completedAt);
          console.log('✅ finishedAt:', order.finishedAt);
          console.log('✅ receivedAt:', order.receivedAt);
          
          const completedTime = order.completedAt || order.finishedAt || order.receivedAt
          console.log('✅ 最终选择的完成时间:', completedTime);
          
          if (completedTime) {
            console.log('✅ 处理订单完成活动');
            const completeActivity = {
              type: 'complete',
              content: '订单已完成',
              time: formatTime(completedTime)
            }
            console.log('✅ 生成的完成活动:', completeActivity);
            activities.push(completeActivity)
          } else {
            console.log('✅ 无完成时间，跳过完成活动');
          }
          
          // 订单已取消
          if (order.canceledAt) {
            console.log('❌ 处理订单取消活动');
            console.log('❌ 取消时间原始值:', order.canceledAt);
            const cancelActivity = {
              type: 'cancel',
              content: '订单已取消',
              time: formatTime(order.canceledAt)
            }
            console.log('❌ 生成的取消活动:', cancelActivity);
            activities.push(cancelActivity)
          } else {
            console.log('❌ 无取消时间，跳过取消活动');
          }
          
          // 订单备注
          if (order.remark) {
            console.log('📝 处理订单备注活动');
            console.log('📝 备注内容:', order.remark);
            console.log('📝 使用创建时间:', order.createdAt);
            const remarkActivity = {
              type: 'remark',
              content: `备注: ${order.remark}`,
              time: formatTime(order.createdAt)
            }
            console.log('📝 生成的备注活动:', remarkActivity);
            activities.push(remarkActivity)
          } else {
            console.log('📝 无备注，跳过备注活动');
          }
          
          console.log('🎭 最终生成的所有活动:', activities);
          console.log('🎭 =======================================');
          
          return activities
        })()
      })
      
      console.log('✅ 设置后的订单信息:', orderInfo);
      console.log('📊 最终状态值:', { status: orderInfo.status, type: typeof orderInfo.status });
      console.log('🔍 状态映射测试:', getStatusText(orderInfo.status));
      
      // 突出显示订单状态
      console.log('');
      console.log('🚨 ==================== 重要信息 ====================');
      console.log(`📋 订单号: ${orderInfo.orderNumber}`);
      console.log(`🎯 当前订单状态: "${orderInfo.status}"`);
      console.log(`📄 状态显示文本: "${getStatusText(orderInfo.status)}"`);
      console.log('🚨 ============================================');
      console.log('');
    } else {
      console.error('❌ API返回失败:', response);
      console.error('❌ response.success:', response?.success);
      console.error('❌ response.data:', response?.data);
      ElMessage.error(response?.message || '获取订单详情失败')
    }
    
    loading.value = false
  } catch (error) {
    console.error('❌ 获取订单详情失败:', error)
    console.error('❌ 错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    ElMessage.error('获取订单详情失败')
    loading.value = false
  }
}

// 获取完整地址
const getFullAddress = (address) => {
  if (!address) return '暂无地址'
  const { province, city, district, address: detail } = address
  return `${province || ''}${city || ''}${district || ''}${detail || ''}`
}

// 格式化时间 - 使用固定格式避免locale差异
const formatTime = (time) => {
  console.log('⏰ ========== formatTime调用 ==========');
  console.log('📥 输入时间值:', time);
  console.log('📥 输入时间类型:', typeof time);
  console.log('📥 输入时间是否为空:', !time);
  
  if (!time) {
    console.log('❌ 时间为空，返回 "-"');
    console.log('⏰ ===================================');
    return '-'
  }
  
  const date = new Date(time)
  console.log('📅 转换后的Date对象:', date);
  console.log('📅 Date对象是否有效:', !isNaN(date.getTime()));
  console.log('📅 时间戳:', date.getTime());
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  const result = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  
  console.log('📤 格式化结果:', result);
  console.log('⏰ ===================================');
  
  return result
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

// 获取订单状态文本
const getStatusText = (status) => {
  console.log('');
  console.log('🎨 ========== 状态文本映射函数调用 ==========');
  console.log('🎯 输入的原始状态值:', status);
  console.log('📊 状态值类型:', typeof status);
  console.log('📏 状态值长度:', status?.length);
  console.log('🔍 状态值是否为空:', !status);
  
  const statusMap = {
    'pending_payment': '待付款',
    'pending_shipment': '待发货',
    'pending_receipt': '待收货',
    'completed': '已完成',
    'canceled': '已取消',
    'refunded': '已退款',
    // 兼容旧的状态值
    'pending': '待付款',
    'paid': '待发货',
    'shipping': '待收货'
  }
  
  const result = statusMap[status] || '未知状态';
  
  console.log('📝 映射后的状态文本:', result);
  console.log('❓ 是否找到匹配:', !!statusMap[status]);
  console.log('🎨 ============================================');
  console.log('');
  
  return result;
}

// 获取订单状态描述
const getStatusDesc = (status) => {
  const descMap = {
    'pending_payment': '订单已创建，等待付款',
    'pending_shipment': '订单已付款，等待发货',
    'pending_receipt': '商品已发货，等待客户确认收货',
    'completed': '订单已完成，交易成功',
    'canceled': '订单已取消',
    'refunded': '订单已退款',
    // 兼容旧的状态值
    'pending': '订单已创建，等待付款',
    'paid': '订单已付款，等待发货',
    'shipping': '商品已发货，等待客户确认收货'
  }
  return descMap[status] || '状态未知，请联系客服'
}

// 获取订单状态图标
const getStatusIcon = (status) => {
  const iconMap = {
    'pending_payment': 'Money',
    'pending_shipment': 'Box',
    'pending_receipt': 'Van',
    'completed': 'CircleCheck',
    'canceled': 'CircleClose',
    'refunded': 'RefreshLeft',
    // 兼容旧的状态值
    'pending': 'Money',
    'paid': 'Box',
    'shipping': 'Van'
  }
  return iconMap[status] || 'InfoFilled'
}

// 获取订单状态图标类
const getStatusIconClass = (status) => {
  const classMap = {
    'pending_payment': 'status-warning',
    'pending_shipment': 'status-info',
    'pending_receipt': 'status-primary',
    'completed': 'status-success',
    'canceled': 'status-danger',
    'refunded': 'status-info',
    // 兼容旧的状态值
    'pending': 'status-warning',
    'paid': 'status-info',
    'shipping': 'status-primary'
  }
  return classMap[status] || 'status-info'
}

// 获取订单状态步骤
const getStatusStep = (status) => {
  const stepMap = {
    'pending_payment': 1,
    'pending_shipment': 2,
    'pending_receipt': 3,
    'completed': 4,
    'canceled': 1,
    'refunded': 3,
    // 兼容旧的状态值
    'pending': 1,
    'paid': 2,
    'shipping': 3
  }
  return stepMap[status] || 0
}

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const methodMap = {
    '微信支付': '微信支付',
    '货到付款': '货到付款',
    'wechat': '微信支付',
    'alipay': '支付宝',
    'cash': '现金',
    'card': '银行卡'
  }
  return methodMap[method] || method || '-'
}

// 获取活动类型
const getActivityType = (type) => {
  const typeMap = {
    'create': 'primary',
    'payment': 'success',
    'shipping': 'warning',
    'complete': 'success',
    'cancel': 'danger',
    'refund': 'info',
    'remark': 'info'
  }
  return typeMap[type] || 'info'
}

// 返回订单列表
const goBack = () => {
  router.push('/orders')
}

// 打印订单
const handlePrint = () => {
  ElMessage.success('打印订单功能开发中...')
}

// 确认付款对话框
const handleConfirmPayment = () => {
  paymentForm.orderNo = orderInfo.orderNumber
  paymentForm.amount = orderInfo.totalAmount.toFixed(2)
  paymentForm.paymentMethod = 'cash'
  paymentForm.transactionId = ''
  paymentForm.remark = ''
  paymentDialogVisible.value = true
}

// 确认付款
const confirmPayment = async () => {
  paymentLoading.value = true
  
  try {
    const response = await request({
      url: `/admin/orders/${orderInfo.id}/pay`,
      method: 'put',
      data: {
        id: paymentForm.transactionId || `admin_${Date.now()}`,
        status: 'success',
        updateTime: new Date(),
        paymentMethod: paymentForm.paymentMethod
      }
    })
    
    if (response && response.success) {
      ElMessage.success('收款成功')
      paymentDialogVisible.value = false
      // 重新获取订单详情以更新显示
      fetchOrderDetail(orderInfo.id)
    } else {
      ElMessage.error(response?.message || '确认收款失败')
    }
  } catch (error) {
    console.error('确认收款失败:', error)
    ElMessage.error('确认收款失败')
  }
  
  paymentLoading.value = false
}

// 开始配送
const handleShip = () => {
  ElMessageBox.confirm(
    '确定开始配送该订单?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      const response = await request({
        url: `/admin/orders/${orderInfo.id}/deliver`,
        method: 'put'
      })
      
      if (response && response.success) {
        ElMessage.success('订单已标记为已发货')
        // 重新获取订单详情以更新显示
        fetchOrderDetail(orderInfo.id)
      } else {
        ElMessage.error(response?.message || '发货失败')
      }
    } catch (error) {
      console.error('发货失败:', error)
      ElMessage.error('发货失败')
    }
  }).catch(() => {})
}

// 完成订单
const handleComplete = () => {
  ElMessageBox.confirm(
    '确定将订单标记为已完成?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      const response = await request({
        url: `/admin/orders/${orderInfo.id}/complete`,
        method: 'put'
      })
      
      if (response && response.success) {
        ElMessage.success('订单已标记为已完成')
        // 重新获取订单详情以更新显示
        fetchOrderDetail(orderInfo.id)
      } else {
        ElMessage.error(response?.message || '完成订单失败')
      }
    } catch (error) {
      console.error('完成订单失败:', error)
      ElMessage.error('完成订单失败')
    }
  }).catch(() => {})
}

// 取消订单
const handleCancel = () => {
  ElMessageBox.confirm(
    '确定取消该订单?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await request({
        url: `/admin/orders/${orderInfo.id}/cancel`,
        method: 'put'
      })
      
      if (response && response.success) {
        ElMessage.success('订单已取消')
        // 重新获取订单详情以更新显示
        fetchOrderDetail(orderInfo.id)
      } else {
        ElMessage.error(response?.message || '取消订单失败')
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }).catch(() => {})
}

// 申请退款
const handleRefund = () => {
  ElMessageBox.confirm(
    '确定为该订单申请退款?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await request({
        url: `/admin/orders/${orderInfo.id}/status`,
        method: 'put',
        data: { status: 'refunded' }
      })
      
      if (response && response.success) {
        ElMessage.success('退款申请已提交')
        // 重新获取订单详情以更新显示
        fetchOrderDetail(orderInfo.id)
      } else {
        ElMessage.error(response?.message || '申请退款失败')
      }
    } catch (error) {
      console.error('申请退款失败:', error)
      ElMessage.error('申请退款失败')
    }
  }).catch(() => {})
}

// 添加备注
const handleAddRemark = async () => {
  if (!remarkForm.content.trim()) {
    ElMessage.warning('请输入备注内容')
    return
  }
  
  remarkLoading.value = true
  
  try {
    // 更新订单备注
    const response = await request({
      url: `/admin/orders/${orderInfo.id}/status`,
      method: 'put',
      data: { 
        status: orderInfo.status, // 保持当前状态
        remark: remarkForm.content 
      }
    })
    
    if (response && response.success) {
      ElMessage.success('备注添加成功')
      remarkForm.content = ''
      // 重新获取订单详情以更新显示
      fetchOrderDetail(orderInfo.id)
    } else {
      ElMessage.error(response?.message || '添加备注失败')
    }
  } catch (error) {
    console.error('添加备注失败:', error)
    ElMessage.error('添加备注失败')
  }
  
  remarkLoading.value = false
}

// 重置订单信息
const resetOrderInfo = () => {
  console.log('🔄 重置订单信息到初始状态')
  Object.assign(orderInfo, {
    id: '',
    orderNumber: '',
    customerName: '',
    phone: '',
    address: '',
    totalAmount: 0,
    itemsAmount: 0,
    shippingFee: 0,
    discount: 0,
    orderTime: '',
    paymentTime: '',
    status: '',
    paymentMethod: '',
    remark: '',
    customerLevel: '',
    registerTime: '',
    deliveryMethod: '',
    deliveryStaff: '',
    deliveryPhone: '',
    estimatedDeliveryTime: '',
    items: [],
    trackingInfo: [],
    activities: []
  })
}

// 初始化订单详情的函数
const initOrderDetail = () => {
  const id = route.params.id
  console.log('🔍 ========== 订单详情页面初始化 ==========')
  console.log('📝 当前路由参数ID:', id)
  console.log('🔄 触发原因: 页面加载或路由参数变化')
  
  // 先重置数据
  resetOrderInfo()
  
  if (id) {
    console.log('✅ 订单ID有效，开始获取订单详情')
    fetchOrderDetail(id)
  } else {
    console.error('❌ 订单ID为空')
    ElMessage.error('订单ID不能为空')
    router.push('/orders')
  }
}

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    console.log('🔄 ========== 路由参数发生变化 ==========')
    console.log('📝 旧订单ID:', oldId)
    console.log('📝 新订单ID:', newId)
    
    if (newId && newId !== oldId) {
      console.log('✅ 检测到订单ID变化，重新加载订单详情')
      initOrderDetail()
    }
  },
  { immediate: false } // 不立即执行，因为onMounted会处理初始加载
)

onMounted(() => {
  console.log('🚀 ========== onMounted 生命周期触发 ==========')
  initOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-card {
  margin-bottom: 20px;
  background-color: #f8f9fa;
}

.order-status {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.status-icon {
  font-size: 50px;
  margin-right: 20px;
}

.status-icon .el-icon {
  font-size: inherit;
}

.status-warning {
  color: #E6A23C;
}

.status-info {
  color: #909399;
}

.status-primary {
  color: #409EFF;
}

.status-success {
  color: #67C23A;
}

.status-danger {
  color: #F56C6C;
}

.status-info {
  font-size: 14px;
}

.status-text {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.status-desc {
  color: #606266;
}

.status-timeline {
  margin: 30px 0;
}

.status-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
}

.order-info-section {
  margin-bottom: 20px;
}

.goods-card,
.delivery-card,
.log-card,
.remark-card {
  margin-bottom: 20px;
}

.order-amount {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount-item {
  margin-bottom: 10px;
  font-size: 14px;
}

.amount-item .label {
  margin-right: 10px;
  color: #606266;
}

.amount-item .value {
  font-weight: bold;
}

.discount {
  color: #F56C6C;
}

.total {
  font-size: 16px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #EBEEF5;
}

.total-amount {
  color: #F56C6C;
  font-size: 20px;
}

.tracking-info {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #EBEEF5;
}

/* 商品信息样式 */
.goods-list {
  margin-bottom: 20px;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fff;
  transition: all 0.3s ease;
}

.goods-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #409EFF;
}

.goods-item:last-child {
  margin-bottom: 0;
}

.goods-image {
  margin-right: 15px;
  flex-shrink: 0;
}

.goods-image .el-image {
  border-radius: 6px;
  border: 1px solid #EBEEF5;
}

.goods-details {
  flex: 1;
}

.goods-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
}

.goods-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.goods-price {
  color: #E6A23C;
  font-weight: 600;
  font-size: 15px;
}

.goods-quantity {
  color: #606266;
  font-size: 14px;
}

.goods-subtotal {
  color: #F56C6C;
  font-weight: 500;
  font-size: 14px;
}

/* 按钮图标和文字间隔 */
:deep(.el-button .el-icon + *) {
  margin-left: 4px;
}
</style>