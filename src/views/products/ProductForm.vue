<template>
  <div class="product-form-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑商品' : '添加商品' }}</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-row :gutter="20">
          <el-col :span="16">
            <!-- 基本信息 -->
            <div class="form-section">
              <div class="section-title">基本信息</div>
              
              <el-form-item label="商品名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入商品名称" />
              </el-form-item>
              
              <el-form-item label="商品分类" prop="category">
                <el-select v-model="form.category" placeholder="请选择商品分类" style="width: 100%">
                  <el-option label="纯净水" value="纯净水" />
                  <el-option label="矿泉水" value="矿泉水" />
                  <el-option label="家庭装" value="家庭装" />
                  <el-option label="气泡水" value="气泡水" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="商品标签" prop="tag">
                <el-select v-model="form.tag" placeholder="请选择商品标签" style="width: 100%" clearable>
                  <el-option label="热销" value="热销" />
                  <el-option label="新品" value="新品" />
                  <el-option label="推荐" value="推荐" />
                  <el-option label="特价" value="特价" />
                </el-select>
              </el-form-item>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="商品价格" prop="price">
                    <el-input-number
                      v-model="form.price"
                      :min="0"
                      :precision="2"
                      :step="0.1"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="商品库存" prop="stock">
                    <el-input-number
                      v-model="form.stock"
                      :min="0"
                      :precision="0"
                      :step="1"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="商品单位" prop="unit">
                <el-input v-model="form.unit" placeholder="如: 桶、台、个" />
              </el-form-item>
              
              <el-form-item label="商品状态" prop="status">
                <el-radio-group v-model="form.status">
                  <el-radio :label="'on'" value="on">上架</el-radio>
                  <el-radio :label="'off'" value="off">下架</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="商品排序" prop="sort">
                <el-input-number
                  v-model="form.sort"
                  :min="0"
                  :precision="0"
                  :step="1"
                  style="width: 100%"
                  placeholder="数值越小越靠前"
                />
              </el-form-item>
            </div>
            
            <!-- 商品描述 -->
            <div class="form-section">
              <div class="section-title">商品描述</div>
              
              <el-form-item label="简短描述" prop="brief">
                <el-input v-model="form.brief" placeholder="简短描述将显示在商品列表页" />
              </el-form-item>
              
              <el-form-item label="详细描述" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  rows="6"
                  placeholder="请输入商品详细描述"
                />
              </el-form-item>
            </div>
            
            <!-- 配送信息 -->
            <div class="form-section">
              <div class="section-title">配送信息</div>
              
              <el-form-item label="是否免邮" prop="freeShipping">
                <el-switch v-model="form.freeShipping" />
              </el-form-item>
              
              <el-form-item v-if="!form.freeShipping" label="配送费用" prop="shippingFee">
                <el-input-number
                  v-model="form.shippingFee"
                  :min="0"
                  :precision="2"
                  :step="0.1"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
          </el-col>
          
          <el-col :span="8">
            <!-- 商品图片 -->
            <div class="form-section">
              <div class="section-title">商品图片</div>
              
              <el-form-item label="主图" prop="image">
                <el-upload
                  class="avatar-uploader"
                  action="/api/admin/upload/product"
                  :show-file-list="false"
                  :on-success="handleMainImageSuccess"
                  :before-upload="beforeImageUpload"
                  :headers="{ Authorization: `Bearer ${localStorage.getItem('token')}` }"
                >
                  <img v-if="form.image" :src="form.image" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">主图将显示在商品列表和详情页顶部</div>
              </el-form-item>
              
              <el-form-item label="图片集" prop="imageGallery">
                <el-upload
                  class="gallery-uploader"
                  action="/api/admin/upload/product-gallery"
                  list-type="picture-card"
                  :on-success="handleGallerySuccess"
                  :on-remove="handleGalleryRemove"
                  :before-upload="beforeImageUpload"
                  :headers="{ Authorization: `Bearer ${localStorage.getItem('token')}` }"
                  :file-list="form.imageGallery.map(img => ({
                    name: img.name || '图片',
                    url: img.url || img
                  }))"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">最多上传5张图片，用于商品详情页展示</div>
              </el-form-item>
            </div>
            
            <!-- 规格参数 -->
            <div class="form-section">
              <div class="section-title">规格参数</div>
              
              <div v-for="(param, index) in form.params" :key="index" class="param-item">
                <el-input v-model="param.key" placeholder="参数名称" class="param-key" />
                <el-input v-model="param.value" placeholder="参数值" class="param-value" />
                <el-button type="danger" icon="Delete" circle @click="removeParam(index)" />
              </div>
              
              <el-button type="primary" plain @click="addParam">
                <el-icon><Plus /></el-icon>添加参数
              </el-button>
            </div>
          </el-col>
        </el-row>
        
        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="loading">保存</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProduct, createProduct, updateProduct, uploadProductImage } from '@/api/product'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

