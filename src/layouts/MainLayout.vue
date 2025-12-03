<template>
  <div class="main-layout">
    <t-layout>
      <!-- 侧边栏 -->
      <t-aside :width="sidebarCollapsed ? '64px' : '232px'" class="sidebar">
        <div class="sidebar-header">
          <div v-if="!sidebarCollapsed" class="logo">
            <i class="ri-store-2-line"></i>
            <span class="logo-text">澳门生活商城</span>
          </div>
          <div v-else class="logo-collapsed">
            <i class="ri-store-2-line"></i>
          </div>
        </div>
        <t-menu
          :value="activeMenu"
          :collapsed="sidebarCollapsed"
          theme="light"
          @change="handleMenuChange"
        >
          <t-menu-item value="dashboard">
            <template #icon>
              <i class="ri-dashboard-line"></i>
            </template>
            店铺仪表板
          </t-menu-item>
          <t-menu-item value="orders">
            <template #icon>
              <i class="ri-file-list-3-line"></i>
            </template>
            订单管理
          </t-menu-item>
        </t-menu>
      </t-aside>

      <t-layout>
        <!-- 顶部导航栏 -->
        <t-header class="header">
          <div class="header-left">
            <t-button
              variant="text"
              shape="square"
              @click="toggleSidebar"
            >
              <i class="ri-menu-line"></i>
            </t-button>
          </div>
          <div class="header-right">
            <t-dropdown :options="userMenuOptions" @click="handleUserMenuClick">
              <t-button variant="text" class="user-info">
                <i class="ri-user-line"></i>
                <span class="username">{{ userStore.userInfo?.username || '用户' }}</span>
                <i class="ri-arrow-down-s-line"></i>
              </t-button>
            </t-dropdown>
          </div>
        </t-header>

        <!-- 内容区 -->
        <t-content class="content">
          <div class="content-wrapper">
            <router-view />
          </div>
        </t-content>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import type { DropdownOption } from 'tdesign-vue-next'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)

const activeMenu = computed(() => {
  const name = route.name as string
  if (name === 'Dashboard') return 'dashboard'
  if (name === 'Orders') return 'orders'
  return ''
})

const userMenuOptions: DropdownOption[] = [
  {
    content: '退出登录',
    value: 'logout'
  }
]

function toggleSidebar() {
  appStore.toggleSidebar()
}

function handleMenuChange(value: string) {
  if (value === 'dashboard') {
    router.push('/dashboard')
  } else if (value === 'orders') {
    router.push('/orders')
  }
}

function handleUserMenuClick(data: DropdownOption) {
  if (data.value === 'logout') {
    userStore.logout()
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e7e7e7;
  transition: width 0.3s ease;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e7e7e7;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #0052d9;
}

.logo i {
  font-size: 24px;
}

.logo-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.logo-collapsed i {
  font-size: 24px;
  color: #0052d9;
}

.header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e7e7e7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left .ri-menu-line {
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info i {
  font-size: 16px;
}

.username {
  font-size: 14px;
}

.content {
  background: #f5f5f5;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.content-wrapper {
  padding: 24px;
}
</style>
