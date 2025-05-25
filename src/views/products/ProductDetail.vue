<template>
  <div class="product-detail-container">
    <div class="page-header">
      <el-button @click="$router.go(-1)" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>商品详情</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleEdit">编辑商品</el-button>
      </div>
    </div>

    <el-card v-loading="loading" shadow="never">
      <div class="product-detail" v-if="product">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>商品图片:</label>
              <div class="product-images">
                <el-image
                  :src="product.imageUrl"
                  :preview-src-list="[product.imageUrl]"
                  fit="cover"
                  style="width: 120px; height: 120px; border-radius: 8px;"
                />
              </div>
            </div>
            <div class="detail-item">
              <label>商品名称:</label>
              <span>{{ product.name }}</span>
            </div>
            <div class="detail-item">
              <label>商品描述:</label>
              <span>{{ product.description }}</span>
            </div>
            <div class="detail-item">
              <label>商品价格:</label>
              <span class="price">¥{{ product.price?.toFixed(2) }}</span>
            </div>
            <div class="detail-item">
              <label>商品分类:</label>
              <el-tag :type="getCategoryType(product.category)">
                {{ getCategoryName(product.category) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>商品标签:</label>
              <el-tag v-if="product.tag" type="warning">{{ product.tag }}</el-tag>
              <span v-else>-</span>
            </div>
          </div>
        </div>

        <!-- 库存和销售信息 -->
        <div class="detail-section">
          <h3>库存和销售</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>当前库存:</label>
              <span class="stock" :class="{ 'low-stock': product.stock < 10 }">
                {{ product.stock }} 件
              </span>
            </div>
            <div class="detail-item">
              <label>已售数量:</label>
              <span>{{ product.sales || 0 }} 件</span>
            </div>
            <div class="detail-item">
              <label>商品状态:</label>
              <el-tag :type="product.isActive ? 'success' : 'danger'">
                {{ product.isActive ? '上架中' : '已下架' }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>商品评分:</label>
              <div class="rating">
                <el-rate
                  v-model="product.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value} 分"
                />
                <span class="rating-count">({{ product.ratingsCount || 0 }}个评价)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 时间信息 -->
        <div class="detail-section">
          <h3>时间信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>创建时间:</label>
              <span>{{ formatTime(product.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <label>更新时间:</label>
              <span>{{ formatTime(product.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button type="primary" @click="handleEdit">编辑商品</el-button>
          <el-button 
            :type="product.isActive ? 'warning' : 'success'" 
            @click="handleStatusChange"
          >
            {{ product.isActive ? '下架商品' : '上架商品' }}
          </el-button>
          <el-button type="danger" @click="handleDelete">删除商品</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProduct, updateProduct, deleteProduct } from '@/api/product'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const product = ref(null)

// 获取商品详情
const fetchProductDetail = async () => {
  loading.value = true
  try {
    const response = await getProduct(route.params.id)
    console.log('商品详情API返回:', response)
    
    if (response.success) {
      const productData = response.data.product || response.data
      product.value = productData
    } else {
      throw new Error(response.message || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error(error.response?.data?.message || '获取商品详情失败')
    // 返回商品列表页
    router.push('/products')
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

// 获取分类名称
const getCategoryName = (category) => {
  const categoryMap = {
    // 数据库中的英文分类
    'pure': '纯净水',
    'mineral': '矿泉水',
    'soda': '气泡水',
    'family': '家庭装',
    // 兼容中文分类
    '纯净水': '纯净水',
    '矿泉水': '矿泉水', 
    '气泡水': '气泡水',
    '家庭装': '家庭装',
    'water': '桶装水',
    'dispenser': '饮水机',
    'accessory': '配件'
  }
  return categoryMap[category] || category || '未知'
}

// 获取分类标签类型
const getCategoryType = (category) => {
  const typeMap = {
    // 数据库中的英文分类
    'pure': 'primary',
    'mineral': 'success',
    'soda': 'warning',
    'family': 'info',
    // 兼容中文分类
    '纯净水': 'primary',
    '矿泉水': 'success',
    '气泡水': 'warning',
    '家庭装': 'info',
    'water': '',
    'dispenser': 'success',
    'accessory': 'info'
  }
  return typeMap[category] || ''
}

// 编辑商品
const handleEdit = () => {
  router.push(`/products/edit/${route.params.id}`)
}

// 更改商品状态
const handleStatusChange = async () => {
  const action = product.value.isActive ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(
      `确定要${action}该商品吗？`,
      `${action}商品`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await updateProduct(route.params.id, { 
      isActive: !product.value.isActive 
    })
    
    product.value.isActive = !product.value.isActive
    ElMessage.success(`商品已${action}`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新商品状态失败:', error)
      ElMessage.error('更新商品状态失败')
    }
  }
}

// 删除商品
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品 "${product.value.name}" 吗？此操作不可恢复！`,
      '删除商品',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteProduct(route.params.id)
    ElMessage.success('商品删除成功')
    router.push('/products')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  }
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-container {
  padding: 20px 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.back-btn {
  margin-right: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.product-detail {
  padding: 24px;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-weight: 600;
  color: #606266;
  font-size: 14px;
}

.detail-item span {
  color: #303133;
  font-size: 14px;
}

.price {
  color: #E6A23C;
  font-weight: bold;
  font-size: 16px;
}

.stock {
  font-weight: bold;
}

.stock.low-stock {
  color: #F56C6C;
}

.product-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-count {
  color: #909399;
  font-size: 12px;
}

.detail-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #EBEEF5;
}

/* 移除所有按钮焦点边框 */
:deep(.el-button:focus) {
  outline: none;
  box-shadow: none;
}

:deep(.el-button:focus-visible) {
  outline: none;
  box-shadow: none;
}
</style> 