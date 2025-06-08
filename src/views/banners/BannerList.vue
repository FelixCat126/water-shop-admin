<template>
  <div class="banner-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>轮播图管理</h2>
      <p>管理首页轮播图，支持产品推广、类别导航、文章推荐和外部链接</p>
    </div>

    <!-- 搜索和工具栏 -->
    <el-card shadow="never" class="search-card">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索标题或描述"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <!-- 类型筛选 -->
          <el-select
            v-model="searchForm.type"
            placeholder="内容类型"
            clearable
            @change="handleSearch"
            class="filter-select"
          >
            <el-option label="产品" value="product" />
            <el-option label="产品类别" value="category" />
            <el-option label="文章" value="article" />
            <el-option label="外部链接" value="external" />
          </el-select>
          
          <!-- 状态筛选 -->
          <el-select
            v-model="searchForm.status"
            placeholder="状态"
            clearable
            @change="handleSearch"
            class="filter-select"
          >
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增轮播图
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 轮播图列表 -->
    <el-card shadow="never" class="content-card">
      <div class="banner-grid" v-loading="loading">
        <div
          v-for="banner in bannerList"
          :key="banner._id"
          class="banner-card"
          :class="{ 'inactive': !banner.isActive }"
        >
          <!-- 轮播图预览 -->
          <div class="banner-preview">
            <img :src="banner.image" :alt="banner.title" />
            <div class="banner-overlay">
              <div class="banner-actions">
                <el-button size="small" @click="handleEdit(banner)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button 
                  size="small" 
                  :type="banner.isActive ? 'warning' : 'success'"
                  @click="handleToggleStatus(banner)"
                >
                  <el-icon><Switch /></el-icon>
                  {{ banner.isActive ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(banner)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 轮播图信息 -->
          <div class="banner-info">
            <h4>{{ banner.title }}</h4>
            <p class="banner-desc">{{ banner.description || '暂无描述' }}</p>
            
            <div class="banner-meta">
              <el-tag :type="getTypeColor(banner.type)" size="small">
                {{ getTypeName(banner.type) }}
              </el-tag>
              <el-tag 
                :type="banner.isActive ? 'success' : 'danger'" 
                size="small"
              >
                {{ banner.isActive ? '启用' : '禁用' }}
              </el-tag>
            </div>
            
            <div class="banner-stats">
              <span>排序: {{ banner.sort }}</span>
              <span>浏览: {{ banner.viewCount || 0 }}</span>
              <span>点击: {{ banner.clickCount || 0 }}</span>
            </div>
            
            <!-- 目标信息 -->
            <div class="banner-target">
              <small>{{ getTargetInfo(banner) }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 48]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑轮播图' : '新增轮播图'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="bannerFormRef"
        :model="bannerForm"
        :rules="bannerRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="bannerForm.title" placeholder="请输入轮播图标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内容类型" prop="type">
              <el-select v-model="bannerForm.type" @change="handleTypeChange">
                <el-option label="产品推广" value="product" />
                <el-option label="产品类别" value="category" />
                <el-option label="文章推荐" value="article" />
                <el-option label="外部链接" value="external" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述">
          <el-input
            v-model="bannerForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入轮播图描述"
          />
        </el-form-item>

        <el-form-item label="轮播图片" prop="image">
          <el-upload
            class="banner-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeImageUpload"
            name="image"
          >
            <img v-if="bannerForm.image" :src="bannerForm.image" class="banner-image" />
            <el-icon v-else class="banner-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：750x300px，支持jpg、png格式，大小不超过2MB</div>
        </el-form-item>

        <!-- 目标配置 -->
        <!-- 产品选择 -->
        <el-form-item 
          v-if="bannerForm.type === 'product'" 
          label="选择产品" 
          prop="targetProduct"
        >
          <el-select
            v-model="bannerForm.targetProduct"
            placeholder="请选择产品或输入关键词搜索"
            filterable
            remote
            :remote-method="searchProducts"
            :loading="productLoading"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="product in productOptions"
              :key="product._id"
              :label="`${product.name} - ¥${product.price}`"
              :value="product._id"
            >
              <div style="display: flex; align-items: center;">
                <img :src="product.imageUrl" style="width: 30px; height: 30px; margin-right: 10px; border-radius: 4px;" />
                <div>
                  <div>{{ product.name }}</div>
                  <div style="font-size: 12px; color: #999;">¥{{ product.price }} | {{ getCategoryName(product.category) }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
          <div class="form-tip">提示：可以输入产品名称进行搜索</div>
        </el-form-item>

        <!-- 产品类别选择 -->
        <el-form-item 
          v-if="bannerForm.type === 'category'" 
          label="选择类别" 
          prop="targetCategory"
        >
          <el-select
            v-model="bannerForm.targetCategory"
            placeholder="请选择产品类别"
            style="width: 100%"
          >
            <el-option
              v-for="category in categoryOptions"
              :key="typeof category === 'object' ? category.value : category"
              :label="typeof category === 'object' ? category.label : getCategoryName(category)"
              :value="typeof category === 'object' ? category.value : category"
            />
          </el-select>
        </el-form-item>

        <!-- 文章选择 -->
        <el-form-item 
          v-if="bannerForm.type === 'article'" 
          label="选择文章" 
          prop="targetArticle"
        >
          <el-select
            v-model="bannerForm.targetArticle"
            placeholder="请选择文章或输入关键词搜索"
            filterable
            remote
            :remote-method="searchArticles"
            :loading="articleLoading"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="article in articleOptions"
              :key="article._id"
              :label="article.title"
              :value="article._id"
            >
              <div style="display: flex; align-items: center;">
                <img :src="article.imageUrl" style="width: 30px; height: 30px; margin-right: 10px; border-radius: 4px;" />
                <div>
                  <div>{{ article.title }}</div>
                  <div style="font-size: 12px; color: #999;">{{ article.summary }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
          <div class="form-tip">提示：可以输入文章标题进行搜索</div>
        </el-form-item>

        <!-- 外部链接 -->
        <el-form-item 
          v-if="bannerForm.type === 'external'" 
          label="链接地址" 
          prop="targetUrl"
        >
          <el-input
            v-model="bannerForm.targetUrl"
            placeholder="请输入完整的链接地址，如：https://www.example.com"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序值">
              <el-input-number
                v-model="bannerForm.sort"
                :min="0"
                :max="999"
                placeholder="数值越大排序越靠前"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-switch
                v-model="bannerForm.isActive"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Switch, Search, Refresh } from '@element-plus/icons-vue'
import { bannerApi } from '@/api/banner'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const bannerFormRef = ref()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 12,
  total: 0
})

// 轮播图列表
const bannerList = ref([])

// 轮播图表单
const bannerForm = reactive({
  title: '',
  description: '',
  image: '',
  type: 'product',
  targetProduct: '',
  targetCategory: '',
  targetArticle: '',
  targetUrl: '',
  sort: 0,
  isActive: true
})

// 表单验证规则
const bannerRules = {
  title: [
    { required: true, message: '请输入轮播图标题', trigger: 'blur' },
    { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传轮播图片', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择内容类型', trigger: 'change' }
  ],
  targetProduct: [
    { required: true, message: '请选择产品', trigger: 'change' }
  ],
  targetCategory: [
    { required: true, message: '请选择产品类别', trigger: 'change' }
  ],
  targetArticle: [
    { required: true, message: '请选择文章', trigger: 'change' }
  ],
  targetUrl: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    { type: 'url', message: '请输入正确的链接地址', trigger: 'blur' }
  ]
}

