<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <t-row :gutter="16" class="mb-6">
      <t-col :xs="12" :sm="6">
        <t-card :bordered="false" class="stat-card stat-card-red">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="ri-money-dollar-circle-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-label">今日營業總額</div>
              <div class="stat-value">{{ formatMoney(todayRevenue) }}</div>
              <div class="stat-footer">
                <i class="ri-calendar-line"></i> {{ currentDate }}
              </div>
            </div>
          </div>
        </t-card>
      </t-col>
      <t-col :xs="12" :sm="6">
        <t-card :bordered="false" class="stat-card stat-card-orange">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="ri-pie-chart-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-label">今日訂單數</div>
              <div class="stat-value">{{ todayOrderCount }} 單</div>
              <div class="stat-footer">
                <i class="ri-time-line"></i> 實時統計
              </div>
            </div>
          </div>
        </t-card>
      </t-col>
      <t-col :xs="12" :sm="6">
        <t-card :bordered="false" class="stat-card stat-card-green">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="ri-store-2-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-label">店舖狀態</div>
              <div class="stat-value">{{ shopStatus }}</div>
              <div class="stat-footer">
                <i class="ri-time-line"></i> {{ shopBusinessHours }}
              </div>
            </div>
          </div>
        </t-card>
      </t-col>
      <t-col :xs="12" :sm="6">
        <t-card :bordered="false" class="stat-card stat-card-blue">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="ri-building-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-label">店舖名稱</div>
              <div class="stat-value text-truncate">{{ shopName }}</div>
              <div class="stat-footer">
                <i class="ri-map-pin-line"></i> {{ shopAddress }}
              </div>
            </div>
          </div>
        </t-card>
      </t-col>
    </t-row>

    <!-- 店铺信息卡片 -->
    <t-card v-if="shopInfo" class="mb-6" :bordered="false">
      <div class="shop-info-wrapper">
        <div class="shop-image">
          <img
            :src="shopInfo.mainPicUrl || defaultShopImage"
            alt="店鋪圖片"
            @error="handleImageError"
          />
        </div>
        <div class="shop-details">
          <div class="shop-header">
            <h3>{{ shopInfo.shopName }}</h3>
            <t-tag
              :theme="shopInfo.status === 1 ? 'success' : 'warning'"
              variant="light"
            >
              {{ shopInfo.status === 1 ? '營業中' : '休息中' }}
            </t-tag>
          </div>
          <p class="shop-desc">{{ shopInfo.desc || '—' }}</p>
          <div class="shop-meta">
            <span>
              <i class="ri-time-line"></i>
              {{ shopInfo.businessHours || formatBusinessHours(shopInfo.openTime, shopInfo.closeTime) }}
            </span>
            <span>
              <i class="ri-map-pin-line"></i>
              {{ shopInfo.address || '—' }}
            </span>
          </div>
        </div>
      </div>
    </t-card>

    <!-- 图表区域 -->
    <t-row :gutter="16">
      <t-col :xs="24" :lg="10">
        <t-card :bordered="false" class="chart-card">
          <template #header>
            <div>
              <h3>每日訂單狀態分佈</h3>
              <p class="chart-subtitle">今日訂單：{{ totalOrders }} 單</p>
            </div>
          </template>
          <div v-if="loading" class="chart-loading">
            <t-loading size="large" />
          </div>
          <div v-else-if="dailyChartData.length === 0" class="chart-empty">
            <i class="ri-pie-chart-line"></i>
            <p>暫無數據</p>
          </div>
          <div v-else ref="pieChartRef" class="chart-container"></div>
        </t-card>
      </t-col>
      <t-col :xs="24" :lg="14">
        <t-card :bordered="false" class="chart-card">
          <template #header>
            <div>
              <h3>周訂單量趨勢</h3>
              <p class="chart-subtitle">近 7 天每日訂單數</p>
            </div>
          </template>
          <div v-if="loading" class="chart-loading">
            <t-loading size="large" />
          </div>
          <div v-else-if="weeklyChartData.length === 0" class="chart-empty">
            <i class="ri-bar-chart-line"></i>
            <p>暫無數據</p>
          </div>
          <div v-else ref="barChartRef" class="chart-container"></div>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { orderStatistics, todayRealTimeOrderStatisticsByShop } from '@/api/order'
