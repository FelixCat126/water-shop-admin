import request from '@/api/request'

// 轮播图API
export const bannerApi = {
  // 获取轮播图列表
  getBanners(params) {
    return request({
      url: '/banners',
      method: 'get',
      params
    })
  },

  // 获取有效轮播图(小程序端)
  getActiveBanners() {
    return request({
      url: '/banners/active',
      method: 'get'
    })
  },

  // 创建轮播图
  createBanner(data) {
    return request({
      url: '/banners',
      method: 'post',
      data
    })
  },

  // 更新轮播图
  updateBanner(id, data) {
    return request({
      url: `/banners/${id}`,
      method: 'put',
      data
    })
  },

  // 删除轮播图
  deleteBanner(id) {
    return request({
      url: `/banners/${id}`,
      method: 'delete'
    })
  },

  // 切换轮播图状态
  toggleBannerStatus(id, data) {
    return request({
      url: `/banners/${id}/status`,
      method: 'put',
      data
    })
  },

  // 批量更新排序
  updateBannerSort(banners) {
    return request({
      url: '/banners/sort/batch',
      method: 'put',
      data: { banners }
    })
  },

  // 搜索产品
  searchProducts(params) {
    return request({
      url: '/banners/products/search',
      method: 'get',
      params
    })
  },

  // 搜索文章
  searchArticles(params) {
    return request({
      url: '/banners/articles/search',
      method: 'get',
      params
    })
  },

  // 获取产品类别列表
  getProductCategories() {
    return request({
      url: '/banners/categories',
      method: 'get'
    })
  },

  // 轮播图点击统计
  clickBanner(id) {
    return request({
      url: `/banners/${id}/click`,
      method: 'post'
    })
  }
}

// 兼容旧的导出方式
export const {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  updateBannerSort,
  searchProducts,
  searchArticles,
  getProductCategories,
  clickBanner
} = bannerApi 