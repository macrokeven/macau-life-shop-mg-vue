<template>
  <div class="not-found">
    <div class="content">
      <i class="ri-error-warning-line"></i>
      <h1>404</h1>
      <p>页面不存在</p>
      <t-button theme="primary" @click="goHome">返回首页</t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.content {
  text-align: center;
}

.content i {
  font-size: 120px;
  color: #ddd;
  margin-bottom: 24px;
}

.content h1 {
  font-size: 72px;
  font-weight: 600;
  color: #000;
  margin: 0 0 16px 0;
}

.content p {
  font-size: 18px;
  color: #666;
  margin: 0 0 32px 0;
}
</style>
