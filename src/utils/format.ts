import dayjs from 'dayjs'

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date | number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date | number): string {
  return formatDateTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间
 */
export function formatTime(date: string | Date | number): string {
  return formatDateTime(date, 'HH:mm:ss')
}

/**
 * 格式化金额（分转元）
 */
export function formatMoney(amount: number): string {
  if (amount === undefined || amount === null) return '0.00'
  return (amount / 100).toFixed(2)
}

/**
 * 格式化金额带货币符号
 */
export function formatMoneyWithSymbol(amount: number, symbol = '¥'): string {
  return `${symbol}${formatMoney(amount)}`
}

/**
 * 格式化订单状态
 */
export function formatOrderStatus(status: number): string {
  const statusMap: Record<number, string> = {
    1: '待接单',
    2: '已拒单',
    3: '备餐中',
    4: '待取货',
    5: '已完成',
    6: '已取消',
    7: '已退款'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取订单状态主题色
 */
export function getOrderStatusTheme(status: number): string {
  const themeMap: Record<number, string> = {
    1: 'warning',
    2: 'danger',
    3: 'primary',
    4: 'success',
    5: 'default',
    6: 'default',
    7: 'default'
  }
  return themeMap[status] || 'default'
}

/**
 * 格式化电话号码
 */
export function formatPhone(phone: string): string {
  if (!phone) return ''
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: string | Date | number): string {
  if (!date) return ''
  const now = dayjs()
  const target = dayjs(date)
  const diff = now.diff(target, 'minute')

  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  if (diff < 43200) return `${Math.floor(diff / 1440)}天前`
  return formatDateTime(date, 'YYYY-MM-DD')
}
