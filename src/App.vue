<script setup>
// 移除未使用的组件导入
</script>

<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  color: #333;
  background-color: #f0f2f5;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

a {
  color: #409EFF;
  text-decoration: none;
}

/* 覆盖Element Plus默认样式 */
.el-card {
  --el-card-padding: 12px;
}

.el-form-item {
  margin-bottom: 16px;
}

.el-row {
  margin-left: -8px !important;
  margin-right: -8px !important;
}

.el-col {
  padding-left: 8px !important;
  padding-right: 8px !important;
}
</style>
