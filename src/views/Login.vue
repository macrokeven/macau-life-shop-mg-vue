<template>
  <div class="login-container">
    <!-- 左側品牌區域 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <i class="ri-store-2-fill"></i>
          </div>
        </div>
        <h1 class="brand-title">澳門生活商城</h1>
        <p class="brand-subtitle">Management System</p>
        <div class="brand-features">
          <div class="feature-item">
            <i class="ri-shield-check-line"></i>
            <span>安全可靠</span>
          </div>
          <div class="feature-item">
            <i class="ri-rocket-line"></i>
            <span>高效管理</span>
          </div>
          <div class="feature-item">
            <i class="ri-bar-chart-line"></i>
            <span>數據洞察</span>
          </div>
        </div>
      </div>
      <div class="brand-decoration">
        <div class="decoration-circle decoration-1"></div>
        <div class="decoration-circle decoration-2"></div>
        <div class="decoration-circle decoration-3"></div>
      </div>
    </div>

    <!-- 右側登錄區域 -->
    <div class="login-section">
      <div class="login-box">
        <div class="login-header">
          <h2>歡迎回來</h2>
          <p>請登錄您的管理賬戶</p>
        </div>

        <t-form
          ref="formRef"
          :data="formData"
          :rules="rules"
          label-align="top"
          @submit="handleSubmit"
          class="login-form"
        >
          <t-form-item label="用戶名" name="username">
            <t-input
              v-model="formData.username"
              placeholder="請輸入用戶名"
              clearable
              size="large"
              autofocus
            >
              <template #prefix-icon>
                <i class="ri-user-line"></i>
              </template>
            </t-input>
          </t-form-item>

          <t-form-item label="密碼" name="password">
            <t-input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="請輸入密碼"
              clearable
              size="large"
              @keyup.enter="handleSubmit"
            >
              <template #prefix-icon>
                <i class="ri-lock-line"></i>
              </template>
              <template #suffix-icon>
                <i
                  :class="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                ></i>
              </template>
            </t-input>
          </t-form-item>

          <div class="form-options">
            <t-checkbox v-model="rememberMe">記住密碼</t-checkbox>
          </div>

          <t-button
            theme="primary"
            type="submit"
            block
            size="large"
            :loading="loading"
            class="login-button"
          >
            <span v-if="!loading">登錄</span>
            <span v-else>登錄中...</span>
          </t-button>
        </t-form>

        <div class="login-footer">
          <p>© 2024 澳門生活商城. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { FormInstanceFunctions, FormRule } from 'tdesign-vue-next'

const userStore = useUserStore()

const formRef = ref<FormInstanceFunctions>()
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const rules: Record<string, FormRule[]> = {
  username: [
    { required: true, message: '请输入用户名', type: 'error' },
    { min: 3, message: '用户名至少3个字符', type: 'warning' }
  ],
  password: [
    { required: true, message: '请输入密码', type: 'error' },
    { min: 6, message: '密码至少6个字符', type: 'warning' }
  ]
}

onMounted(() => {
  const savedUsername = localStorage.getItem('remembered_username')
  const savedPassword = localStorage.getItem('remembered_password')
  if (savedUsername && savedPassword) {
    formData.username = savedUsername
    formData.password = savedPassword
    rememberMe.value = true
  }
})

async function handleSubmit({ validateResult }: { validateResult: boolean }) {
  if (!validateResult) return

  loading.value = true
  try {
    await userStore.login(formData.username, formData.password)

    if (rememberMe.value) {
      localStorage.setItem('remembered_username', formData.username)
      localStorage.setItem('remembered_password', formData.password)
    } else {
      localStorage.removeItem('remembered_username')
      localStorage.removeItem('remembered_password')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* 左側品牌區域 */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  overflow: hidden;
}

.brand-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
}

.logo-wrapper {
  margin-bottom: 40px;
  animation: fadeInDown 0.8s ease-out;
}

.logo-icon {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all var(--d-slow) var(--ease-std);
}

.logo-icon:hover {
  transform: translateY(-4px) scale(1.05);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.logo-icon i {
  font-size: 56px;
  color: white;
}

.brand-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: -1px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.brand-subtitle {
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.9;
  margin-bottom: 60px;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.brand-features {
  display: flex;
  gap: 40px;
  justify-content: center;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all var(--d-slow) var(--ease-std);
  min-width: 100px;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.feature-item i {
  font-size: 32px;
  color: white;
}

.feature-item span {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.95;
}

/* 裝飾元素 */
.brand-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  animation: float 20s infinite ease-in-out;
}

.decoration-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.decoration-2 {
  width: 300px;
  height: 300px;
  bottom: -80px;
  right: -80px;
  animation-delay: 7s;
}

.decoration-3 {
  width: 200px;
  height: 200px;
  top: 40%;
  right: 10%;
  animation-delay: 14s;
}

/* 右側登錄區域 */
.login-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 60px;
}

.login-box {
  width: 100%;
  max-width: 460px;
  animation: fadeInRight 0.8s ease-out;
}

.login-header {
  margin-bottom: 40px;
}

.login-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.login-header p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.login-form {
  margin-bottom: 32px;
}

.form-options {
  margin: -4px 0 28px 0;
}

.password-toggle {
  cursor: pointer;
  transition: all var(--d-fast) var(--ease-std);
  font-size: 18px;
  color: var(--text-tertiary);
}

.password-toggle:hover {
  color: var(--primary-color);
  transform: scale(1.1);
}

.password-toggle:active {
  transform: scale(0.95);
}

.login-button {
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  border-radius: var(--radius-md);
  transition: transform var(--d-base) var(--ease-std),
              box-shadow var(--d-base) var(--ease-std),
              background var(--d-fast) var(--ease-std);
  min-height: 44px;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-s2);
}

.login-button:active {
  transform: scale(var(--scale-press));
  box-shadow: var(--shadow-s1);
}

.login-footer {
  text-align: center;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.login-footer p {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

/* 動畫 - 使用設計指南的動效參數 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.08);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.92);
  }
}

/* 響應式設計 - 精細化移動端適配 */
@media (max-width: 1200px) {
  .brand-features {
    gap: 24px;
  }

  .feature-item {
    padding: 20px 16px;
    min-width: 90px;
  }

  .brand-title {
    font-size: 42px;
  }
}

@media (max-width: 1024px) {
  .brand-section {
    display: none;
  }

  .login-section {
    flex: 1;
    padding: 48px 32px;
  }

  .login-box {
    max-width: 480px;
  }
}

@media (max-width: 768px) {
  .login-header h2 {
    font-size: 28px;
  }

  .login-section {
    padding: 40px 24px;
  }

  .login-box {
    max-width: 100%;
  }

  .login-button {
    height: 52px;
    font-size: 17px;
  }
}

@media (max-width: 480px) {
  .login-section {
    padding: 32px 20px;
  }

  .login-header {
    margin-bottom: 32px;
  }

  .login-header h2 {
    font-size: 24px;
  }

  .login-header p {
    font-size: 14px;
  }

  .login-footer {
    margin-top: 32px;
    padding-top: 24px;
  }
}
</style>
