<template>
  <div class="not-found">
    <div class="content">
      <h1 class="error-code">404</h1>
      <div class="error-desc">抱歉，您访问的页面不存在</div>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
// 无需逻辑
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  min-height: 500px;
}

.content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  color: #409EFF;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-desc {
  font-size: 18px;
  color: #606266;
  margin: 20px 0 30px;
}
</style> 