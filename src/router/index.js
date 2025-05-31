import { createRouter, createWebHistory } from 'vue-router'

// 布局
import AdminLayout from '../layouts/AdminLayout.vue'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '控制台' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/products/ProductList.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'products/add',
        name: 'AddProduct',
        component: () => import('../views/products/ProductForm.vue'),
        meta: { title: '添加商品' }
      },
      {
        path: 'coupons',
        name: 'Coupons',
        component: () => import('../views/coupons/CouponList.vue'),
        meta: { title: '优惠券管理' }
      },
      {
        path: 'banners',
        name: 'Banners',
        component: () => import('../views/banners/BannerList.vue'),
        meta: { title: '轮播图管理' }
      },
      {
        path: 'contents',
        name: 'Contents',
        component: () => import('../views/contents/ContentList.vue'),
        meta: { title: '内容管理' }
      },
      {
        path: 'products/edit/:id',
        name: 'EditProduct',
        component: () => import('../views/products/ProductForm.vue'),
        meta: { title: '编辑商品' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/orders/OrderList.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/users/index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'contents',
        name: 'Contents',
        component: () => import('../views/contents/ContentList.vue'),
        meta: { title: '内容管理' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/settings/Settings.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: 'admins',
        name: 'Admins',
        component: () => import('../views/admins/AdminList.vue'),
        meta: { title: '管理员账号' }
      }
    ]
  },
  // 404页面
  { 
    path: '/:pathMatch(.*)*', 
    name: 'NotFound', 
    component: () => import('../views/NotFound.vue') 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    // 设置页面标题
    if (to.meta.title) {
          document.title = `SPRINKLE - ${to.meta.title}`
  } else {
    document.title = 'SPRINKLE'
    }
    next()
  }
})

export default router 