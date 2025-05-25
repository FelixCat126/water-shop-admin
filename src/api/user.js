import request from './request'

// 获取用户列表
export function getUsers(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

// 获取用户详情
export function getUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
  })
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(id, data) {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}

// 批量删除用户
export function deleteUsers(userIds) {
  return request({
    url: '/admin/users',
    method: 'delete',
    data: { userIds }
  })
}

// 获取用户详情（包含订单等信息）
export function getUserDetail(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
  })
}

// 获取用户订单
export function getUserOrders(id, params) {
  return request({
    url: `/admin/users/${id}/orders`,
    method: 'get',
    params
  })
} 