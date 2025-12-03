// 用户信息
export interface UserInfo {
  userId: string
  username: string
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
}

// 店铺信息
export interface ShopInfo {
  shopId: string
  shopName: string
  mainPicUrl?: string
  desc?: string
  address?: string
  openTime?: string
  closeTime?: string
  status: number
  businessHours?: string
}

// 订单状态
export enum OrderStatus {
  PENDING = 1,        // 待支付
  PREPARING = 3,      // 备餐中
  WAITING_PICKUP = 4, // 待取餐
  FINISHED = 5,       // 已完成
  REFUNDING = 19,     // 退款中
  PAYMENT_ERROR = 20, // 金额异常
  TIMEOUT = 21,       // 支付超时
  CANCELED = 22,      // 已取消
  REFUNDED = 23,      // 已退款
  REFUND_FAILED = 24  // 退款失败
}

// 菜品信息
export interface DishInfo {
  dishId: string
  dishName: string
  price: number
  num: number
  qty?: number
}

// 订单信息
export interface OrderInfo {
  orderId: string
  systemctlNumber?: string
  status: OrderStatus
  createTime: string
  totalAmount: number
  actualPay?: number
  discountedPrice?: number
  totalPrice?: number
  userInfo?: {
    nickname?: string
  }
  dishInfoList?: DishInfo[]
  shopInfo?: ShopInfo
  pickupWindow?: string
  estimateServeTime?: string
  description?: string
  note?: string
  deliveryFee?: number
  goodsAmount?: number
}

// 统计数据
export interface DailyStatistics {
  buckets: Array<{
    key: string
    label: string
    count: number
  }>
  total: number
}

export interface WeeklyStatistics {
  date: string
  count: number
}

export interface OrderStatistics {
  dailyJson: DailyStatistics
  weeklyJson: WeeklyStatistics[]
}

// 今日实时统计
export interface TodayStatistics {
  totalNeedPayMop: number
  successOrderCount: number
}

// API 响应
export interface ApiResponse<T = any> {
  status: number
  message?: string
  data: T
}

// 分页响应
export interface PageResponse<T> {
  records: T[]
  total: number
  current: number
  size: number
}
