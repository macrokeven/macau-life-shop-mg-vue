<template>
  <div class="login-container">
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-box">
      <div class="login-header">
        <div class="icon-wrapper">
          <i class="ri-store-2-line"></i>
        </div>
        <h1>澳门生活商城</h1>
        <p>管理后台系统</p>
      </div>

      <t-form
        ref="formRef"
        :data="formData"
        :rules="rules"
        label-align="top"
        @submit="handleSubmit"
      >
        <t-form-item label="用户名" name="username">
          <t-input
            v-model="formData.username"
            placeholder="请输入用户名"
            clearable
            size="large"
            autofocus
          >
            <template #prefix-icon>
              <i class="ri-user-line"></i>
            </template>
          </t-input>
        </t-form-item>

        <t-form-item label="密码" name="password">
          <t-input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
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

        <t-form-item>
          <div class="remember-row">
            <t-checkbox v-model="rememberMe">记住密码</t-checkbox>
          </div>
        </t-form-item>

        <t-form-item>
          <t-button
            theme="primary"
            type="submit"
            block
            size="large"
            :loading="loading"
            class="login-button"
          >
            <span v-if="!loading">登录</span>
            <span v-else>登录中...</span>
          </t-button>
        </t-form-item>
      </t-form>

      <div class="login-footer">
        <p>© 2024 澳门生活商城 - 管理系统</p>
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation-delay: 5s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.icon-wrapper {
  display: inline-block;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.login-header i {
  font-size: 56px;
  color: #0052d9;
  display: block;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.login-header p {
  font-size: 15px;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.password-toggle {
  cursor: pointer;
  transition: color 0.2s;
  font-size: 18px;
}

.password-toggle:hover {
  color: #0052d9;
}

.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -8px;
  margin-bottom: 8px;
}

.login-button {
  margin-top: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 82, 217, 0.3);
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.login-footer p {
  font-size: 13px;
  color: #999;
  margin: 0;
}

@media (max-width: 480px) {
  .login-box {
    padding: 32px 24px;
    max-width: 100%;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-header i {
    font-size: 48px;
  }
}
</style>
