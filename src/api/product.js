import request from './request'

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} - 返回商品列表数据
 */
export function getProducts(params) {
  return request({
    url: '/admin/products',
    method: 'get',
    params
  })
}

/**
 * 获取商品详情
 * @param {string|number} id - 商品ID
 * @returns {Promise<Object>} - 返回商品详情
 */
export function getProduct(id) {
  return request({
    url: `/admin/products/${id}`,
    method: 'get'
  })
}

/**
 * 创建商品
 * @param {Object} data - 商品数据
 * @returns {Promise<Object>} - 返回创建结果
 */
export function createProduct(data) {
  return request({
    url: '/admin/products',
    method: 'post',
    data
  })
}

/**
 * 更新商品
 * @param {string|number} id - 商品ID
 * @param {Object} data - 更新的商品数据
 * @returns {Promise<Object>} - 返回更新结果
 */
export function updateProduct(id, data) {
  return request({
    url: `/admin/products/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除商品
 * @param {string|number} id - 商品ID
 * @returns {Promise<Object>} - 返回删除结果
 */
export function deleteProduct(id) {
  return request({
    url: `/admin/products/${id}`,
    method: 'delete'
  })
}

/**
 * 获取商品分类列表
 * @returns {Promise<Object>} - 返回商品分类列表
 */
export function getCategories() {
  return request({
    url: '/admin/categories',
    method: 'get'
  })
}

/**
 * 获取热销商品数据
 * @returns {Promise<Object>} - 返回热销商品数据
 */
export function getProductRanking() {
  return request({
    url: '/products/hot',
    method: 'get'
  })
}

/**
 * 获取商品销售占比数据 (基于订单计算的真实销售数据)
 * @returns {Promise<Object>} - 返回商品销售占比数据
 */
export function getProductSales() {
  return request({
    url: '/admin/products/sales/stats',
    method: 'get'
  })
}

// 上传商品图片
export function uploadProductImage(data) {
  return request({
    url: '/admin/upload/product',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
} 