// 判断是编辑还是新增
const isEdit = computed(() => {
  return !!route.params.id
})

// 表单数据
const form = reactive({
  name: '',
  category: '',
  tag: '',
  price: 0,
  stock: 0,
  unit: '个',
  status: 'on',
  sort: 0,
  brief: '',
  description: '',
  freeShipping: true,
  shippingFee: 0,
  image: '',
  imageGallery: [],
  params: []
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入商品库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存必须大于等于0', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请输入商品单位', trigger: 'blur' }
  ]
}

// 获取商品详情
const fetchProductDetail = async (id) => {
  try {
    loading.value = true
    const response = await getProduct(id)
    const productData = response.data.data
    
    // 填充表单数据
    Object.keys(form).forEach(key => {
      if (productData[key] !== undefined) {
        form[key] = productData[key]
      }
    })
    
    // 处理图片集（确保格式一致）
    if (productData.imageGallery && Array.isArray(productData.imageGallery)) {
      form.imageGallery = productData.imageGallery
    }
    
    loading.value = false
  } catch (error) {
    console.error('获取商品详情失败', error)
    ElMessage.error('获取商品详情失败')
    loading.value = false
    router.push('/products')
  }
}

// 添加规格参数
const addParam = () => {
  form.params.push({ key: '', value: '' })
}

// 删除规格参数
const removeParam = (index) => {
  form.params.splice(index, 1)
  if (form.params.length === 0) {
    addParam() // 确保至少有一个参数行
  }
}

// 上传主图成功回调
const handleMainImageSuccess = (response) => {
  if (response.success) {
    form.image = response.data.url
    ElMessage.success('主图上传成功')
  } else {
    ElMessage.error('上传失败: ' + response.message)
  }
}

// 上传图片集成功回调
const handleGallerySuccess = (response) => {
  if (response.success) {
    form.imageGallery.push({
      url: response.data.url,
      name: response.data.filename
    })
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('上传失败: ' + response.message)
  }
}

// 移除图片集中的图片
const handleGalleryRemove = (file) => {
  const index = form.imageGallery.findIndex(img => img.url === file.url)
  if (index !== -1) {
    form.imageGallery.splice(index, 1)
  }
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传JPG/PNG/GIF/WebP格式的图片!')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  
  return true
}

// 提交表单
const submitForm = async () => {
  if (!form.name || !form.category || form.price === null) {
    ElMessage.warning('请填写必要的商品信息')
    return
  }
  
  try {
    loading.value = true
    
    // 数据准备
    const productData = { ...form }
    
    // 创建或更新商品
    if (isEdit.value) {
      await updateProduct(route.params.id, productData)
      ElMessage.success('商品更新成功')
    } else {
      await createProduct(productData)
      ElMessage.success('商品添加成功')
    }
    
    loading.value = false
    router.push('/products')
  } catch (error) {
    console.error('保存商品失败', error)
    ElMessage.error('保存失败: ' + (error.response?.data?.message || '未知错误'))
    loading.value = false
  }
}

// 返回
const goBack = () => {
  router.push('/products')
}

// 初始化
onMounted(() => {
  // 编辑模式下获取详情
  if (isEdit.value) {
    fetchProductDetail(route.params.id)
  } else {
    // 新增模式，添加一个空的参数行
    addParam()
  }
})
</script>

<style scoped>
.product-form-container {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dcdfe6;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader .avatar {
  width: 200px;
  height: 200px;
  display: block;
  object-fit: cover;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 200px;
  text-align: center;
  line-height: 200px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
  text-align: center;
}

.param-item {
  display: flex;
  margin-bottom: 8px;
  align-items: center;
}

.param-key {
  width: 40%;
  margin-right: 8px;
}

.param-value {
  flex: 1;
  margin-right: 8px;
}
</style> 