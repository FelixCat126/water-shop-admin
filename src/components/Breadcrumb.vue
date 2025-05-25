<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <span 
        v-if="index === breadcrumbs.length - 1" 
        class="no-redirect"
      >{{ item.meta.title }}</span>
      <router-link v-else :to="item.path">{{ item.meta.title }}</router-link>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = ref([])

// 获取面包屑导航
const getBreadcrumbs = () => {
  // 过滤掉没有设置title的路由
  let matched = route.matched.filter(item => item.meta && item.meta.title)
  
  // 如果第一个不是首页，就把首页放在第一个
  const first = matched[0]
  if (first && first.path !== '/') {
    matched = [{ path: '/', meta: { title: '首页' } }].concat(matched)
  }
  
  breadcrumbs.value = matched
}

watch(
  () => route.path,
  () => {
    getBreadcrumbs()
  },
  { immediate: true }
)
</script>

<style scoped>
.el-breadcrumb {
  line-height: 1.5;
  font-size: 14px;
}

.no-redirect {
  color: #97a8be;
  cursor: text;
}
</style> 