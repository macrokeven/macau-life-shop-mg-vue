import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo, ShopInfo } from '@/types'
import { loginStaff, getStaffInfo } from '@/api/auth'
import { MessagePlugin } from 'tdesign-vue-next'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const shopInfo = ref<ShopInfo | null>(null)

  // 登录
  async function login(username: string, password: string) {
    try {
      const res = await loginStaff(username, password)
      if (res.status === 0 && res.data) {
        token.value = res.data.token
        localStorage.setItem('token', res.data.token)

        // 登录成功后获取用户信息
        await getUserInfo()

        MessagePlugin.success('登录成功')
        router.push('/')
        return true
      } else {
        MessagePlugin.error(res.message || '登录失败')
        return false
      }
    } catch (error) {
      MessagePlugin.error('登录失败')
      return false
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      const res = await getStaffInfo()
      if (res.status === 0 && res.data) {
        userInfo.value = res.data

        // 从 localStorage 获取店铺信息
        const shopId = localStorage.getItem('shopId')
        const shopName = localStorage.getItem('shopName')
        if (shopId && shopName) {
          shopInfo.value = {
            shopId,
            shopName,
            mainPicUrl: localStorage.getItem('mainPicUrl') || undefined,
            desc: localStorage.getItem('shopDesc') || undefined,
            address: localStorage.getItem('shopAddress') || undefined,
            openTime: localStorage.getItem('shopOpenTime') || undefined,
            closeTime: localStorage.getItem('shopCloseTime') || undefined,
            status: parseInt(localStorage.getItem('shopStatus') || '1'),
            businessHours: localStorage.getItem('shopBusinessHours') || undefined
          }
        }

        return res.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 设置店铺信息
  function setShopInfo(info: ShopInfo) {
    shopInfo.value = info

    // 保存到 localStorage
    localStorage.setItem('shopId', info.shopId)
    localStorage.setItem('shopName', info.shopName)
    if (info.mainPicUrl) localStorage.setItem('mainPicUrl', info.mainPicUrl)
    if (info.desc) localStorage.setItem('shopDesc', info.desc)
    if (info.address) localStorage.setItem('shopAddress', info.address)
    if (info.openTime) localStorage.setItem('shopOpenTime', info.openTime)
    if (info.closeTime) localStorage.setItem('shopCloseTime', info.closeTime)
    localStorage.setItem('shopStatus', info.status.toString())
    if (info.businessHours) localStorage.setItem('shopBusinessHours', info.businessHours)
  }

  // 退出登录
  function logout() {
    token.value = ''
    userInfo.value = null
    shopInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('shopId')
    localStorage.removeItem('shopName')
    localStorage.removeItem('mainPicUrl')
    localStorage.removeItem('shopDesc')
    localStorage.removeItem('shopAddress')
    localStorage.removeItem('shopOpenTime')
    localStorage.removeItem('shopCloseTime')
    localStorage.removeItem('shopStatus')
    localStorage.removeItem('shopBusinessHours')
    router.push('/login')
  }

  return {
    token,
    userInfo,
    shopInfo,
    login,
    getUserInfo,
    setShopInfo,
    logout
  }
})