import { getShopInfoById } from '@/api/shop'
import { MessagePlugin } from 'tdesign-vue-next'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { ShopInfo } from '@/types'

const userStore = useUserStore()

const loading = ref(true)
const shopInfo = ref<ShopInfo | null>(null)
const todayRevenue = ref(0)
const todayOrderCount = ref(0)
const dailySlices = ref<any[]>([])
const weeklyPoints = ref<any[]>([])
const defaultShopImage = ref('/img/default-shop.jpg')

const pieChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
let pieChart: ECharts | null = null
let barChart: ECharts | null = null

// 订单状态配置
const ORDER_STATUS_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: '待支付', color: '#ffc107' },
  3: { label: '備餐中', color: '#5e72e4' },
  4: { label: '待取餐', color: '#11cdef' },
  5: { label: '已完成', color: '#2dce89' },
  19: { label: '退款中', color: '#fb6340' },
  20: { label: '金額異常', color: '#f5365c' },
  21: { label: '支付超時', color: '#8965e0' },
  22: { label: '已取消', color: '#adb5bd' },
  23: { label: '已退款', color: '#172b4d' },
  24: { label: '退款失敗', color: '#f5365c' }
}

const shopName = computed(() => {
  return shopInfo.value?.shopName || userStore.shopInfo?.shopName || '店鋪'
})

const shopAddress = computed(() => {
  return shopInfo.value?.address || userStore.shopInfo?.address || '—'
})

const shopStatus = computed(() => {
  return shopInfo.value?.status === 1 ? '營業中' : '休息中'
})

const shopBusinessHours = computed(() => {
  if (shopInfo.value?.businessHours) {
    return shopInfo.value.businessHours
  }
  return formatBusinessHours(shopInfo.value?.openTime, shopInfo.value?.closeTime)
})

const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})

const totalOrders = computed(() => {
  return dailySlices.value.reduce((sum, item) => sum + item.count, 0)
})

const dailyChartData = computed(() => {
  const validSlices = dailySlices.value.filter(item => item.count > 0)
  return validSlices.map(item => {
    const statusCode = parseInt(item.key)
    const config = ORDER_STATUS_CONFIG[statusCode] || { label: item.label, color: '#6c757d' }
    return {
      name: config.label,
      value: item.count,
      itemStyle: { color: config.color }
    }
  })
})

const weeklyChartData = computed(() => {
  return weeklyPoints.value.map(point => ({
    date: point.date ? point.date.substring(5, 10) : '',
    count: point.count || 0
  }))
})

onMounted(async () => {
  await loadShopInfo()
  await loadDashboardData()
  await nextTick()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  barChart?.dispose()
})

async function loadShopInfo() {
  const cachedShopInfo = userStore.shopInfo
  if (cachedShopInfo) {
    shopInfo.value = cachedShopInfo
  }

  const shopId = userStore.shopInfo?.shopId
  if (shopId) {
    try {
      const res = await getShopInfoById(shopId)
      if (res.status === 0 && res.data) {
        shopInfo.value = res.data
        userStore.setShopInfo(res.data)
      }
    } catch (error) {
      console.error('獲取店鋪信息失敗:', error)
    }
  }
}

async function loadDashboardData() {
  loading.value = true
  const shopId = userStore.shopInfo?.shopId

  if (!shopId) {
    MessagePlugin.warning('未找到店鋪信息')
    loading.value = false
    return
  }

  try {
    const [statisticsRes, todayRes] = await Promise.all([
      orderStatistics(),
      todayRealTimeOrderStatisticsByShop(shopId)
    ])

    if (statisticsRes.status === 0 && statisticsRes.data) {
      const data = statisticsRes.data

      if (data.dailyJson && data.dailyJson.buckets) {
        dailySlices.value = normalizeDailySlices(data.dailyJson.buckets)
      }

      if (Array.isArray(data.weeklyJson)) {
        weeklyPoints.value = data.weeklyJson
      } else if (data.weeklyJson && Array.isArray(data.weeklyJson.points)) {
        weeklyPoints.value = data.weeklyJson.points
      }
    }

    if (todayRes.status === 0 && todayRes.data) {
      todayRevenue.value = todayRes.data.totalNeedPayMop || 0
      todayOrderCount.value = todayRes.data.successOrderCount || 0
    }
  } catch (error) {
    console.error('加載儀表板數據異常:', error)
    MessagePlugin.error('加載數據失敗')
  } finally {
    loading.value = false
  }
}

