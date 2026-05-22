<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Logo 區域 -->
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">
          <i class="ri-store-2-fill"></i>
        </div>
        <transition name="fade">
          <div v-if="!isCollapsed" class="logo-text">
            <h1>澳門生活</h1>
            <span>管理系統</span>
          </div>
        </transition>
      </div>
      <button class="collapse-btn" @click="toggleCollapse">
        <i :class="isCollapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'"></i>
      </button>
    </div>

    <!-- 導航菜單 -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div v-if="!isCollapsed" class="section-title">主要功能</div>
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="navigateTo(item.path)"
        >
          <i :class="item.icon"></i>
          <transition name="fade">
            <span v-if="!isCollapsed" class="nav-text">{{ item.label }}</span>
          </transition>
          <span v-if="!isCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </div>
      </div>
    </nav>

    <!-- 用戶信息 -->
    <div class="sidebar-footer">
      <div class="user-info" @click="showUserMenu = !showUserMenu">
        <div class="user-avatar">
          <img v-if="userInfo?.avatar" :src="userInfo.avatar" alt="avatar" />
          <i v-else class="ri-user-fill"></i>
        </div>
        <transition name="fade">
          <div v-if="!isCollapsed" class="user-details">
            <div class="user-name">{{ userInfo?.nickname || '管理員' }}</div>
            <div class="user-role">{{ shopInfo?.shopName || '系統管理' }}</div>
          </div>
        </transition>
        <transition name="fade">
          <i v-if="!isCollapsed" class="ri-more-fill user-menu-icon"></i>
        </transition>
      </div>

      <!-- 用戶菜單 -->
      <transition name="slide-up">
        <div v-if="showUserMenu && !isCollapsed" class="user-menu">
          <div class="user-menu-item" @click="handleLogout">
            <i class="ri-logout-box-line"></i>
            <span>登出</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapsed = ref(false)
const showUserMenu = ref(false)

const userInfo = computed(() => userStore.userInfo)
const shopInfo = computed(() => userStore.shopInfo)

const menuItems = ref([
  {
    path: '/dashboard',
    label: '儀表板',
    icon: 'ri-dashboard-line',
    badge: ''
  },
  {
    path: '/order-manage',
    label: '訂單管理',
    icon: 'ri-file-list-3-line',
    badge: ''
  },
  {
    path: '/products',
    label: '商品管理',
    icon: 'ri-product-hunt-line',
    badge: ''
  },
  {
    path: '/customers',
    label: '客戶管理',
    icon: 'ri-user-line',
    badge: ''
  },
  {
    path: '/analytics',
    label: '數據分析',
    icon: 'ri-bar-chart-box-line',
    badge: ''
  },
  {
    path: '/settings',
    label: '系統設置',
    icon: 'ri-settings-3-line',
    badge: ''
  }
])

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  if (isCollapsed.value) {
    showUserMenu.value = false
  }
}

const isActive = (path: string) => {
  return route.path === path
}

const navigateTo = (path: string) => {
  router.push(path)
}

const handleLogout = () => {
  userStore.logout()
  showUserMenu.value = false
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--d-modal) var(--ease-std);
  position: relative;
  z-index: 100;
  box-shadow: var(--shadow-s1);
}

.sidebar.collapsed {
  width: 80px;
}

/* Logo 區域 */
.sidebar-header {
  height: 72px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon i {
  font-size: 24px;
  color: white;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text h1 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

.logo-text span {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all var(--d-base) var(--ease-std);
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
  transform: scale(1.1);
}

.collapse-btn:active {
  transform: scale(var(--scale-press));
}

.collapse-btn i {
  font-size: 20px;
}

/* 導航菜單 */
.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.nav-section {
  margin-bottom: 24px;
}

.section-title {
  padding: 0 12px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 6px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--d-slow) var(--ease-std);
  position: relative;
  user-select: none;
  min-height: 44px;
  border: 1px solid transparent;
}

.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.nav-item i {
  font-size: 20px;
  flex-shrink: 0;
  transition: transform var(--d-fast) var(--ease-std);
}

.nav-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.nav-badge {
  padding: 3px 8px;
  background: var(--error-color);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
  line-height: 1.2;
  min-width: 20px;
  text-align: center;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
  border: 1px solid var(--border-light);
}

.collapsed .nav-item:hover {
  border: none;
}

.nav-item.active {
  background: var(--primary-light);
  color: var(--primary-color);
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: var(--primary-color);
  border-radius: 0 2px 2px 0;
  transition: height var(--d-base) var(--ease-std);
}

.nav-item.active:hover::before {
  height: 70%;
}

.collapsed .nav-item.active::before {
  display: none;
}

/* 用戶信息 */
.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--d-base) var(--ease-std);
  min-height: 44px;
}

.collapsed .user-info {
  justify-content: center;
  padding: 12px;
}

.user-info:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar i {
  font-size: 20px;
  color: white;
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu-icon {
  font-size: 20px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* 用戶菜單 */
.user-menu {
  position: absolute;
  bottom: 100%;
  left: 12px;
  right: 12px;
  margin-bottom: 12px;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-s3);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--d-base) var(--ease-std);
  min-height: 44px;
}

.user-menu-item:hover {
  background: var(--bg-hover);
  color: var(--error-color);
  padding-left: 20px;
}

.user-menu-item i {
  font-size: 18px;
}

.user-menu-item span {
  font-size: 14px;
  font-weight: 500;
}

/* 動畫 - 使用設計指南的動效參數 */
.fade-enter-active {
  transition: opacity var(--d-base) var(--ease-in);
}

.fade-leave-active {
  transition: opacity var(--d-fast) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all var(--d-base) var(--ease-in);
}

.slide-up-leave-active {
  transition: all var(--d-fast) var(--ease-out);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(var(--translate-light));
}

/* 響應式設計 - 移動端優化 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform var(--d-modal) var(--ease-std);
    box-shadow: var(--shadow-s3);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .sidebar-header {
    height: 64px;
    padding: 12px 16px;
  }

  .sidebar-nav {
    padding: 16px 12px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 240px;
  }

  .logo-text h1 {
    font-size: 15px;
  }

  .logo-text span {
    font-size: 11px;
  }
}
</style>
