<template>
  <div class="main-layout">
    <Sidebar />
    <div class="layout-content">
      <div class="content-header">
        <div class="header-left">
          <button class="mobile-menu-btn" @click="toggleSidebar">
            <i class="ri-menu-line"></i>
          </button>
          <div class="breadcrumb">
            <i :class="currentRoute.icon"></i>
            <span>{{ currentRoute.title }}</span>
          </div>
        </div>
        <div class="header-right">
          <div class="header-time">
            {{ currentTime }}
          </div>
        </div>
      </div>
      <div class="content-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import dayjs from 'dayjs'

const route = useRoute()
const currentTime = ref('')

const routeMap: Record<string, { title: string; icon: string }> = {
  '/': { title: '儀表板', icon: 'ri-dashboard-line' },
  '/dashboard': { title: '儀表板', icon: 'ri-dashboard-line' },
  '/order-manage': { title: '訂單管理', icon: 'ri-file-list-3-line' },
  '/orders': { title: '訂單管理', icon: 'ri-file-list-3-line' },
  '/products': { title: '商品管理', icon: 'ri-product-hunt-line' },
  '/customers': { title: '客戶管理', icon: 'ri-user-line' },
  '/analytics': { title: '數據分析', icon: 'ri-bar-chart-box-line' },
  '/settings': { title: '系統設置', icon: 'ri-settings-3-line' }
}

const currentRoute = computed(() => {
  return routeMap[route.path] || { title: '頁面', icon: 'ri-file-line' }
})

const toggleSidebar = () => {
  console.log('Toggle sidebar')
}

const updateTime = () => {
  currentTime.value = dayjs().format('YYYY年MM月DD日 HH:mm:ss')
}

let timer: number

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000) as unknown as number
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background: var(--bg-color);
  overflow: hidden;
}

.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 頂部欄 */
.content-header {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;
  box-shadow: var(--shadow-s1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.mobile-menu-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: none;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all var(--d-base) var(--ease-std);
}

.mobile-menu-btn:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
  transform: scale(1.05);
}

.mobile-menu-btn:active {
  transform: scale(var(--scale-press));
}

.mobile-menu-btn i {
  font-size: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.breadcrumb i {
  font-size: 20px;
  color: var(--primary-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-time {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 主內容區 */
.content-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 32px;
  background: var(--bg-color);
}

.content-main::-webkit-scrollbar {
  width: 8px;
}

.content-main::-webkit-scrollbar-track {
  background: transparent;
}

.content-main::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.content-main::-webkit-scrollbar-thumb:hover {
  background: var(--border-dark);
}

/* 頁面切換動畫 - 使用設計指南的動效參數 */
.fade-slide-enter-active {
  transition: all var(--d-modal) var(--ease-in);
}

.fade-slide-leave-active {
  transition: all var(--d-base) var(--ease-out);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(var(--translate-light));
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--translate-light)));
}

/* 響應式設計 - 移動端優化 */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .content-header {
    height: 56px;
    padding: 0 20px;
  }

  .content-main {
    padding: 20px;
  }

  .header-time {
    display: none;
  }

  .breadcrumb {
    font-size: 15px;
  }

  .breadcrumb i {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .content-header {
    padding: 0 16px;
  }

  .content-main {
    padding: 16px;
  }
}
</style>
