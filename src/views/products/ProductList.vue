<template>
  <div class="product-list-container">
    <!-- 搜索和筛选 -->
    <el-card shadow="never" class="search-card">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="searchForm.search"
            placeholder="搜索商品名称、描述、标签"
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
          
          <!-- 操作按钮 -->
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
          <el-button type="success" @click="handleBatchImport">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button 
            type="danger" 
            :disabled="selectedProducts.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除 ({{ selectedProducts.length }})
          </el-button>
          <el-button 
            type="success" 
            :disabled="selectedProducts.length === 0"
            @click="handleBatchExport"
          >
            <el-icon><Download /></el-icon>
            导出选中 ({{ selectedProducts.length }})
          </el-button>
        </div>
      </div>
      
      <!-- 当前筛选条件显示 -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="filter-label">当前筛选：</span>
        <el-tag 
          v-if="searchForm.category" 
          closable 
          @close="searchForm.category = ''; handleSearch()"
          class="filter-tag"
        >
          分类: {{ getCategoryName(searchForm.category) }}
        </el-tag>
        <el-tag 
          v-if="searchForm.status !== ''" 
          closable 
          @close="searchForm.status = ''; handleSearch()"
          class="filter-tag"
        >
          状态: {{ searchForm.status === 'on' ? '上架' : '下架' }}
        </el-tag>
        <el-tag 
          v-if="searchForm.priceRange" 
          closable 
          @close="searchForm.priceRange = ''; handleSearch()"
          class="filter-tag"
        >
          价格: {{ searchForm.priceRange }}
        </el-tag>
        <el-tag 
          v-if="searchForm.stockRange" 
          closable 
          @close="searchForm.stockRange = ''; handleSearch()"
          class="filter-tag"
        >
          库存: {{ searchForm.stockRange }}
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
          <el-form-item label="商品分类">
            <el-select v-model="searchForm.category" placeholder="选择分类" clearable style="width: 100%">
              <el-option label="纯净水" value="纯净水" />
              <el-option label="矿泉水" value="矿泉水" />
              <el-option label="家庭装" value="家庭装" />
              <el-option label="气泡水" value="气泡水" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="商品状态">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 100%">
              <el-option label="上架" value="on" />
              <el-option label="下架" value="off" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="价格区间">
            <el-input
              v-model="searchForm.priceRange"
              placeholder="例如：10-50"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="库存区间">
            <el-input
              v-model="searchForm.stockRange"
              placeholder="例如：0-100"
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
              @click="fetchProductList"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 商品表格 -->
      <el-table
        ref="productTable"
        v-loading="loading"
        :data="productList"
        row-key="id"
        border
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        style="width: 100%"
      >
        <!-- 多选列 -->
        <el-table-column type="selection" width="55" fixed="left" />
        
        <!-- 商品图片 -->
        <el-table-column
          label="商品图片"
          width="100"
          align="center"
          v-if="visibleColumns.includes('image')"
        >
          <template #default="scope">
            <el-image
              :src="scope.row.image"
              :preview-src-list="[scope.row.image]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
            />
          </template>
        </el-table-column>
        
        <!-- 商品名称 -->
        <el-table-column
          prop="name"
          label="商品名称"
          min-width="180"
          sortable="custom"
          v-if="visibleColumns.includes('name')"
        >
          <template #default="scope">
            <el-tooltip :content="scope.row.name" placement="top" :disabled="!scope.row.name || scope.row.name.length <= 20">
              <span class="product-name">{{ scope.row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <!-- 商品标签 -->
        <el-table-column
          prop="tag"
          label="商品标签"
          min-width="150"
          align="center"
          v-if="visibleColumns.includes('tag')"
        >
          <template #default="scope">
            <div class="tag-container" v-if="scope.row.tag">
              <template v-if="Array.isArray(scope.row.tag)">
                <el-tag 
                  v-for="tag in scope.row.tag" 
                  :key="tag"
                  size="small"
                  type="info"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </template>
              <template v-else>
                <el-tag 
                  size="small"
                  type="info"
                  class="tag-item"
                >
                  {{ scope.row.tag }}
                </el-tag>
              </template>
            </div>
            <span v-else class="no-tag">暂无标签</span>
          </template>
        </el-table-column>
        
        <!-- 价格 -->
        <el-table-column
          prop="price"
          label="价格"
          width="120"
          align="center"
          sortable="custom"
          v-if="visibleColumns.includes('price')"
        >
          <template #default="scope">
            <span class="price-text">¥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <!-- 分类 -->
        <el-table-column
          prop="category"
          label="分类"
          width="120"
          align="center"
          v-if="visibleColumns.includes('category')"
        >
          <template #default="scope">
            <el-tag :type="getCategoryType(scope.row.category)" size="small">
              {{ getCategoryName(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 库存 -->
        <el-table-column
          prop="stock"
          label="库存"
          width="100"
          align="center"
          sortable="custom"
          v-if="visibleColumns.includes('stock')"
        >
          <template #default="scope">
            <span :class="{ 'low-stock': scope.row.stock < 10 }">
              {{ scope.row.stock }}
            </span>
          </template>
        </el-table-column>
        
        <!-- 销量 -->
        <el-table-column
          prop="sales"
          label="销量"
          width="100"
          align="center"
          sortable="custom"
          v-if="visibleColumns.includes('sales')"
        >
          <template #default="scope">
            {{ scope.row.sales || 0 }}
          </template>
        </el-table-column>
        
        <!-- 评分 -->
        <el-table-column
          prop="rating"
          label="评分"
          width="140"
          align="center"
          v-if="visibleColumns.includes('rating')"
        >
          <template #default="scope">
            <div class="rating-display">
              <el-rate
                v-model="scope.row.rating"
                disabled
                size="small"
                show-score
                text-color="#ff9900"
              />
              <span class="rating-count">({{ scope.row.ratingsCount || 0 }})</span>
            </div>
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column
          prop="status"
          width="100"
          align="center"
          v-if="visibleColumns.includes('status')"
        >
          <template #header>
            <el-tooltip
              content="开启：商品已上架，用户可购买；关闭：商品已下架，用户无法购买"
              placement="top"
            >
              <span>状态 <el-icon style="font-size: 12px;"><QuestionFilled /></el-icon></span>
            </el-tooltip>
          </template>
          <template #default="scope">
            <el-tooltip
              :content="scope.row.status === 'on' ? '商品已上架，用户可购买' : '商品已下架，用户无法购买'"
              placement="top"
            >
              <el-switch
                v-model="scope.row.status"
                :active-value="'on'"
                :inactive-value="'off'"
                @change="(val) => handleStatusChange(scope.row, val)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        
        <!-- 创建时间 -->
        <el-table-column
          prop="createdAt"
          label="创建时间"
          min-width="160"
          sortable="custom"
          v-if="visibleColumns.includes('createdAt')"
        >
          <template #default="scope">
            <el-tooltip :content="scope.row.createdAt" placement="top">
              <span class="date-text">{{ scope.row.createdAt }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <el-table-column
          label="操作"
          width="200"
          fixed="right"
          align="center"
        >
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
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
            <el-checkbox :label="column.key">
              {{ column.label }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
    </el-drawer>

    <!-- 商品详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="商品详情"
      direction="rtl"
      size="600px"
    >
      <div v-if="selectedProductData" class="product-detail">
        <!-- 商品基本信息 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          
          <div class="product-info">
            <div class="product-image">
              <el-image
                :src="selectedProductData.image"
                fit="cover"
                style="width: 120px; height: 120px; border-radius: 8px;"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            
            <div class="product-basic">
              <div class="info-row">
                <label>商品名称：</label>
                <span>{{ selectedProductData.name }}</span>
              </div>
              <div class="info-row">
                <label>商品描述：</label>
                <span>{{ selectedProductData.description || '暂无描述' }}</span>
              </div>
              <div class="info-row">
                <label>商品分类：</label>
                <el-tag :type="getCategoryType(selectedProductData.category)">
                  {{ getCategoryName(selectedProductData.category) }}
                </el-tag>
              </div>
              <div class="info-row">
                <label>商品标签：</label>
                <div v-if="selectedProductData.tag" class="tag-container">
                  <template v-if="Array.isArray(selectedProductData.tag)">
                    <el-tag 
                      v-for="tag in selectedProductData.tag" 
                      :key="tag"
                      size="small"
                      type="info"
                      class="tag-item"
                    >
                      {{ tag }}
                    </el-tag>
                  </template>
                  <template v-else>
                    <el-tag 
                      size="small"
                      type="info"
                      class="tag-item"
                    >
                      {{ selectedProductData.tag }}
                    </el-tag>
                  </template>
                </div>
                <span v-else class="no-tag">暂无标签</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 价格和库存信息 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>价格与库存</span>
            </div>
          </template>
          
          <div class="price-stock-info">
            <div class="info-row">
              <label>商品价格：</label>
              <span class="price">¥{{ selectedProductData.price }}</span>
            </div>
            <div class="info-row">
              <label>库存数量：</label>
              <span :class="{ 'low-stock': selectedProductData.stock < 10 }">
                {{ selectedProductData.stock }} 件
              </span>
            </div>
            <div class="info-row">
              <label>销售数量：</label>
              <span>{{ selectedProductData.sales || 0 }} 件</span>
            </div>
            <div class="info-row">
              <label>商品评分：</label>
              <el-rate 
                v-model="selectedProductData.rating" 
                disabled 
                show-score 
                text-color="#ff9900"
                score-template="{value} 分"
              />
              <span class="rating-count">({{ selectedProductData.ratingsCount || 0 }}人评价)</span>
            </div>
          </div>
        </el-card>

        <!-- 状态和时间信息 -->
        <el-card shadow="never" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>状态信息</span>
            </div>
          </template>
          
          <div class="status-info">
            <div class="info-row">
              <label>商品状态：</label>
              <el-tag :type="selectedProductData.status === 'on' ? 'success' : 'danger'">
                {{ selectedProductData.status === 'on' ? '上架' : '下架' }}
              </el-tag>
            </div>
            <div class="info-row">
              <label>创建时间：</label>
              <span>{{ selectedProductData.createdAt }}</span>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button type="primary" @click="handleEdit(selectedProductData)">
            编辑商品
          </el-button>
          <el-button 
            :type="selectedProductData.status === 'on' ? 'warning' : 'success'"
            @click="handleStatusChange(selectedProductData, selectedProductData.status === 'on' ? 'off' : 'on')"
          >
            {{ selectedProductData.status === 'on' ? '下架商品' : '上架商品' }}
          </el-button>
          <el-button type="danger" @click="handleDelete(selectedProductData)">
            删除商品
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 批量导入抽屉 -->
    <el-drawer
      v-model="batchImportVisible"
      title="批量导入商品"
      direction="rtl"
      size="600px"
    >
      <ProductBatchImport @importSuccess="handleBatchImportSuccess" @importError="handleBatchImportError" />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { 
  Search, Filter, RefreshLeft, Setting, Refresh, Download, Delete, Plus, Picture, QuestionFilled, Upload
} from '@element-plus/icons-vue'
import { getProducts, deleteProduct, updateProduct } from '@/api/product'
import ProductBatchImport from './ProductBatchImport.vue'

const router = useRouter()
const loading = ref(false)
const productList = ref([])
const selectedProducts = ref([])
const total = ref(0)
const columnSettingVisible = ref(false)
const productTable = ref(null)
const advancedFilterVisible = ref(false)
const detailDrawerVisible = ref(false)
const selectedProductId = ref('')
const selectedProductData = ref(null)
const batchImportVisible = ref(false)

// 计算是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return searchForm.category !== '' ||
         searchForm.status !== '' ||
         searchForm.priceRange !== '' ||
         searchForm.stockRange !== ''
})

// 计算活跃筛选条件数量
const activeFilterCount = computed(() => {
  let count = 0
  if (searchForm.category) count++
  if (searchForm.status !== '') count++
  if (searchForm.priceRange) count++
  if (searchForm.stockRange) count++
  return count
})

// 搜索表单
const searchForm = reactive({
  search: '',
  category: '',
  status: '',
  priceRange: '',
  stockRange: ''
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
  { key: 'image', label: '商品图片' },
  { key: 'name', label: '商品名称' },
  { key: 'tag', label: '商品标签' },
  { key: 'price', label: '价格' },
  { key: 'category', label: '分类' },
  { key: 'stock', label: '库存' },
  { key: 'sales', label: '销量' },
  { key: 'rating', label: '评分' },
  { key: 'status', label: '状态' },
  { key: 'createdAt', label: '创建时间' }
]

// 默认显示的列
const visibleColumns = ref([
  'image', 'name', 'tag', 'price', 'category', 
  'stock', 'sales', 'status', 'createdAt'
])

// 获取商品列表
const fetchProductList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.limit,
      keyword: searchForm.search,
      category: searchForm.category,
      status: searchForm.status,
      sortBy: sortInfo.sortBy,
      sortOrder: sortInfo.sortOrder
    }
    
    // 添加价格区间
    if (searchForm.priceRange) {
      params.priceRange = searchForm.priceRange
    }
    
    // 添加库存区间
    if (searchForm.stockRange) {
      params.stockRange = searchForm.stockRange
    }
    
    console.log('请求参数:', params)
    
    const response = await getProducts(params)
    console.log('API返回数据:', response)
    
    if (response.success) {
      const data = response.data
      
      // 处理商品数据 - 统一处理逻辑
      const products = data.products || []
      productList.value = products.map(product => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.imageUrl || '/assets/images/products/default.png',
        category: product.category,
        stock: product.stock,
        sales: product.sales,
        tag: product.tag,
        status: product.isActive ? 'on' : 'off',
        createdAt: new Date(product.createdAt).toLocaleString('zh-CN'),
        isActive: product.isActive,
        rating: product.rating || 0,
        ratingsCount: product.ratingsCount || 0
      }))
      
      // 设置总数
      total.value = data.total || 0
      
      console.log('处理后的商品列表:', productList.value)
    } else {
      throw new Error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取商品列表失败', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchProductList()
}

// 多选变化
const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

// 排序变化
const handleSortChange = ({ prop, order }) => {
  sortInfo.sortBy = prop
  sortInfo.sortOrder = order === 'ascending' ? 'asc' : 'desc'
  fetchProductList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  fetchProductList()
}

// 当前页变化
const handleCurrentChange = (page) => {
  pagination.page = page
  fetchProductList()
}

// 获取类别名称
const getCategoryName = (category) => {
  const categoryMap = {
    'pure': '纯净水',
    'mineral': '矿泉水',
    'soda': '气泡水',
    '纯净水': '纯净水',
    '矿泉水': '矿泉水',
    '家庭装': '家庭装',
    '气泡水': '气泡水'
  }
  return categoryMap[category] || category || '未知'
}

// 获取类别类型
const getCategoryType = (category) => {
  const typeMap = {
    'pure': 'primary',
    'mineral': 'success',
    'soda': 'warning',
    '纯净水': 'primary',
    '矿泉水': 'success',
    '家庭装': 'info',
    '气泡水': 'warning'
  }
  return typeMap[category] || ''
}

// 添加商品
const handleAdd = () => {
  router.push('/products/add')
}

// 批量导入商品
const handleBatchImport = () => {
  batchImportVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
  router.push(`/products/edit/${row.id}`)
}

// 查看商品
const handleView = (row) => {
  selectedProductId.value = row.id
  selectedProductData.value = row
  detailDrawerVisible.value = true
}

// 删除商品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品 "${row.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    const response = await deleteProduct(row.id)
    if (response.success) {
      ElMessage.success('删除成功')
      fetchProductList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请选择要删除的商品')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedProducts.value.length} 个商品吗？此操作不可恢复。`,
      '确认批量删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    const deletePromises = selectedProducts.value.map(item => deleteProduct(item.id))
    await Promise.all(deletePromises)
    
    ElMessage.success('批量删除成功')
    selectedProducts.value = []
    fetchProductList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除商品失败:', error)
      ElMessage.error('批量删除商品失败')
    }
  }
}

// 批量导出
const handleBatchExport = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请选择要导出的商品')
    return
  }
  
  // 构建CSV内容
  const headers = ['商品ID', '商品名称', '价格', '分类', '库存', '销量', '状态', '创建时间']
  const csvContent = [
    headers.join(','),
    ...selectedProducts.value.map(product => [
      product.id,
      product.name,
      product.price,
      getCategoryName(product.category),
      product.stock,
      product.sales || 0,
      product.status === 'on' ? '上架' : '下架',
      product.createdAt
    ].join(','))
  ].join('\n')
  
  // 下载CSV文件
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `商品数据_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  
  ElMessage.success(`已导出 ${selectedProducts.value.length} 个商品数据`)
}

// 更新商品状态
const handleStatusChange = async (row, value) => {
  try {
    await updateProduct(row.id, { status: value })
    ElMessage.success(`商品已${value === 'on' ? '上架' : '下架'}`)
  } catch (error) {
    console.error('更新商品状态失败', error)
    ElMessage.error('更新商品状态失败')
    row.status = row.status === 'on' ? 'off' : 'on'
  }
}

// 重置列设置
const handleResetColumns = () => {
  visibleColumns.value = [
    'image', 'name', 'tag', 'price', 'category', 
    'stock', 'sales', 'status', 'createdAt'
  ]
}

// 重新布局表格
const recalculateTableLayout = () => {
  nextTick(() => {
    if (productTable.value) {
      productTable.value.doLayout()
      setTimeout(() => {
        if (productTable.value) {
          productTable.value.doLayout()
        }
      }, 100)
    }
  })
}

// 应用高级筛选
const applyAdvancedFilter = () => {
  pagination.page = 1
  fetchProductList()
  advancedFilterVisible.value = false
  ElMessage.success('筛选条件已应用')
}

// 重置高级筛选
const resetAdvancedFilter = () => {
  Object.assign(searchForm, {
    category: '',
    status: '',
    priceRange: '',
    stockRange: ''
  })
  ElMessage.success('筛选条件已重置')
}

// 清空所有筛选条件
const clearAllFilters = () => {
  Object.assign(searchForm, {
    search: '',
    category: '',
    status: '',
    priceRange: '',
    stockRange: ''
  })
  pagination.page = 1
  fetchProductList()
  ElMessage.success('所有筛选条件已清空')
}

// 高级筛选抽屉关闭事件
const onAdvancedFilterClose = () => {
  // 抽屉关闭时不需要特殊处理
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

// 监听可见列变化
watch(
  visibleColumns,
  () => {
    recalculateTableLayout()
  },
  { deep: true }
)

// 监听列设置抽屉关闭
watch(
  columnSettingVisible,
  (newVal) => {
    if (!newVal) {
      recalculateTableLayout()
    }
  }
)

// 初始化
onMounted(() => {
  fetchProductList()
  
  // 添加窗口大小变化监听器
  const handleResize = () => {
    recalculateTableLayout()
  }
  
  window.addEventListener('resize', handleResize)
  
  nextTick(() => {
    recalculateTableLayout()
  })
  
  window.productTableResizeHandler = handleResize
})

// 组件卸载时清理
onUnmounted(() => {
  if (window.productTableResizeHandler) {
    window.removeEventListener('resize', window.productTableResizeHandler)
    delete window.productTableResizeHandler
  }
  
  if (window.searchTimeout) {
    clearTimeout(window.searchTimeout)
    delete window.searchTimeout
  }
})

// 批量导入成功事件
const handleBatchImportSuccess = () => {
  fetchProductList()
  ElMessage.success('批量导入完成，商品列表已刷新')
}

// 批量导入错误事件
const handleBatchImportError = (error) => {
  ElMessage.error(`批量导入失败: ${error.message || '未知错误'}`)
}
</script>

<style scoped>
.product-list-container {
  padding: 0;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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
  width: 100%;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-card__body) {
  padding: 10px;
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

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.product-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #303133;
}

.price-text {
  color: #E6A23C;
  font-weight: 500;
  font-size: 14px;
}

.low-stock {
  color: #F56C6C;
  font-weight: 500;
}

.rating-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.rating-count {
  font-size: 11px;
  color: #909399;
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

/* 表格样式优化 */
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

/* 标签容器样式 */
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  align-items: center;
  min-height: 24px;
}

.tag-item {
  margin: 0;
  font-size: 12px;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-tag {
  color: #c0c4cc;
  font-size: 12px;
  font-style: italic;
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

/* 表格操作列按钮样式 */
:deep(.el-table .el-button) {
  border: none;
  background: transparent;
}

:deep(.el-table .el-button:focus) {
  outline: none;
  box-shadow: none;
  border: none;
}

/* 表格文本溢出样式 */
.product-name-text,
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
}

/* 商品详情抽屉样式 */
.product-detail {
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
  font-weight: 500;
  color: #303133;
}

.product-info {
  display: flex;
  gap: 20px;
}

.product-image {
  flex-shrink: 0;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.product-basic {
  flex: 1;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  min-height: 24px;
}

.info-row label {
  width: 80px;
  color: #606266;
  font-weight: 500;
  flex-shrink: 0;
}

.info-row span {
  color: #303133;
  word-break: break-all;
}

.price {
  color: #E6A23C;
  font-weight: 600;
  font-size: 16px;
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
</style> 