// 选项数据
const productOptions = ref([])
const articleOptions = ref([])
const categoryOptions = ref([])
const productLoading = ref(false)
const articleLoading = ref(false)

// 上传配置
const uploadUrl = computed(() => {
  try {
    const { getUploadUrl } = require('../../config/index');
    return getUploadUrl('/upload/banner');
  } catch (error) {
    ElMessage.error('API配置失效：无法获取上传地址，请检查数据源配置');
    return '';
  }
})
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}))

// 修复图片URL
const fixImageUrl = (url) => {
  try {
    const { fixImageUrl: configFixImageUrl } = require('../../config/index');
    return configFixImageUrl(url);
  } catch (error) {
    console.error('修复图片URL失败:', error.message);
    ElMessage.warning('API配置失效：无法处理图片URL，请检查数据源配置');
    return url || '';
  }
}

// 获取轮播图列表
const getBannerList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    const response = await bannerApi.getBanners(params)
    if (response.success) {
      // 修复图片URL
      bannerList.value = response.data.banners.map(banner => ({
        ...banner,
        image: fixImageUrl(banner.image)
      }));
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取轮播图列表失败:', error)
    ElMessage.error('获取轮播图列表失败')
  } finally {
    loading.value = false
  }
}

// 获取产品类别列表
const getCategoryList = async () => {
  try {
    const response = await bannerApi.getProductCategories()
    if (response.success) {
      // 将原始类别数据保存到categoryOptions，但确保在显示时转换为中文
      categoryOptions.value = response.data.map(category => ({
        label: getCategoryName(category),
        value: category
      }));
    }
  } catch (error) {
    console.error('获取产品类别失败:', error)
  }
}

