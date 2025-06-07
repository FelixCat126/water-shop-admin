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
              link
              @click="columnSettingVisible = true"
            >
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="刷新" placement="top">
            <el-button 
              link
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
        
        <!-- 原价 -->
        <el-table-column
          prop="originalPrice"
          label="原价"
          width="120"
          align="center"
          v-if="visibleColumns.includes('originalPrice')"
        >
          <template #default="scope">
            <span v-if="scope.row.originalPrice" class="original-price-text">
              ¥{{ scope.row.originalPrice.toFixed(2) }}
            </span>
            <span v-else class="no-original-price">-</span>
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
          width="120"
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
          <el-button link @click="handleResetColumns">重置</el-button>
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
            <div class="info-row" v-if="selectedProductData.originalPrice && selectedProductData.originalPrice > 0">
              <label>原价：</label>
              <span class="original-price">¥{{ selectedProductData.originalPrice }}</span>
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

    <!-- 批量导入组件 -->
    <ProductBatchImport 
      v-model="batchImportVisible"
      @importSuccess="handleBatchImportSuccess" 
      @importError="handleBatchImportError" 
    />

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="1200px"
      :close-on-click-modal="false"
      destroy-on-close
      class="product-dialog"
    >
      <div class="product-form-container">
        <el-form
          ref="productFormRef"
          :model="productForm"
          :rules="formRules"
          label-width="100px"
          class="product-form"
        >
          <div class="form-sections">
            <!-- 左侧：基本信息 -->
            <div class="form-section-left">
              <!-- 基本信息区域 -->
              <div class="form-section">
                <div class="section-header">
                  <el-icon class="section-icon"><Goods /></el-icon>
                  <span class="section-title">基本信息</span>
                </div>
                <div class="section-content">
                  <el-row :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="商品名称" prop="name">
                        <el-input 
                          v-model="productForm.name" 
                          placeholder="请输入商品名称"
                          clearable
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="商品分类" prop="category">
                        <el-select 
                          v-model="productForm.category" 
                          placeholder="请选择分类" 
                          style="width: 100%"
                          clearable
                        >
                          <el-option label="纯净水" value="纯净水" />
                          <el-option label="矿泉水" value="矿泉水" />
                          <el-option label="气泡水" value="气泡水" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="商品价格" prop="price">
                        <el-input-number 
                          v-model="productForm.price" 
                          :min="0" 
                          :precision="2"
                          :step="0.1"
                          style="width: 100%"
                          placeholder="0.00"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="原价">
                        <el-input-number 
                          v-model="productForm.originalPrice" 
                          :min="0" 
                          :precision="2"
                          :step="0.1"
                          style="width: 100%"
                          placeholder="不填则不显示原价"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="库存数量" prop="stock">
                        <el-input-number 
                          v-model="productForm.stock" 
                          :min="0" 
                          style="width: 100%"
                          placeholder="0"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="商品单位" prop="unit">
                        <el-input 
                          v-model="productForm.unit" 
                          placeholder="如：瓶、箱"
                          clearable
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 商品单位字段已移至上方库存数量行 -->

                  <el-form-item label="商品标签">
                    <el-select 
                      v-model="productForm.tags" 
                      multiple
                      filterable
                      allow-create
                      default-first-option
                      placeholder="选择或输入新标签"
                      style="width: 100%"
                      collapse-tags
                      collapse-tags-tooltip
                      :max-collapse-tags="3"
                    >
                      <el-option
                        v-for="tag in predefinedTags"
                        :key="tag"
                        :label="tag"
                        :value="tag"
                      />
                    </el-select>
                    <div class="tag-tip">可选择预设标签或输入新标签，支持多选</div>
                  </el-form-item>
                </div>
              </div>

              <!-- 商品描述区域 -->
              <div class="form-section">
                <div class="section-header">
                  <el-icon class="section-icon"><Document /></el-icon>
                  <span class="section-title">商品描述</span>
                </div>
                <div class="section-content">
                  <el-form-item label="商品简介">
                    <el-input 
                      v-model="productForm.brief" 
                      type="textarea" 
                      :rows="2"
                      placeholder="请输入商品简介"
                      show-word-limit
                      maxlength="100"
                    />
                  </el-form-item>

                  <el-form-item label="商品描述">
                    <el-input 
                      v-model="productForm.description" 
                      type="textarea" 
                      :rows="4"
                      placeholder="请输入商品详细描述"
                      show-word-limit
                      maxlength="500"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 状态设置区域 -->
              <div class="form-section">
                <div class="section-header">
                  <el-icon class="section-icon"><Setting /></el-icon>
                  <span class="section-title">状态设置</span>
                </div>
                <div class="section-content">
                  <el-row :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="商品状态">
                        <el-radio-group v-model="productForm.status" class="status-radio">
                          <el-radio label="on" value="on">
                            <el-icon class="status-icon success"><CircleCheck /></el-icon>
                            上架
                          </el-radio>
                          <el-radio label="off" value="off">
                            <el-icon class="status-icon danger"><CircleClose /></el-icon>
                            下架
                          </el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="排序权重">
                        <el-input-number 
                          v-model="productForm.sort" 
                          :min="0" 
                          style="width: 100%"
                          placeholder="数值越大排序越靠前"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </div>

              <!-- 配送设置区域 -->
              <div class="form-section">
                <div class="section-header">
                  <el-icon class="section-icon"><Van /></el-icon>
                  <span class="section-title">配送设置</span>
                </div>
                <div class="section-content">
                  <el-row :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="免费配送">
                        <el-switch 
                          v-model="productForm.freeShipping"
                          active-text="免费"
                          inactive-text="收费"
                          inline-prompt
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="!productForm.freeShipping">
                      <el-form-item label="配送费用">
                        <el-input-number 
                          v-model="productForm.shippingFee" 
                          :min="0" 
                          :precision="2"
                          style="width: 100%"
                          placeholder="0.00"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>

            <!-- 右侧：图片和参数 -->
            <div class="form-section-right">
              <!-- 商品图片区域 -->
              <div class="form-section">
                <div class="section-header">
                  <el-icon class="section-icon"><Picture /></el-icon>
                  <span class="section-title">商品图片</span>
                </div>
                <div class="section-content">
                  <el-form-item label="商品主图">
                    <div class="image-upload-container">
                      <el-upload
                        action="/api/upload/product"
                        :headers="authHeaders"
                        :show-file-list="false"
                        :on-success="handleMainImageSuccess"
                        :on-error="handleUploadError"
                        :on-progress="handleUploadProgress"
                        :before-upload="beforeImageUpload"
                        name="image"
                      >
                        <img v-if="productForm.image" :src="productForm.image" class="uploaded-main-image" />
                        <div v-else class="upload-placeholder">
                          <el-icon class="upload-icon"><Plus /></el-icon>
                          <div class="upload-text">上传主图</div>
                        </div>
                      </el-upload>
                      <div class="upload-tip">建议尺寸：400x400px，支持JPG、PNG格式，大小不超过2MB</div>
                    </div>
                  </el-form-item>

                  <el-form-item label="商品图片集">
                    <div class="gallery-upload-container">
                      <el-upload
                        class="gallery-uploader"
                        action="/api/upload/product-gallery"
                        :headers="authHeaders"
                        list-type="picture-card"
                        :file-list="productForm.imageGallery"
                        :on-success="handleGallerySuccess"
                        :on-remove="handleGalleryRemove"
                        :on-error="handleUploadError"
                        :on-progress="handleUploadProgress"
                        :before-upload="beforeImageUpload"
                        name="images"
                        multiple
                        :limit="5"
                      >
                        <el-icon class="gallery-upload-icon"><Plus /></el-icon>
                      </el-upload>
                      <div class="upload-tip">最多上传5张图片，建议尺寸：800x800px</div>
                    </div>
                  </el-form-item>
                </div>
              </div>

              <!-- 规格参数区域 -->
              <div class="form-section">
                <div class="section-header">
                  <el-icon class="section-icon"><List /></el-icon>
                  <span class="section-title">规格参数</span>
                </div>
                <div class="section-content">
                  <div class="params-container">
                    <div v-for="(param, index) in productForm.params" :key="index" class="param-item">
                      <el-input 
                        v-model="param.key" 
                        placeholder="参数名称" 
                        class="param-input"
                        clearable
                      />
                      <el-input 
                        v-model="param.value" 
                        placeholder="参数值" 
                        class="param-input"
                        clearable
                      />
                      <el-button 
                        type="danger" 
                        icon="Delete" 
                        circle 
                        size="small"
                        @click="removeParam(index)"
                        class="param-delete-btn"
                      />
                    </div>
                    <el-button 
                      type="primary" 
                      plain 
                      @click="addParam"
                      class="add-param-btn"
                    >
                      <el-icon><Plus /></el-icon>
                      添加参数
                    </el-button>
                  </div>
                </div>
              </div>
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
            {{ isEdit ? '更新商品' : '添加商品' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { 
  Search, Filter, RefreshLeft, Setting, Refresh, Download, Delete, Plus, Picture, QuestionFilled, Upload,
  Goods, Document, Van, List, CircleCheck, CircleClose
} from '@element-plus/icons-vue'
import { getProducts, deleteProduct, updateProduct, createProduct } from '@/api/product'
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
const formDialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const productFormRef = ref(null)

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
  { key: 'originalPrice', label: '原价' },
  { key: 'category', label: '分类' },
  { key: 'stock', label: '库存' },
  { key: 'sales', label: '销量' },
  { key: 'rating', label: '评分' },
  { key: 'status', label: '状态' },
  { key: 'createdAt', label: '创建时间' }
]

// 默认显示的列
const visibleColumns = ref([
  'image', 'name', 'tag', 'price', 'originalPrice', 'category', 
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
        originalPrice: product.originalPrice, // 添加原价字段
        image: product.imageUrl || product.image || '/assets/images/products/default.png',
        imageUrl: product.imageUrl, // 添加主图URL字段
        imageGallery: product.imageGallery || [], // 添加图片集字段
        category: product.category,
        stock: product.stock,
        sales: product.sales,
        tag: product.tag,
        tags: product.tags || (product.tag ? [product.tag] : []), // 添加标签数组字段
        status: product.isActive ? 'on' : 'off',
        createdAt: new Date(product.createdAt).toLocaleString('zh-CN'),
        isActive: product.isActive,
        rating: product.rating || 0,
        ratingsCount: product.ratingsCount || 0,
        unit: product.unit || '瓶', // 添加单位字段
        detailContent: product.detailContent || '' // 添加详情内容字段
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
    '气泡水': '气泡水'
  }
  return categoryMap[category] || category || '未知'
}

// 将英文分类转换为中文分类（用于编辑表单）
const convertCategoryToForm = (category) => {
  const categoryMap = {
    'pure': '纯净水',
    'mineral': '矿泉水',
    'soda': '气泡水'
  }
  return categoryMap[category] || category || ''
}

// 获取类别类型
const getCategoryType = (category) => {
  const typeMap = {
    'pure': 'primary',
    'mineral': 'success',
    'soda': 'warning',
    '纯净水': 'primary',
    '矿泉水': 'success',
    '气泡水': 'warning'
  }
  return typeMap[category] || ''
}

// 将中文分类转换为英文分类（用于提交数据）
const convertCategoryToApi = (category) => {
  const categoryMap = {
    '纯净水': 'pure',
    '矿泉水': 'mineral',
    '气泡水': 'soda'
  }
  return categoryMap[category] || category || ''
}

// 添加商品
const handleAdd = () => {
  isEdit.value = false
  resetProductForm()
  formDialogVisible.value = true
}

// 批量导入商品
const handleBatchImport = () => {
  batchImportVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
  isEdit.value = true
  fillProductForm(row)
  formDialogVisible.value = true
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

// 预定义标签
const predefinedTags = ref([
  '热销',
  '新品',
  '优惠',
  '限时特价',
  '包邮',
  '健康',
  '天然',
  '无糖',
  '低卡',
  '进口',
  '有机',
  '推荐'
])

// 商品表单数据
const productForm = reactive({
  id: '',
  name: '',
  category: '',
  tags: [],
  price: 0,
  originalPrice: null,
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
const formRules = {
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

// 获取认证头
const authHeaders = computed(() => {
  try {
    const token = localStorage?.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch (error) {
    console.warn('无法访问 localStorage:', error)
    return {}
  }
})

// 重置表单
const resetProductForm = () => {
  Object.assign(productForm, {
    id: '',
    name: '',
    category: '',
    tags: [],
    price: 0,
    originalPrice: null,
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
  if (productFormRef.value) {
    productFormRef.value.clearValidate()
  }
}

// 填充表单数据
const fillProductForm = (product) => {
  console.log('填充表单数据 - 原始商品数据:', product)
  console.log('商品图片集字段:', product.imageGallery)
  console.log('商品images字段:', product.images)
  
  // 处理标签数据：将字符串转换为数组
  let tags = []
  if (product.tag) {
    if (Array.isArray(product.tag)) {
      tags = product.tag
    } else if (typeof product.tag === 'string') {
      // 如果是逗号分隔的字符串，转换为数组
      tags = product.tag.split(',').map(tag => tag.trim()).filter(tag => tag)
    }
  }
  
  // 处理图片集数据，兼容多种字段名
  const imageGalleryData = product.imageGallery || product.images || []
  console.log('处理后的图片集数据:', imageGalleryData)
  
  Object.assign(productForm, {
    id: product.id,
    name: product.name || '',
    category: convertCategoryToForm(product.category) || '',
    tags: tags,
    price: product.price || 0,
    originalPrice: product.originalPrice || null,
    stock: product.stock || 0,
    unit: product.unit || '个',
    status: product.isActive ? 'on' : 'off', // 从 isActive 转换为 status
    sort: product.sort || 0,
    brief: product.brief || '',
    description: product.description || '',
    freeShipping: product.freeShipping !== false,
    shippingFee: product.shippingFee || 0,
    image: product.imageUrl || product.image || '', // 支持两种字段名
    imageGallery: imageGalleryData.map((url, index) => ({
      url: url,
      name: `图片${index + 1}`,
      uid: Date.now() + index // 生成唯一ID
    })),
    params: product.params || []
  })
  
  console.log('填充后的表单数据:', productForm)
}

// 添加规格参数
const addParam = () => {
  productForm.params.push({ key: '', value: '' })
}

// 删除规格参数
const removeParam = (index) => {
  productForm.params.splice(index, 1)
}

// 上传主图成功回调
const handleMainImageSuccess = (response, file) => {
  console.log('主图上传响应:', response)
  console.log('上传文件信息:', file)
  
  // 兼容不同的响应格式
  if (response && response.success) {
    // 尝试不同的路径获取图片URL
    const imageUrl = response.data?.url || response.url || response.data?.path || response.path
    
    if (imageUrl) {
      // 确保URL是完整的，添加后端服务器地址
      const baseUrl = 'http://localhost:5001'
      productForm.image = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`
      
      ElMessage.success('主图上传成功')
      console.log('主图URL设置为:', productForm.image)
      
      // 强制更新视图
      nextTick(() => {
        console.log('主图更新后的值:', productForm.image)
      })
    } else {
      console.error('无法从响应中获取图片URL:', response)
      ElMessage.error('上传成功但无法获取图片地址')
    }
  } else {
    console.error('主图上传失败:', response)
    ElMessage.error('上传失败: ' + (response?.message || response?.msg || '未知错误'))
  }
}

// 上传图片集成功回调
const handleGallerySuccess = (response, file) => {
  console.log('图片集上传响应:', response)
  console.log('上传文件信息:', file)
  
  // 兼容不同的响应格式
  if (response && response.success) {
    // 后端返回的是数组格式，取第一个元素
    const imageData = Array.isArray(response.data) ? response.data[0] : response.data
    const imageUrl = imageData?.url || response.url || imageData?.path || response.path
    const fileName = imageData?.filename || response.filename || file.name
    
    if (imageUrl) {
      // 确保URL是完整的，添加后端服务器地址
      const baseUrl = 'http://localhost:5001'
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`
      
      productForm.imageGallery.push({
        url: fullUrl,
        name: fileName,
        uid: file.uid // 添加uid用于删除时识别
      })
      ElMessage.success('图片上传成功')
      console.log('图片集添加:', { url: fullUrl, name: fileName })
    } else {
      console.error('无法从响应中获取图片URL:', response)
      console.error('响应数据结构:', JSON.stringify(response, null, 2))
      ElMessage.error('上传成功但无法获取图片地址')
    }
  } else {
    console.error('图片集上传失败:', response)
    ElMessage.error('上传失败: ' + (response?.message || response?.msg || '未知错误'))
  }
}

// 移除图片集中的图片
const handleGalleryRemove = (file) => {
  console.log('移除图片:', file)
  const index = productForm.imageGallery.findIndex(img => img.url === file.url || img.uid === file.uid)
  if (index !== -1) {
    productForm.imageGallery.splice(index, 1)
    ElMessage.success('图片已移除')
  }
}

// 上传失败回调
const handleUploadError = (error, file) => {
  console.error('上传失败:', error, file)
  
  // 简单显示错误信息，让axios拦截器处理认证相关的错误
  let errorMessage = `文件 ${file.name} 上传失败`
  
  if (error && error.message) {
    try {
      const errorData = JSON.parse(error.message)
      errorMessage = `上传失败: ${errorData.message || '未知错误'}`
    } catch (e) {
      errorMessage = `上传失败: ${error.message || '未知错误'}`
    }
  }
  
  ElMessage.error(errorMessage)
}

// 上传进度回调
const handleUploadProgress = (event, file) => {
  console.log('上传进度:', Math.round(event.percent), '%', file.name)
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
const handleSubmit = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.validate()
    submitting.value = true
    
    // 处理图片集数据格式
    const imageGalleryUrls = productForm.imageGallery.map(img => {
      if (typeof img === 'string') {
        return img
      }
      return img.url || img.response?.data?.url || img
    }).filter(url => url)
    
    // 处理数据格式转换，匹配后端模型
    const productData = {
      name: productForm.name,
      description: productForm.description || productForm.brief || '暂无描述', // 确保有描述字段
      price: productForm.price,
      stock: productForm.stock,
      imageUrl: productForm.image, // 后端期望 imageUrl 字段
      imageGallery: imageGalleryUrls, // 添加图片集数据
      category: convertCategoryToApi(productForm.category),
      tag: Array.isArray(productForm.tags) ? productForm.tags.join(',') : (productForm.tags || ''), // 转换为字符串
      isActive: productForm.status === 'on', // 转换状态格式
      sales: productForm.sales || 0,
      rating: productForm.rating || 0,
      ratingsCount: productForm.ratingsCount || 0
    }
    
    console.log('提交的商品数据:', productData)
    
    if (isEdit.value) {
      await updateProduct(productForm.id, productData)
      ElMessage.success('商品更新成功')
    } else {
      await createProduct(productData)
      ElMessage.success('商品添加成功')
    }
    
    formDialogVisible.value = false
    fetchProductList()
  } catch (error) {
    console.error('保存商品失败', error)
    console.error('错误详情:', error.response?.data)
    ElMessage.error('保存失败: ' + (error.response?.data?.message || error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
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

/* 商品表单弹窗样式 */
.product-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.product-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.product-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.product-form :deep(.el-input-number) {
  width: 100%;
}

.product-form :deep(.el-textarea__inner) {
  resize: vertical;
}

/* 图片上传样式 */
.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-uploader:hover {
  border-color: #409eff;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-uploader :deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
}

.gallery-uploader :deep(.el-upload-list__item) {
  width: 80px;
  height: 80px;
}

.gallery-uploader-icon {
  font-size: 20px;
  color: #8c939d;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.4;
}

/* 规格参数样式 */
.params-container {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  background-color: #fafafa;
}

.param-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.param-item:last-of-type {
  margin-bottom: 16px;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .product-form {
    max-height: 50vh;
  }
  
  .param-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .param-item .el-input {
    width: 100% !important;
    margin-right: 0 !important;
  }
}

/* 商品表单弹窗样式 */
.product-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.product-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.product-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.product-form :deep(.el-input-number) {
  width: 100%;
}

.product-form :deep(.el-textarea__inner) {
  resize: vertical;
}

/* 图片上传样式 */
.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-uploader:hover {
  border-color: #409eff;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-uploader :deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
}

.gallery-uploader :deep(.el-upload-list__item) {
  width: 80px;
  height: 80px;
}

.gallery-uploader-icon {
  font-size: 20px;
  color: #8c939d;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.4;
}

/* 规格参数样式 */
.params-container {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  background-color: #fafafa;
}

.param-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.param-item:last-of-type {
  margin-bottom: 16px;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .product-form {
    max-height: 50vh;
  }
  
  .param-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .param-item .el-input {
    width: 100% !important;
    margin-right: 0 !important;
  }
}

/* 优化后的商品表单弹窗样式 */
.product-dialog :deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.product-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
}

.product-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.product-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 20px;
}

.product-form-container {
  padding: 0;
}

.form-sections {
  display: flex;
  gap: 24px;
}

.form-section-left {
  flex: 2;
}

.form-section-right {
  flex: 1;
  min-width: 300px;
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
  color: #667eea;
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

/* 确保输入框有足够的最小宽度 */
.section-content :deep(.el-input-number) {
  min-width: 180px;
}

.section-content :deep(.el-input) {
  min-width: 120px;
}

.section-content :deep(.el-select) {
  min-width: 120px;
}

.status-radio {
  display: flex;
  gap: 16px;
}

.status-radio .el-radio {
  display: flex;
  align-items: center;
  margin-right: 0;
}

.status-icon {
  margin-right: 4px;
  font-size: 14px;
}

.status-icon.success {
  color: #10b981;
}

.status-icon.danger {
  color: #ef4444;
}

.image-upload-container {
  text-align: center;
}

.main-image-uploader {
  display: inline-block;
}

.main-image-uploader :deep(.el-upload) {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image-uploader :deep(.el-upload:hover) {
  border-color: #667eea;
  background-color: #f8fafc;
}

.uploaded-main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  font-weight: 500;
}

.gallery-upload-container {
  text-align: center;
}

.gallery-uploader :deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.gallery-uploader :deep(.el-upload--picture-card:hover) {
  border-color: #667eea;
}

.gallery-upload-icon {
  font-size: 20px;
  color: #9ca3af;
}

.param-input {
  flex: 1;
}

.param-delete-btn {
  flex-shrink: 0;
}

.add-param-btn {
  width: 100%;
  border-style: dashed;
  color: #667eea;
  border-color: #667eea;
}

.add-param-btn:hover {
  background-color: #f0f4ff;
}

.tag-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

/* 确保输入框有足够的最小宽度 */
.product-form :deep(.el-input-number) {
  min-width: 180px;
}

.product-form :deep(.el-input) {
  min-width: 120px;
}

.product-form :deep(.el-select) {
  min-width: 120px;
}

/* 响应式优化 */
@media (max-width: 1200px) {
  .form-sections {
    flex-direction: column;
  }
  
  .form-section-right {
    min-width: auto;
  }
  
  /* 小屏幕下调整最小宽度 */
  .product-form :deep(.el-input-number) {
    min-width: 150px;
  }
  
  .product-form :deep(.el-input) {
    min-width: 100px;
  }
}

/* 确保输入框有足够的最小宽度 */
.product-form :deep(.el-input-number) {
  min-width: 180px;
}

.product-form :deep(.el-input) {
  min-width: 120px;
}

.product-form :deep(.el-select) {
  min-width: 120px;
}

/* 小屏幕下调整最小宽度 */
@media (max-width: 1200px) {
  .product-form :deep(.el-input-number) {
    min-width: 150px;
  }
  
  .product-form :deep(.el-input) {
    min-width: 100px;
  }
}

.tag-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

/* 原价样式 */
.original-price-text {
  color: #999;
  text-decoration: line-through;
}

.no-original-price {
  color: #ccc;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 14px;
}
</style> 