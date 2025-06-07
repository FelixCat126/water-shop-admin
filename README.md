# SPRINKLE 水商城管理后台

## 项目简介

SPRINKLE 水商城管理后台是一个基于 Vue 3 + Element Plus 的现代化后台管理系统，为水商城小程序提供完整的商品、订单、用户、优惠券等业务管理功能。

## 技术栈

### 前端框架
- **Vue 3** - 采用 Composition API，提供更好的代码组织和类型推导
- **Vite** - 现代化构建工具，提供快速的开发体验
- **Vue Router 4** - 官方路由管理器
- **Pinia** - 新一代状态管理库

### UI 组件库
- **Element Plus** - 基于 Vue 3 的桌面端组件库
- **@element-plus/icons-vue** - Element Plus 图标库

### 工具库
- **Axios** - HTTP 客户端，用于 API 请求
- **ECharts** - 数据可视化图表库
- **Quill** - 富文本编辑器
- **XLSX** - Excel 文件处理库

## 软件架构

### 目录结构
```
src/
├── api/              # API 接口封装
├── assets/           # 静态资源
├── components/       # 公共组件
├── layouts/          # 布局组件
├── router/           # 路由配置
├── store/            # 状态管理
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── products/     # 商品管理
│   ├── orders/       # 订单管理
│   ├── users/        # 用户管理
│   ├── coupons/      # 优惠券管理
│   ├── banners/      # 轮播图管理
│   ├── contents/     # 内容管理
│   ├── admins/       # 管理员管理
│   └── settings/     # 系统设置
├── App.vue           # 根组件
└── main.js           # 应用入口
```

### 架构特点
- **模块化设计**: 按业务功能划分模块，便于维护和扩展
- **组件化开发**: 采用 Vue 3 组件化思想，提高代码复用性
- **响应式布局**: 支持多种屏幕尺寸，提供良好的用户体验
- **权限控制**: 基于路由守卫的权限验证机制

## 功能清单

### 🏠 控制台 (Dashboard)
- 数据概览统计
- 销售趋势图表
- 订单状态分布
- 用户增长分析

### 📦 商品管理 (Products)
- **商品列表**: 分页展示、搜索筛选、批量操作
- **商品添加**: 基本信息、图片上传、规格参数
- **商品编辑**: 信息修改、状态管理
- **批量导入**: Excel 模板导入、数据验证
- **商品详情**: 完整信息查看

### 📋 订单管理 (Orders)
- **订单列表**: 多状态筛选、时间范围查询
- **订单详情**: 商品信息、配送地址、支付状态
- **订单处理**: 发货、取消、退款操作
- **订单统计**: 销售数据分析

### 👥 用户管理 (Users)
- **用户列表**: 用户信息展示、状态管理
- **用户详情**: 个人信息、订单历史
- **积分管理**: 积分查看、手动调整
- **用户统计**: 注册趋势、活跃度分析

### 🎫 优惠券管理 (Coupons)
- **优惠券列表**: 券种管理、使用统计
- **优惠券创建**: 满减券、折扣券、免邮券
- **发放管理**: 批量发放、定向发放
- **使用记录**: 使用明细、效果分析

### 🖼️ 轮播图管理 (Banners)
- **轮播图列表**: 图片展示、排序管理
- **轮播图添加**: 图片上传、链接设置
- **状态控制**: 启用/禁用、时间控制

### 📝 内容管理 (Contents)
- **文章管理**: 富文本编辑、分类管理
- **内容发布**: 发布状态、时间控制
- **SEO 优化**: 标题、描述、关键词

### 👨‍💼 管理员管理 (Admins)
- **管理员列表**: 账号管理、权限分配
- **角色管理**: 权限配置、功能控制
- **操作日志**: 管理员操作记录

### ⚙️ 系统设置 (Settings)
- **基础配置**: 系统参数设置
- **支付配置**: 支付方式管理
- **物流配置**: 配送设置

## 开发环境

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

开发服务器将在 http://localhost:8081 启动

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

### 预览生产版本
```bash
npm run preview
# 或
yarn preview
```

## 配置说明

### 环境变量
```javascript
// vite.config.js
define: {
  'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:5001/api'),
  'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:5001/api')
}
```

### 代理配置
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true
    },
    '/uploads': {
      target: 'http://localhost:5001',
      changeOrigin: true
    }
  }
}
```

## API 接口

### 基础路径
- 开发环境: `http://localhost:5001/api`
- 生产环境: 根据实际部署配置

### 主要接口模块
- `/admin/products` - 商品管理
- `/admin/orders` - 订单管理
- `/admin/users` - 用户管理
- `/admin/coupons` - 优惠券管理
- `/admin/banners` - 轮播图管理
- `/admin/articles` - 内容管理
- `/admin/administrators` - 管理员管理
- `/admin/upload` - 文件上传

## 部署说明

### 构建部署
1. 执行构建命令生成 `dist` 目录
2. 将 `dist` 目录部署到 Web 服务器
3. 配置 Nginx 或 Apache 支持 SPA 路由

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend-server:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 开发规范

### 代码规范
- 使用 ES6+ 语法
- 组件名采用 PascalCase
- 文件名采用 kebab-case
- 变量名采用 camelCase

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 常见问题

### 1. 开发服务器启动失败
- 检查 Node.js 版本是否符合要求
- 清除 node_modules 重新安装依赖
- 检查端口 8081 是否被占用

### 2. API 请求失败
- 确认后端 API 服务是否正常运行
- 检查代理配置是否正确
- 查看浏览器控制台网络请求状态

### 3. 图片上传失败
- 检查文件大小是否超过限制（2MB）
- 确认文件格式是否支持（JPG/PNG/GIF/WebP）
- 检查后端上传接口是否正常

## 技术支持

如有问题或建议，请联系开发团队或提交 Issue。