// 类别英文到中文的映射
const categoryNameMap = {
  // 水类别
  'mineral_water': '矿泉水',
  'mineral': '矿泉水',
  'purified_water': '纯净水',
  'pure': '纯净水',
  'spring_water': '山泉水',
  'spring': '山泉水',
  'sparkling_water': '气泡水',
  'sparkling': '气泡水',
  'flavored_water': '风味水',
  'flavored': '风味水',
  'distilled_water': '蒸馏水',
  'distilled': '蒸馏水',
  'alkaline_water': '碱性水',
  'alkaline': '碱性水',
  'imported_water': '进口水',
  'soda': '苏打水',
  'soda_water': '苏打水',
  'carbonated_water': '碳酸水',
  'carbonated': '碳酸水',
  'bottled_water': '瓶装水',
  'bottled': '瓶装水',
  
  // 容量分类
  'small': '小瓶装',
  'medium': '中瓶装',
  'large': '大瓶装',
  'family_size': '家庭装',
  'mini': '迷你装',
  'single': '单瓶装',
  'multi_pack': '多瓶装',
  
  // 包装分类
  'glass': '玻璃瓶装',
  'plastic': '塑料瓶装',
  'can': '罐装',
  'box': '盒装',
  'bag': '袋装',
  
  // 功能性水
  'energy': '能量水',
  'sports': '运动水',
  'detox': '排毒水',
  'vitamin': '维生素水',
  'infant': '婴儿水',
  'premium': '高端水',
  'specialty': '特殊水',
  
  // 其他
  'hot': '热销',
  'new': '新品',
  'promotion': '促销',
  'limited': '限量',
  'discount': '特惠',
  'seasonal': '季节限定',
  'imported': '进口',
  'domestic': '国产',
  'other': '其他'
}

// 获取类别中文名称
const getCategoryName = (category) => {
  return categoryNameMap[category] || category
}

// 搜索产品
const searchProducts = async (keyword) => {
  try {
    productLoading.value = true
    const response = await bannerApi.searchProducts({ keyword: keyword || '', pageSize: 20 })
    if (response.success) {
      // 修复图片URL
      productOptions.value = response.data.products.map(product => ({
        ...product,
        imageUrl: fixImageUrl(product.imageUrl)
      }));
    }
  } catch (error) {
    console.error('搜索产品失败:', error)
    ElMessage.error('搜索产品失败')
  } finally {
    productLoading.value = false
  }
}

// 搜索文章
const searchArticles = async (keyword) => {
  try {
    articleLoading.value = true
    const response = await bannerApi.searchArticles({ keyword: keyword || '', pageSize: 20 })
    if (response.success) {
      // 修复图片URL
      articleOptions.value = response.data.articles.map(article => ({
        ...article,
        imageUrl: fixImageUrl(article.imageUrl)
      }));
    }
  } catch (error) {
    console.error('搜索文章失败:', error)
    ElMessage.error('搜索文章失败')
  } finally {
    articleLoading.value = false
  }
}

