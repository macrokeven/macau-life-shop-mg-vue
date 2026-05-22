import api from '@/utils/JSLetoyService'
import type { AxiosError } from 'axios'

type FallCallback = ((error: AxiosError) => void) | null
type FinalCallback = (() => void) | null

interface DishOrder {
  shopId: string
  items: any[]
  totalAmount: number
  remark?: string
}

interface ApiInfo {
  id?: string
  apiName: string
  apiUrl: string
  apiMethod: string
  description?: string
}

const ServerApi = {
  // 员工登录（管理员/员工）
  loginStaffByUsernameAndPassword(
    username: string,
    password: string,
    fallCallBack?: FallCallback,
    onFinalCallBack?: FinalCallback
  ) {
    return api.noAuthorizationRequest(
      '/my-login/login-staff-by-username-and-password',
      'POST',
      null,
      { username, password },
      fallCallBack || null,
      onFinalCallBack || null
    )
  },

  // 获取员工信息
  getStaffInfoByUid(fallCallBack?: FallCallback, onFinalCallBack?: FinalCallback) {
    return api.authorizationRequest(
      '/staff-info/get-staff-info-by-uid',
      'GET',
      null,
      {},
      fallCallBack || null,
      onFinalCallBack || null
    )
  },

  UserInfo: {
    getUserInfosByFuzzyQueryNicknameAndPhoneNumber(
      nickname: string,
      phoneNumber: string,
      currentPage: number,
      pageSize: number,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        '/user-info/get-user-infos-by-fuzzy-query-nickname-and-phone-number',
        'POST',
        null,
        { nickname, phoneNumber, currentPage, pageSize },
        fallCallBack || null,
        onFinalCallBack || null
      )
    }
  },

  OrderInfo: {
    // 员工通过WebSocket获取当天订单信息
    getOrderInfoByEverydayStaffUseWS(
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        '/order-info/get-order-info-by-everyday-staff-use-ws',
        'GET',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 员工根据商店ID获取所有订单信息
    getAllOrderInfoByShopIdStaffUse(
      currentPage: number,
      pageSize: number,
      statusList: string[] | null = null,
      beginTime: string | null = null,
      endTime: string | null = null,
      orderId: string | null = null,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        '/order-info/get-all-order-info-by-shop-id-staff-use',
        'POST',
        null,
        { currentPage, pageSize, statusList, beginTime, endTime, orderId },
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 根据订单ID获取菜品订单
    getDishOrderById(
      orderId: string,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        `/order-info/get-dish-order-by-id/${orderId}`,
        'GET',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 订单统计
    orderStatistics(fallCallBack?: FallCallback, onFinalCallBack?: FinalCallback) {
      return api.authorizationRequest(
        '/order-info/order-statistics',
        'GET',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 根据商店获取今日实时订单统计
    todayRealTimeOrderStatisticsByShop(
      shopId: string,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        `/order-info/today-real-time-order-statistics-by-shop?shopId=${shopId}`,
        'GET',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 接单 - 生成取餐号
    receiveOrder(
      orderId: string,
      number: string | null = null,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      const url = number
        ? `/order-info/generate-number?orderId=${orderId}&number=${number}`
        : `/order-info/generate-number?orderId=${orderId}`
      return api.authorizationRequest(
        url,
        'PUT',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 管理员取货
    pickupOrderAdmin(
      orderId: string,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        `/order-info/pickup-admin-use?orderId=${orderId}`,
        'PUT',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 管理员退款
    refundOrderByAdmin(
      orderId: string,
      reason: string | null = null,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        '/wechat-api/refund-by-admin',
        'PUT',
        null,
        { orderId, reason },
        fallCallBack || null,
        onFinalCallBack || null
      )
    }
  },

  DishInfo: {
    // 获取店铺所有菜品信息
    getAllDishInfoByShopId(fallCallBack?: FallCallback, onFinalCallBack?: FinalCallback) {
      return api.authorizationRequest(
        '/dish-info/get-all-dish-info-by-shop-id',
        'GET',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 下架菜品
    offDish(
      dishIdList: string[],
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        '/dish-info/off-dish',
        'PUT',
        null,
        { dishIdList },
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 上架菜品
    shelfDish(
      dishIdList: string[],
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        '/dish-info/shelf-dish',
        'PUT',
        null,
        { dishIdList },
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 更新菜品数量
    updateDishAmount(
      amount: number,
      dishId: string,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        '/dish-info/update-dish-amount',
        'PUT',
        null,
        { amount, dishId },
        fallCallBack || null,
        onFinalCallBack || null
      )
    }
  },

  SetInfo: {
    // 开启套餐
    openMealSet(
      mealId: string,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        `/set-info/open-meal-set/${mealId}`,
        'PUT',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 关闭套餐
    closeMealSet(
      mealId: string,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        `/set-info/close-meal-set/${mealId}`,
        'PUT',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 创建套餐
    createMealSet(
      mealSet: Record<string, any>,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        '/set-info/create-meal-set',
        'POST',
        null,
        mealSet,
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 根据ID获取套餐
    getMealSetById(
      mealId: string,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        `/set-info/get-meal-set-by-id/${mealId}`,
        'GET',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 删除套餐
    deleteMealSet(
      mealId: string,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        `/set-info/delete-meal-set/${mealId}`,
        'DELETE',
        null,
        {},
        fallCallBack || null,
        onFinalCallBack || null
      )
    },

    // 更新套餐
    updateMealSet(
      mealSet: Record<string, any>,
      fallCallBack?: FallCallback,
      onFinalCallBack?: FinalCallback
    ) {
      return api.authorizationRequest(
        '/set-info/update-meal-set',
        'PUT',
        null,
        mealSet,
        fallCallBack || null,
        onFinalCallBack || null
      )
    }
  }
}

export default ServerApi
export type { DishOrder, ApiInfo }
