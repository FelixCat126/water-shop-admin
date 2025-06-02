import request from './request'

/**
 * 获取优惠券列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} - 返回优惠券列表
 */
export function getCoupons(params) {
  return request({
    url: '/admin/coupons',
    method: 'get',
    params
  })
}

/**
 * 获取优惠券详情
 * @param {string|number} id - 优惠券ID
 * @returns {Promise<Object>} - 返回优惠券详情
 */
export function getCoupon(id) {
  return request({
    url: `/admin/coupons/${id}`,
    method: 'get'
  })
}

/**
 * 创建优惠券
 * @param {Object} data - 优惠券数据
 * @returns {Promise<Object>} - 返回创建结果
 */
export function createCoupon(data) {
  return request({
    url: '/admin/coupons',
    method: 'post',
    data
  })
}

/**
 * 更新优惠券
 * @param {string|number} id - 优惠券ID
 * @param {Object} data - 更新的优惠券数据
 * @returns {Promise<Object>} - 返回更新结果
 */
export function updateCoupon(id, data) {
  return request({
    url: `/admin/coupons/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除优惠券
 * @param {string|number} id - 优惠券ID
 * @returns {Promise<Object>} - 返回删除结果
 */
export function deleteCoupon(id) {
  return request({
    url: `/admin/coupons/${id}`,
    method: 'delete'
  })
}

/**
 * 更新优惠券状态
 * @param {string|number} id - 优惠券ID
 * @param {boolean} isActive - 是否激活
 * @returns {Promise<Object>} - 返回更新结果
 */
export function updateCouponStatus(id, isActive) {
  return request({
    url: `/admin/coupons/${id}/status`,
    method: 'put',
    data: { isActive }
  })
}

/**
 * 分发优惠券
 * @param {Object} data - 分发数据
 * @returns {Promise<Object>} - 返回分发结果
 */
export function distributeCoupons(data) {
  return request({
    url: '/admin/coupons/distribute',
    method: 'post',
    data
  })
}

/**
 * 获取用户优惠券列表
 * @param {string|number} userId - 用户ID
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} - 返回用户优惠券列表
 */
export function getUserCoupons(userId, params = {}) {
  return request({
    url: `/admin/users/${userId}/coupons`,
    method: 'get',
    params
  })
} 


/**
 * 检查优惠券代码是否重复
 * @param {string} code - 优惠券代码
 * @returns {Promise<Object>} - 返回检查结果
 */
export function checkCouponCode(code) {
  return request({
    url: '/admin/coupons/check-code',
    method: 'get',
    params: { code }
  })
}