// 类型变化处理
const handleTypeChange = () => {
  // 清空目标字段
  bannerForm.targetProduct = ''
  bannerForm.targetCategory = ''
  bannerForm.targetArticle = ''
  bannerForm.targetUrl = ''
  
  // 根据类型加载对应数据
  if (bannerForm.type === 'category') {
    getCategoryList()
  }
}

// 获取类型名称
const getTypeName = (type) => {
  const typeMap = {
    product: '产品',
    category: '产品类别',
    article: '文章',
    external: '外部链接'
  }
  return typeMap[type] || type
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    product: 'primary',
    category: 'success',
    article: 'warning',
    external: 'info'
  }
  return colorMap[type] || 'default'
}

// 获取目标信息
const getTargetInfo = (banner) => {
  switch (banner.type) {
    case 'product':
      return banner.targetProduct ? `产品: ${banner.targetProduct.name}` : '未设置产品'
    case 'category':
      return banner.targetCategory ? `类别: ${getCategoryName(banner.targetCategory)}` : '未设置类别'
    case 'article':
      return banner.targetArticle ? `文章: ${banner.targetArticle.title}` : '未设置文章'
    case 'external':
      return banner.targetUrl ? `链接: ${banner.targetUrl}` : '未设置链接'
    default:
      return '未设置目标'
  }
}

// 图片上传成功
const handleImageSuccess = (response) => {
  if (response.success) {
    // 确保图片URL包含完整域名
    let imageUrl = response.data.url;
    if (imageUrl.startsWith('/')) {
      // 如果是相对路径，添加域名
      imageUrl = `http://localhost:5001${imageUrl}`;
    }
    bannerForm.image = imageUrl;
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error(response.message || '图片上传失败');
  }
}

