<template>
  <div class="content-list-container">
    <!-- 搜索和筛选 -->
    <el-card shadow="never" class="search-card">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索内容标题、摘要"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="filter-actions">
          <el-button @click="handleRefresh" :loading="loading" class="search-button">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button 
            @click="advancedFilterVisible = true"
            :class="{ 'has-filters': hasActiveFilters }"
          >
            <el-icon><Filter /></el-icon>
            高级筛选
            <el-badge v-if="activeFilterCount > 0" :value="activeFilterCount" class="filter-badge" />
          </el-button>
          <el-button 
            v-if="hasActiveFilters" 
            @click="clearAllFilters"
          >
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增内容
          </el-button>
          <el-button 
            type="danger" 
            :disabled="selectedContents.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除 ({{ selectedContents.length }})
          </el-button>
        </div>
      </div>
      
      <!-- 当前筛选条件显示 -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="filter-label">当前筛选：</span>
        <el-tag 
          v-if="searchForm.category" 
          closable 
          @close="searchForm.category = ''; pagination.page = 1; getContentList()"
          class="filter-tag"
        >
          分类: {{ getCategoryName(searchForm.category) }}
        </el-tag>
        <el-tag 
          v-if="searchForm.type" 
          closable 
          @close="searchForm.type = ''; pagination.page = 1; getContentList()"
          class="filter-tag"
        >
          类型: {{ searchForm.type === 'article' ? '文章' : '视频' }}
        </el-tag>
        <el-tag 
          v-if="searchForm.status" 
          closable 
          @close="searchForm.status = ''; pagination.page = 1; getContentList()"
          class="filter-tag"
        >
          状态: {{ searchForm.status === 'published' ? '已发布' : '未发布' }}
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
        <div class="filter-tip">
          <el-alert
            title="筛选条件会实时生效，无需手动应用"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
        <el-form :model="searchForm" label-width="100px" class="filter-form">
          <el-form-item label="内容分类">
            <el-select v-model="searchForm.category" placeholder="选择分类" clearable style="width: 100%">
              <el-option label="健康知识" value="health" />
              <el-option label="科学饮水" value="science" />
              <el-option label="生活小贴士" value="tips" />
              <el-option label="新闻资讯" value="news" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="内容类型">
            <el-select v-model="searchForm.type" placeholder="选择类型" clearable style="width: 100%">
              <el-option label="文章" value="article" />
              <el-option label="视频" value="video" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="发布状态">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 100%">
              <el-option label="已发布" value="published" />
              <el-option label="未发布" value="unpublished" />
            </el-select>
          </el-form-item>
        </el-form>
        
        <div class="filter-actions-bottom">
          <el-button @click="resetAdvancedFilter">
            <el-icon><Refresh /></el-icon>
            重置筛选
          </el-button>
          <el-button @click="advancedFilterVisible = false">
            关闭
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 表格工具栏和表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <span class="total-info">共 {{ pagination.total }} 条记录</span>
        </div>
        <div class="toolbar-right">
          <el-tooltip content="刷新" placement="top">
            <el-button 
              link
              @click="getContentList"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 内容表格 -->
      <el-table
        v-loading="loading"
        :data="contentList"
        row-key="_id"
        border
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        
        <el-table-column label="封面" width="100" align="center">
          <template #default="{ row }">
            <el-image
              :src="row.imageUrl"
              fit="cover"
              style="width: 60px; height: 40px; border-radius: 4px"
              :preview-src-list="[row.imageUrl]"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tooltip :content="row.title" placement="top" :disabled="!row.title || row.title.length <= 30">
              <span class="content-title">{{ row.title }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column prop="summary" label="摘要" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tooltip :content="row.summary" placement="top" :disabled="!row.summary || row.summary.length <= 50">
              <span class="content-summary">{{ row.summary }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column label="分类" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)" size="small">
              {{ getCategoryName(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'article' ? 'primary' : 'success'" size="small">
              {{ row.type === 'article' ? '文章' : '视频' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isPublished"
              @change="(val) => handleToggleStatus(row, val)"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="views" label="浏览量" width="80" align="center">
          <template #default="{ row }">
            {{ row.views || 0 }}
          </template>
        </el-table-column>
        
        <el-table-column prop="shares" label="分享量" width="80" align="center">
          <template #default="{ row }">
            {{ row.shares || 0 }}
          </template>
        </el-table-column>
        
        <el-table-column label="发布时间" width="160" align="center">
          <template #default="{ row }">
            <el-tooltip :content="formatDate(row.publishDate)" placement="top">
              <span class="date-text">{{ formatDate(row.publishDate) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 内容编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="80%"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="contentFormRef"
        :model="contentForm"
        :rules="contentRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="contentForm.title" placeholder="请输入内容标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="contentForm.category" placeholder="请选择分类">
                <el-option label="健康知识" value="health" />
                <el-option label="科学饮水" value="science" />
                <el-option label="生活小贴士" value="tips" />
                <el-option label="新闻资讯" value="news" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-select v-model="contentForm.type" placeholder="请选择类型">
                <el-option label="文章" value="article" />
                <el-option label="视频" value="video" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="contentForm.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="contentForm.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入内容摘要"
          />
        </el-form-item>

        <el-form-item label="封面图片" prop="imageUrl">
          <el-upload
            class="image-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeImageUpload"
            name="image"
          >
            <img v-if="contentForm.imageUrl" :src="contentForm.imageUrl" class="image" />
            <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item v-if="contentForm.type === 'video'" label="视频链接" prop="videoUrl">
          <el-input v-model="contentForm.videoUrl" placeholder="请输入视频链接" />
        </el-form-item>

        <el-form-item v-if="contentForm.type === 'article'" label="内容" prop="content">
          <div class="rich-editor-wrapper">
            <div ref="editorRef" class="rich-editor" style="height: 300px;"></div>
          </div>
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="contentForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in predefinedTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="发布状态">
          <el-switch
            v-model="contentForm.isPublished"
            active-text="发布"
            inactive-text="草稿"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Filter, RefreshLeft, Delete, Picture } from '@element-plus/icons-vue'
import request from '../../api/request'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

// 确保Quill正确加载
console.log('Quill版本:', Quill.version || 'unknown')

// 响应式数据
const loading = ref(false)
const contentList = ref([])
const selectedContents = ref([])
const dialogVisible = ref(false)
const contentFormRef = ref()
const editorRef = ref()
const advancedFilterVisible = ref(false)
let quillEditor = null
let editorInitialized = ref(false)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  type: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 内容表单
const contentForm = reactive({
  title: '',
  summary: '',
  content: '',
  imageUrl: '',
  videoUrl: '',
  type: 'article',
  category: '',
  author: '水商城编辑部',
  tags: [],
  isPublished: true
})

// 预定义标签
const predefinedTags = ref([
  '健康', '饮水', '科学', '生活', '小贴士', '新闻', '热门', '推荐'
])

// 表单验证规则
const contentRules = {
  title: [
    { required: true, message: '请输入内容标题', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入内容摘要', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  imageUrl: [
    { required: true, message: '请上传封面图片', trigger: 'change' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  return contentForm._id ? '编辑内容' : '新增内容'
})

const uploadUrl = computed(() => {
  return '/api/upload/content'
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})

const hasActiveFilters = computed(() => {
  return searchForm.category || searchForm.type || searchForm.status
})

const activeFilterCount = computed(() => {
  let count = 0
  if (searchForm.category) count++
  if (searchForm.type) count++
  if (searchForm.status) count++
  return count
})

// 方法
const getContentList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }
    
    const response = await request.get('/articles/admin/contents', { params })
    
    if (response.success) {
      contentList.value = response.data.contents
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取内容列表失败:', error)
    ElMessage.error('获取内容列表失败')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  console.log('🔄 手动刷新内容列表')
  getContentList()
}

const handleReset = () => {
  console.log('🔄 重置搜索条件')
  Object.assign(searchForm, {
    keyword: '',
    category: '',
    type: '',
    status: ''
  })
  pagination.page = 1
  getContentList()
}

const clearAllFilters = () => {
  console.log('🧹 清空所有筛选条件')
  Object.assign(searchForm, {
    keyword: '',
    category: '',
    type: '',
    status: ''
  })
  pagination.page = 1
  getContentList()
}

const resetAdvancedFilter = () => {
  console.log('🔄 重置高级筛选')
  Object.assign(searchForm, {
    category: '',
    type: '',
    status: ''
  })
  pagination.page = 1
  getContentList()
}

const onAdvancedFilterClose = () => {
  // 抽屉关闭时不需要特殊处理
}

const handleBatchDelete = async () => {
  if (selectedContents.value.length === 0) {
    ElMessage.warning('请选择要删除的内容')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedContents.value.length} 个内容吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedContents.value.map(item => item._id)
    const response = await request.delete('/articles/admin/contents/batch', { data: { ids } })
    
    if (response.success) {
      ElMessage.success('批量删除成功')
      getContentList()
      selectedContents.value = []
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

const handleAdd = () => {
  console.log('🆕 开始新增内容...')
  resetForm()
  
  // 确保编辑器完全清理
  destroyEditor()
  
  dialogVisible.value = true
  
  nextTick(() => {
    setTimeout(() => {
      console.log('🆕 新增内容 - 初始化编辑器')
      initEditor()
    }, 500) // 增加延迟时间
  })
}

const handleEdit = async (row) => {
  try {
    const response = await request.get(`/articles/admin/contents/${row._id}`)
    if (response.success) {
      console.log('获取到的内容数据:', response.data.content)
      
      // 先重置表单和销毁编辑器
      resetForm()
      destroyEditor()
      
      // 设置表单数据
      Object.assign(contentForm, response.data.content)
      console.log('表单数据:', contentForm)
      
      // 显示对话框
      dialogVisible.value = true
      
      // 等待对话框完全显示后初始化编辑器
      nextTick(() => {
        setTimeout(() => {
          console.log('✏️ 编辑内容 - 初始化编辑器')
          initEditor()
          
          // 确保编辑器初始化完成后再设置内容
          setTimeout(() => {
            if (quillEditor && contentForm.content) {
              console.log('✏️ 设置编辑器内容')
              setEditorContent(contentForm.content)
            }
          }, 200) // 给编辑器更多初始化时间
        }, 500) // 增加延迟时间
      })
    }
  } catch (error) {
    console.error('获取内容详情失败:', error)
    ElMessage.error('获取内容详情失败')
  }
}

// 清理编辑器的专用函数
const destroyEditor = () => {
  console.log('🗑️ 开始销毁编辑器...')
  
  if (quillEditor) {
    try {
      console.log('🗑️ 销毁Quill实例...')
      
      // 移除所有事件监听器
      if (typeof quillEditor.off === 'function') {
        quillEditor.off()
      }
      
      // 获取编辑器容器
      const container = quillEditor.container
      
      // 清空内容
      if (typeof quillEditor.setText === 'function') {
        quillEditor.setText('')
      }
      
      // 销毁实例
      quillEditor = null
      
      // 彻底清理DOM - 移除所有Quill相关的元素
      if (container) {
        // 移除工具栏
        const toolbar = container.querySelector('.ql-toolbar')
        if (toolbar) {
          toolbar.remove()
          console.log('🗑️ 工具栏已移除')
        }
        
        // 移除编辑器容器
        const editor = container.querySelector('.ql-editor')
        if (editor) {
          editor.remove()
          console.log('🗑️ 编辑器容器已移除')
        }
        
        // 清空所有子元素
        container.innerHTML = ''
        
        // 移除所有Quill相关的类名
        container.className = container.className.replace(/ql-\S+/g, '').trim()
        
        console.log('🗑️ 容器已完全清理')
      }
      
      console.log('🗑️ Quill实例销毁完成')
    } catch (error) {
      console.error('🗑️ 销毁编辑器时出错:', error)
      quillEditor = null
    }
  }
  
  // 额外的DOM清理 - 确保容器完全干净
  if (editorRef.value) {
    console.log('🗑️ 清理编辑器DOM容器...')
    
    // 移除所有子元素
    while (editorRef.value.firstChild) {
      editorRef.value.removeChild(editorRef.value.firstChild)
    }
    
    // 重置容器
    editorRef.value.innerHTML = ''
    editorRef.value.className = 'rich-editor'
    
    console.log('🗑️ DOM容器已完全清理')
  }
  
  // 在页面级别查找并清理可能遗留的工具栏
  const orphanToolbars = document.querySelectorAll('.ql-toolbar')
  orphanToolbars.forEach((toolbar, index) => {
    // 检查工具栏是否属于当前编辑器容器
    if (!editorRef.value || !editorRef.value.contains(toolbar)) {
      console.log(`🗑️ 发现并移除孤立工具栏 ${index + 1}`)
      toolbar.remove()
    }
  })
  
  // 重置状态
  editorInitialized.value = false
  
  console.log('🗑️ 编辑器销毁完成，状态已重置')
}

// 设置编辑器内容的专用函数
const setEditorContent = (content) => {
  if (!quillEditor || !content) {
    console.log('编辑器或内容为空:', { quillEditor, content })
    return
  }
  
  console.log('设置编辑器内容:', content)
  
  try {
    // 清空现有内容
    quillEditor.setText('')
    
    // 设置新内容
    if (typeof quillEditor.clipboard?.dangerouslyPasteHTML === 'function') {
      quillEditor.clipboard.dangerouslyPasteHTML(content)
    } else {
      // 备用方法：直接设置innerHTML
      quillEditor.root.innerHTML = content
    }
    
    console.log('编辑器内容设置完成')
  } catch (error) {
    console.error('设置编辑器内容失败:', error)
    
    // 最后的备用方法
    try {
      if (quillEditor.root) {
        quillEditor.root.innerHTML = content
        console.log('使用备用方法设置内容成功')
      }
    } catch (fallbackError) {
      console.error('所有方法都失败了:', fallbackError)
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个内容吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await request.delete(`/articles/admin/contents/${row._id}`)
    if (response.success) {
      ElMessage.success('删除成功')
      getContentList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除内容失败:', error)
      ElMessage.error('删除内容失败')
    }
  }
}

const handleToggleStatus = async (row, newStatus) => {
  try {
    const response = await request.put(`/articles/admin/contents/${row._id}`, {
      isPublished: newStatus
    })
    
    if (response.success) {
      ElMessage.success(newStatus ? '发布成功' : '下架成功')
      row.isPublished = newStatus
    } else {
      // 如果失败，恢复原状态
      row.isPublished = !newStatus
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
    // 如果失败，恢复原状态
    row.isPublished = !newStatus
  }
}

const handleSubmit = async () => {
  try {
    await contentFormRef.value.validate()
    
    // 获取富文本编辑器内容
    if (quillEditor && contentForm.type === 'article') {
      contentForm.content = quillEditor.root.innerHTML
    }
    
    const url = contentForm._id 
      ? `/articles/admin/contents/${contentForm._id}`
      : '/articles/admin/contents'
    
    const method = contentForm._id ? 'put' : 'post'
    
    const response = await request[method](url, contentForm)
    
    if (response.success) {
      ElMessage.success(contentForm._id ? '更新成功' : '创建成功')
      dialogVisible.value = false
      getContentList()
    }
  } catch (error) {
    console.error('保存内容失败:', error)
    ElMessage.error('保存内容失败')
  }
}

const handleDialogClose = (done) => {
  console.log('🚪 对话框关闭...')
  
  contentFormRef.value?.resetFields()
  resetForm()
  
  // 完全销毁编辑器
  console.log('🚪 对话框关闭 - 销毁编辑器')
  destroyEditor()
  
  done()
}

const resetForm = () => {
  Object.assign(contentForm, {
    _id: '',
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    type: 'article',
    category: '',
    author: '水商城编辑部',
    tags: [],
    isPublished: true
  })
}

const handleSelectionChange = (selection) => {
  selectedContents.value = selection
}

const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  getContentList()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  getContentList()
}

const handleImageSuccess = (response) => {
  console.log('上传响应:', response)
  
  if (response.success) {
    let imageUrl = response.data.url || response.data.imageUrl
    
    // 处理URL路径
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `http://localhost:5001${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }
    
    contentForm.imageUrl = imageUrl
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

const handleUploadError = (error) => {
  console.error('上传失败:', error)
  ElMessage.error('图片上传失败，请重试')
}

const beforeImageUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

const getCategoryName = (category) => {
  const categoryMap = {
    health: '健康知识',
    science: '科学饮水',
    tips: '生活小贴士',
    news: '新闻资讯'
  }
  return categoryMap[category] || category
}

const getCategoryType = (category) => {
  const typeMap = {
    health: 'success',
    science: 'primary',
    tips: 'warning',
    news: 'info'
  }
  return typeMap[category] || 'info'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化富文本编辑器
const initEditor = () => {
  console.log('🚀 开始初始化编辑器...')
  
  // 检查是否已经初始化
  if (editorInitialized.value) {
    console.log('⚠️ 编辑器已经初始化，跳过重复初始化')
    return
  }
  
  if (!editorRef.value) {
    console.log('❌ 编辑器DOM元素不存在')
    return
  }
  
  // 先完全销毁现有编辑器
  destroyEditor()
  
  // 等待DOM完全清理
  setTimeout(() => {
    console.log('🚀 开始创建新的编辑器实例...')
    
    const container = editorRef.value
    if (!container) {
      console.log('❌ 容器在延迟后仍不存在')
      return
    }
    
    // 确保容器完全干净
    container.innerHTML = ''
    container.className = 'rich-editor'
    
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // 字体样式
      ['blockquote', 'code-block'],                     // 引用和代码块
      [{ 'header': 1 }, { 'header': 2 }],               // 标题
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],     // 列表
      [{ 'script': 'sub'}, { 'script': 'super' }],      // 上标/下标
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // 缩进
      [{ 'direction': 'rtl' }],                         // 文本方向
      [{ 'size': ['small', false, 'large', 'huge'] }],  // 字体大小
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],        // 标题
      [{ 'color': [] }, { 'background': [] }],          // 字体颜色和背景色
      [{ 'font': [] }],                                 // 字体
      [{ 'align': [] }],                                // 对齐方式
      ['clean'],                                        // 清除格式
      ['link', 'image']                                 // 链接和图片
    ]
    
    try {
      console.log('🚀 创建Quill实例...')
      
      quillEditor = new Quill(container, {
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions
        },
        placeholder: '请输入文章内容...'
      })
      
      // 标记为已初始化
      editorInitialized.value = true
      
      console.log('✅ 富文本编辑器初始化完成:', quillEditor)
      console.log('📊 工具栏元素数量:', container.querySelectorAll('.ql-toolbar').length)
      console.log('📊 页面总工具栏数量:', document.querySelectorAll('.ql-toolbar').length)
      
      // 验证编辑器状态
      if (quillEditor && quillEditor.root) {
        console.log('✅ 编辑器状态正常')
      } else {
        console.log('❌ 编辑器状态异常')
      }
      
    } catch (error) {
      console.error('❌ 富文本编辑器初始化失败:', error)
      editorInitialized.value = false
      quillEditor = null
    }
  }, 100) // 给DOM清理一些时间
}

// 监听contentForm的变化
watch(() => contentForm.content, (newContent) => {
  console.log('contentForm.content 变化:', newContent)
}, { deep: true })

// 监听搜索关键词变化，实现输入即查询
watch(
  () => searchForm.keyword,
  (newKeyword, oldKeyword) => {
    console.log('🔍 搜索关键词变化:', { newKeyword, oldKeyword })
    
    // 防抖处理
    clearTimeout(window.contentSearchTimeout)
    window.contentSearchTimeout = setTimeout(() => {
      // 当关键词被清空时，也要重新搜索
      if (newKeyword === '' || newKeyword.length >= 2) {
        console.log('🔍 触发自动搜索:', newKeyword)
        pagination.page = 1
        getContentList()
      }
    }, 500)
  }
)

// 监听筛选条件变化，实现选择即查询
watch(
  () => [searchForm.category, searchForm.type, searchForm.status],
  (newFilters, oldFilters) => {
    console.log('🔍 筛选条件变化:', { newFilters, oldFilters })
    
    // 防抖处理
    clearTimeout(window.contentFilterTimeout)
    window.contentFilterTimeout = setTimeout(() => {
      console.log('🔍 触发筛选查询')
      pagination.page = 1
      getContentList()
    }, 300)
  }
)

// 监听对话框显示状态，确保编辑器正确管理
watch(
  () => dialogVisible.value,
  (newVisible, oldVisible) => {
    console.log('🚪 对话框状态变化:', { newVisible, oldVisible })
    
    if (!newVisible && oldVisible) {
      // 对话框关闭时，确保编辑器被销毁
      console.log('🚪 对话框关闭 - 确保编辑器销毁')
      setTimeout(() => {
        destroyEditor()
      }, 100)
    }
  }
)

// 生命周期
onMounted(() => {
  getContentList()
})

onUnmounted(() => {
  console.log('组件卸载，清理编辑器')
  destroyEditor()
  
  // 清理搜索防抖定时器
  if (window.contentSearchTimeout) {
    clearTimeout(window.contentSearchTimeout)
    delete window.contentSearchTimeout
  }
  
  // 清理筛选防抖定时器
  if (window.contentFilterTimeout) {
    clearTimeout(window.contentFilterTimeout)
    delete window.contentFilterTimeout
  }
})
</script>

<style scoped>
.content-list-container {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}

/* 搜索区域样式 */
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

.has-filters {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.filter-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.filter-tag {
  margin-right: 8px;
}

/* 高级筛选抽屉样式 */
.advanced-filter {
  padding: 16px;
}

.filter-tip {
  margin-bottom: 16px;
}

.filter-form {
  margin-bottom: 24px;
}

.filter-actions-bottom {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 表格样式 */
.table-card {
  margin-bottom: 8px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-info {
  font-size: 14px;
  color: #666;
}

.content-title {
  font-weight: 500;
  color: #303133;
}

.content-summary {
  color: #606266;
  font-size: 13px;
}

.date-text {
  font-size: 13px;
  color: #909399;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 40px;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
  border-radius: 4px;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 8px 0 0 0;
  width: 100%;
}

/* 对话框样式 */
.image-uploader .image {
  width: 240px;
  height: 135px;
  display: block;
  object-fit: cover;
  border-radius: 4px;
}

.image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: 0.2s;
  width: 240px;
  height: 135px;
}

.image-uploader .el-upload:hover {
  border-color: #409eff;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 240px;
  height: 135px;
  line-height: 135px;
  text-align: center;
}

.dialog-footer {
  text-align: right;
}

/* 富文本编辑器样式 */
.rich-editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.rich-editor {
  min-height: 200px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
}

.rich-editor:focus {
  border-color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-list-container {
    padding: 8px;
  }
  
  .search-bar {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .search-input-wrapper {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .filter-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .filter-actions .el-button {
    min-width: auto;
    flex: 1;
  }
  
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .pagination-container {
    justify-content: center;
  }
}
</style>
