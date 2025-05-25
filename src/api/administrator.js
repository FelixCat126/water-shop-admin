import request from './request'

// 获取操作员列表
export function getAdministrators(params) {
  return request({
    url: '/administrators',
    method: 'get',
    params
  })
}

// 获取操作员详情
export function getAdministrator(id) {
  return request({
    url: `/administrators/${id}`,
    method: 'get'
  })
}

// 创建操作员
export function createAdministrator(data) {
  return request({
    url: '/administrators',
    method: 'post',
    data
  })
}

// 更新操作员
export function updateAdministrator(id, data) {
  return request({
    url: `/administrators/${id}`,
    method: 'put',
    data
  })
}

// 删除操作员
export function deleteAdministrator(id) {
  return request({
    url: `/administrators/${id}`,
    method: 'delete'
  })
}

// 重置操作员密码
export function resetAdminPassword(id, data) {
  return request({
    url: `/administrators/${id}/password`,
    method: 'put',
    data
  })
}

// 修改当前操作员密码
export function updatePassword(data) {
  return request({
    url: '/auth/password',
    method: 'put',
    data
  })
} 