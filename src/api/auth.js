import request from './request'

// 登录
export function login(data) {
  return request({
    url: '/admin/auth/login',
    method: 'post',
    data
  })
}

// 获取当前用户信息
export function getUserInfo() {
  return request({
    url: '/admin/auth/profile',
    method: 'get'
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/admin/auth/password',
    method: 'put',
    data
  })
} 