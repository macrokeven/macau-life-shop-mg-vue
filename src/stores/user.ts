import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo, ShopInfo } from '@/types'
import ServerApi from '@/utils/ServerApi'
import { MessagePlugin } from 'tdesign-vue-next'
import router from '@/router'
import { md5 } from 'js-md5'

export const useUserStore = defineStore('user', () => {
  // 狀態
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const shopInfo = ref<ShopInfo | null>(null)
  const isLogin = ref<boolean>(localStorage.getItem('isLogin') === 'true')

  // 安全存儲字符串到 localStorage
  function setStringSafe(key: string, value: any) {
    if (value != null) {
      localStorage.setItem(key, value.toString())
    } else {
      localStorage.setItem(key, '')
    }
  }

  // 安全存儲整數到 localStorage
  function setIntSafe(key: string, value: any) {
    if (value != null) {
      const intValue = typeof value === 'number' ? value : parseInt(value.toString()) || 0
      localStorage.setItem(key, intValue.toString())
    } else {
      localStorage.setItem(key, '0')
    }
  }

  // 保存員工用戶數據到 localStorage
  function saveStaffUserData(data: any) {
    console.log('========== 開始保存用戶資料 ==========')
    console.log('完整數據:', data)

    // 保存基本信息
    console.log('--- 基本信息 ---')
    setStringSafe('uid', data.uid)
    setIntSafe('staffIdentity', data.identity)
    setStringSafe('staffId', data.staffId)
    setStringSafe('shopId', data.shopId)
    setStringSafe('staffDesc', data.staffDesc)
    setStringSafe('createTime', data.createTime)

    // 保存用戶信息
    const userInfoData = data.userInfo
    console.log('--- 用戶信息 ---')
    console.log('userInfo:', userInfoData)

    if (userInfoData) {
      setStringSafe('uid', userInfoData.uid)
      setStringSafe('phoneNumber', userInfoData.phoneNumber)
      setStringSafe('roles', userInfoData.roles)
      setStringSafe('nickname', userInfoData.nickname)
      setStringSafe('description', userInfoData.description)
      setStringSafe('avatar', userInfoData.avatar)

      if (userInfoData.token) {
        console.log('存儲 token:', userInfoData.token)
        localStorage.setItem('token', userInfoData.token.toString())
        token.value = userInfoData.token.toString()
      } else {
        console.warn('⚠️ 警告: token 為 null')
      }

      const loginStatus = userInfoData.token != null
      localStorage.setItem('isLogin', loginStatus.toString())
      isLogin.value = loginStatus

      // 設置 userInfo 狀態
      userInfo.value = {
        userId: userInfoData.uid || '',
        username: userInfoData.username || '',
        nickname: userInfoData.nickname,
        avatar: userInfoData.avatar,
        phone: userInfoData.phoneNumber,
        email: userInfoData.email
      }
    } else {
      console.warn('⚠️ 警告: userInfo 為 null')
    }

    // 保存店鋪信息
    const shopInfoData = data.shopInfo
    console.log('--- 店鋪信息 ---')
    console.log('shopInfo:', shopInfoData)

    if (shopInfoData) {
      setStringSafe('shopId', shopInfoData.shopId)
      setStringSafe('shopName', shopInfoData.shopName)
      setStringSafe('mainPicUrl', shopInfoData.mainPicUrl)
      setStringSafe('shopDesc', shopInfoData.desc)
      setStringSafe('shopLocation', shopInfoData.location)
      setStringSafe('shopAddress', shopInfoData.address)
      setStringSafe('shopOpenTime', shopInfoData.openTime)
      setStringSafe('shopCloseTime', shopInfoData.closeTime)
      setIntSafe('shopStatus', shopInfoData.status)
      setStringSafe('shopBusinessHours', shopInfoData.businessHours)
      setStringSafe('shopSchoolId', shopInfoData.schoolId)

      // 設置 shopInfo 狀態
      shopInfo.value = {
        shopId: shopInfoData.shopId || '',
        shopName: shopInfoData.shopName || '',
        mainPicUrl: shopInfoData.mainPicUrl,
        desc: shopInfoData.desc,
        address: shopInfoData.address,
        openTime: shopInfoData.openTime,
        closeTime: shopInfoData.closeTime,
        status: shopInfoData.status || 1,
        businessHours: shopInfoData.businessHours
      }
    } else {
      console.warn('⚠️ 警告: shopInfo 為 null')
    }

    console.log('========== 用戶資料保存完成 ==========')
  }

  // 登錄
  async function login(username: string, password: string) {
    try {
      const res = await ServerApi.loginStaffByUsernameAndPassword(
        username,
        md5(password)
      )

      console.log('登錄響應:', res)

      if (!res) {
        console.error('登錄失敗: 響應為 null')
        MessagePlugin.error('網絡錯誤，服務器無響應')
        return false
      }

      if (res.status === 0 && res.data) {
        MessagePlugin.success('登錄成功')

        // 保存用戶數據
        try {
          console.log('開始保存用戶資料...')
          saveStaffUserData(res.data)
          console.log('用戶資料保存成功')
        } catch (e) {
          console.error('保存用戶資料失敗:', e)
          MessagePlugin.error(`保存用戶資料失敗: ${e}`)
          return false
        }

        router.push('/')
        return true
      } else {
        const errorMsg = res.message || (res as any).msg || '登錄失敗'
        console.error('登錄失敗:', errorMsg)
        MessagePlugin.error(errorMsg)
        return false
      }
    } catch (error) {
      console.error('登錄失敗:', error)
      MessagePlugin.error('網絡錯誤，請重試')
      return false
    }
  }

  // 獲取用戶信息
  async function getUserInfo() {
    try {
      const res = await ServerApi.getStaffInfoByUid()
      if (res && res.status === 0 && res.data) {
        userInfo.value = res.data

        // 從 localStorage 獲取店鋪信息
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
      console.error('獲取用戶信息失敗:', error)
    }
  }

  // 設置店鋪信息
  function setShopInfo(info: ShopInfo) {
    shopInfo.value = info

    // 保存到 localStorage
    setStringSafe('shopId', info.shopId)
    setStringSafe('shopName', info.shopName)
    setStringSafe('mainPicUrl', info.mainPicUrl)
    setStringSafe('shopDesc', info.desc)
    setStringSafe('shopAddress', info.address)
    setStringSafe('shopOpenTime', info.openTime)
    setStringSafe('shopCloseTime', info.closeTime)
    setIntSafe('shopStatus', info.status)
    setStringSafe('shopBusinessHours', info.businessHours)
  }

  // 退出登錄
  function logout() {
    token.value = ''
    userInfo.value = null
    shopInfo.value = null
    isLogin.value = false

    // 清除所有用戶相關的 localStorage 數據
    const keysToRemove = [
      'token',
      'isLogin',
      'uid',
      'staffIdentity',
      'staffId',
      'shopId',
      'staffDesc',
      'createTime',
      'phoneNumber',
      'roles',
      'nickname',
      'description',
      'avatar',
      'shopName',
      'mainPicUrl',
      'shopDesc',
      'shopLocation',
      'shopAddress',
      'shopOpenTime',
      'shopCloseTime',
      'shopStatus',
      'shopBusinessHours',
      'shopSchoolId'
    ]

    keysToRemove.forEach(key => localStorage.removeItem(key))

    router.push('/login')
  }

  return {
    token,
    userInfo,
    shopInfo,
    isLogin,
    login,
    getUserInfo,
    setShopInfo,
    logout
  }
})
