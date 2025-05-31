<template>
  <div class="settings-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      
      <el-alert
        title="设置页面开发中"
        type="info"
        description="系统设置功能正在开发中，敬请期待..."
        show-icon
        :closable="false"
      />
      
      <div class="settings-section">
        <div class="section-title">基本设置</div>
        <el-form label-width="120px">
          <el-form-item label="系统名称">
            <el-input value="SPRINKLE" disabled />
          </el-form-item>
          <el-form-item label="系统版本">
            <el-input value="1.0.0" disabled />
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
// 设置页面逻辑
</script>

<style scoped>
.settings-container {
  padding: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdfe6;
}
</style> 