// 图片上传错误
const handleUploadError = (error, file, fileList) => {
  console.error('上传错误:', error, file);
  if (error.status === 401) {
    ElMessage.error('权限不足，请重新登录');
  } else if (error.status === 404) {
    ElMessage.error('上传地址不正确，请联系管理员');
    console.error('上传URL:', uploadUrl.value);
  } else {
    ElMessage.error(`图片上传失败: ${error.message || '未知错误'}`);
  }
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 重置表单
const resetForm = () => {
  Object.assign(bannerForm, {
    title: '',
    description: '',
    image: '',
    type: 'product',
    targetProduct: '',
    targetCategory: '',
    targetArticle: '',
    targetUrl: '',
    sort: 0,
    isActive: true
  })
  productOptions.value = []
  articleOptions.value = []
}

// 新增轮播图
const handleAdd = async () => {
  resetForm()
  isEdit.value = false
  
  // 加载默认的产品和文章选项
  await loadDefaultOptions()
  
  dialogVisible.value = true
}

// 加载默认选项
const loadDefaultOptions = async () => {
  try {
    // 加载热门产品作为默认选项
    const productResponse = await bannerApi.searchProducts({ keyword: '', pageSize: 10 })
    if (productResponse.success) {
      productOptions.value = productResponse.data.products
    }
    
    // 加载最新文章作为默认选项
    const articleResponse = await bannerApi.searchArticles({ keyword: '', pageSize: 10 })
    if (articleResponse.success) {
      articleOptions.value = articleResponse.data.articles
    }
    
    // 加载产品类别
    await getCategoryList()
  } catch (error) {
    console.error('加载默认选项失败:', error)
  }
}

// 编辑轮播图
const handleEdit = async (banner) => {
  resetForm()
  isEdit.value = true
  
  // 加载默认选项
  await loadDefaultOptions()
  
  // 填充表单数据
  Object.assign(bannerForm, {
    id: banner._id,
    title: banner.title,
    description: banner.description || '',
    image: banner.image, // 图片URL已在列表获取时修复
    type: banner.type,
    sort: banner.sort,
    isActive: banner.isActive
  })
  
  // 根据类型设置目标字段
  switch (banner.type) {
    case 'product':
      bannerForm.targetProduct = banner.targetProduct?._id || ''
      if (banner.targetProduct) {
        // 确保当前选中的产品在选项中
        const existingProduct = productOptions.value.find(p => p._id === banner.targetProduct._id)
        if (!existingProduct) {
          productOptions.value.unshift(banner.targetProduct)
        }
      }
      break
    case 'category':
      bannerForm.targetCategory = banner.targetCategory || ''
      break
    case 'article':
      bannerForm.targetArticle = banner.targetArticle?._id || ''
      if (banner.targetArticle) {
        // 确保当前选中的文章在选项中
        const existingArticle = articleOptions.value.find(a => a._id === banner.targetArticle._id)
        if (!existingArticle) {
          articleOptions.value.unshift(banner.targetArticle)
        }
      }
      break
    case 'external':
      bannerForm.targetUrl = banner.targetUrl || ''
      break
  }
  
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    await bannerFormRef.value.validate()
    
    submitLoading.value = true
    
    const formData = {
      title: bannerForm.title,
      description: bannerForm.description,
      image: bannerForm.image,
      type: bannerForm.type,
      sort: bannerForm.sort,
      isActive: bannerForm.isActive
    }
    
    // 根据类型设置目标字段
    switch (bannerForm.type) {
      case 'product':
        formData.targetProduct = bannerForm.targetProduct
        break
      case 'category':
        formData.targetCategory = bannerForm.targetCategory
        break
      case 'article':
        formData.targetArticle = bannerForm.targetArticle
        break
      case 'external':
        formData.targetUrl = bannerForm.targetUrl
        break
    }
    
    let response
    if (isEdit.value) {
      response = await bannerApi.updateBanner(bannerForm.id, formData)
    } else {
      response = await bannerApi.createBanner(formData)
    }
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '轮播图更新成功' : '轮播图创建成功')
      dialogVisible.value = false
      getBannerList()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 切换状态
const handleToggleStatus = async (banner) => {
  try {
    const response = await bannerApi.toggleBannerStatus(banner._id, {
      isActive: !banner.isActive
    })
    
    if (response.success) {
      banner.isActive = !banner.isActive
      ElMessage.success(`轮播图已${banner.isActive ? '启用' : '禁用'}`)
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('切换状态失败:', error)
    ElMessage.error('操作失败')
  }
}

// 删除轮播图
const handleDelete = async (banner) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除轮播图"${banner.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await bannerApi.deleteBanner(banner._id)
    if (response.success) {
      ElMessage.success('轮播图删除成功')
      getBannerList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getBannerList()
}

// 刷新
const handleRefresh = () => {
  Object.assign(searchForm, {
    keyword: '',
    type: '',
    status: ''
  })
  pagination.page = 1
  getBannerList()
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  getBannerList()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  getBannerList()
}

// 初始化
onMounted(() => {
  getBannerList()
})
</script>

<style scoped>
.banner-list {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 搜索卡片样式 */
.search-card {
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.search-input {
  max-width: 300px;
}

.filter-select {
  width: 150px;
}

.search-button {
  margin-left: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

/* 内容卡片样式 */
.content-card {
  margin-bottom: 20px;
}

.banner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.banner-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.banner-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.banner-card.inactive {
  opacity: 0.6;
}

.banner-preview {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.banner-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.banner-card:hover .banner-overlay {
  opacity: 1;
}

.banner-actions {
  display: flex;
  gap: 8px;
}

.banner-info {
  padding: 16px;
}

.banner-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-desc {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.banner-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.banner-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.banner-target {
  font-size: 12px;
  color: #606266;
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 15px 0;
  background: #fff;
}

.banner-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.banner-uploader:hover {
  border-color: #409eff;
}

.banner-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.banner-image {
  width: 178px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

:deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

:deep(.el-upload:hover) {
  border-color: #409eff;
}

/* 描述输入框焦点样式 */
:deep(.el-textarea__inner:focus) {
  border-color: #409eff !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
}

/* 表单提示样式 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}
</style> 