function normalizeDailySlices(buckets: any[]) {
  const acc: Record<string, number> = {}

  buckets.forEach(item => {
    const key = canonKey(item.key || '', item.label || '')
    const count = typeof item.count === 'number' ? item.count : parseInt(item.count || 0)
    acc[key] = (acc[key] || 0) + count
  })

  return Object.entries(acc).map(([key, count]) => ({
    key,
    label: canonLabel(key),
    count
  }))
}

function canonKey(rawKey: string, rawLabel: string): string {
  const key = rawKey.toString().toLowerCase().trim()
  const label = rawLabel.toString()

  const keyMap: Record<string, string> = {
    'pending': '1',
    'preparing': '3',
    'prepare': '3',
    'waiting_pickup': '4',
    'finished': '5',
    'refunding': '19',
    'payment_error': '20',
    'timeout': '21',
    'canceled': '22',
    'refunded': '23',
    'refund_failed': '24'
  }

  if (keyMap[key]) return keyMap[key]

  if (key === 'finish') {
    if (label.includes('待取') || label.includes('待提') ||
        label.includes('待領') || label.includes('待自取')) {
      return '4'
    }
    return '5'
  }

  const n = parseInt(key)
  return !isNaN(n) ? n.toString() : key
}

function canonLabel(code: string): string {
  const statusCode = parseInt(code)
  if (!isNaN(statusCode) && ORDER_STATUS_CONFIG[statusCode]) {
    return ORDER_STATUS_CONFIG[statusCode].label
  }
  return '其它'
}

function formatMoney(amount: number): string {
  const value = amount / 100.0
  return `MOP ${value.toFixed(2)}`
}

function formatBusinessHours(openTime?: string, closeTime?: string): string {
  if (!openTime || !closeTime) return '—'
  const open = openTime.substring(0, 5)
  const close = closeTime.substring(0, 5)
  return `${open} - ${close}`
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.src = defaultShopImage.value
}

function initCharts() {
  if (dailyChartData.value.length > 0 && pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        bottom: 10,
        left: 'center'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          data: dailyChartData.value
        }
      ]
    })
  }

  if (weeklyChartData.value.length > 0 && barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
    barChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: weeklyChartData.value.map(d => d.date),
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [
        {
          name: '訂單數',
          type: 'bar',
          barWidth: '60%',
          data: weeklyChartData.value.map(d => d.count),
          itemStyle: {
            color: '#0052d9',
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    })
  }
}

function handleResize() {
  pieChart?.resize()
  barChart?.resize()
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.mb-6 {
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
}

.stat-card :deep(.t-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-card-red {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.stat-card-red .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-card-orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
}

.stat-card-orange .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-card-green {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
  color: #fff;
}

.stat-card-green .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-card-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-card-blue .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-footer {
  font-size: 12px;
  opacity: 0.8;
}

.shop-info-wrapper {
  display: flex;
  align-items: center;
  gap: 24px;
}

.shop-image {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.shop-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-details {
  flex: 1;
  min-width: 0;
}

.shop-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.shop-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.shop-desc {
  color: #666;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.shop-meta {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #666;
}

.shop-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-card :deep(.t-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #e7e7e7;
}

.chart-card h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.chart-subtitle {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.chart-loading,
.chart-empty {
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.chart-empty i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.chart-empty p {
  margin: 0;
  font-size: 14px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .shop-info-wrapper {
    flex-direction: column;
    text-align: center;
  }

  .shop-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
