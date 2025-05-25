import request from './request'

/**
 * 获取订单统计数据
 * @returns {Promise<Object>} - 返回订单统计数据
 */
export function getOrderStats() {
  return request({
    url: '/admin/statistics/overview',
    method: 'get'
  })
}

/**
 * 获取销售趋势数据
 * @param {string} timeRange - 时间范围：week(本周), month(本月), year(全年)
 * @returns {Promise<Object>} - 返回销售趋势数据
 */
export function getSalesTrends(timeRange = 'week') {
  return request({
    url: '/admin/sales/trends',
    method: 'get',
    params: { timeRange }
  })
}

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} - 返回订单列表数据
 */
export function getOrderList(params) {
  return request({
    url: '/admin/orders',
    method: 'get',
    params
  })
}

/**
 * 获取订单详情
 * @param {string|number} id - 订单ID
 * @returns {Promise<Object>} - 返回订单详情
 */
export function getOrderDetail(id) {
  return request({
    url: `/admin/orders/${id}`,
    method: 'get'
  })
}

/**
 * 更新订单状态
 * @param {string|number} id - 订单ID
 * @param {string} status - 订单状态
 * @returns {Promise<Object>} - 返回更新结果
 */
export function updateOrderStatus(id, status) {
  return request({
    url: `/admin/orders/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 删除订单
 * @param {string|number} id - 订单ID
 * @returns {Promise<Object>} - 返回删除结果
 */
export function deleteOrder(id) {
  return request({
    url: `/admin/orders/${id}`,
    method: 'delete'
  })
}

// 添加订单备注
export function addOrderNote(id, note) {
  return request({
    url: `/admin/orders/${id}/notes`,
    method: 'post',
    data: { note }
  })
}

/**
 * 获取最新订单数据
 * @param {number} limit - 返回的订单数量限制
 * @returns {Promise<Object>} - 返回最新订单数据
 */
export function getLatestOrders(limit = 5) {
  return request({
    url: '/admin/orders/latest',
    method: 'get',
    params: { limit }
  })
}