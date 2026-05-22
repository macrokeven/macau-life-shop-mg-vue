<template>
  <div class="dashboard">
    <!-- 統計卡片區域 -->
    <div class="stats-grid">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="stat-card"
        :class="`stat-${stat.theme}`"
      >
        <div class="stat-icon-wrapper">
          <div class="stat-icon">
            <i :class="stat.icon"></i>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-change" :class="stat.changeType">
            <i :class="stat.changeIcon"></i>
            <span>{{ stat.change }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 圖表區域 -->
    <div class="charts-grid">
      <!-- 訂單趨勢圖 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <h3>訂單趨勢</h3>
            <p>近7天訂單統計</p>
          </div>
          <div class="chart-actions">
            <button
              v-for="period in periods"
              :key="period.value"
              class="period-btn"
              :class="{ active: activePeriod === period.value }"
              @click="changePeriod(period.value)"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div class="chart-body">
          <div v-if="loading" class="chart-loading">
            <div class="loader"></div>
          </div>
          <div v-else ref="lineChartRef" class="chart-container"></div>
        </div>
      </div>

      <!-- 訂單狀態分佈 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <h3>訂單狀態</h3>
            <p>今日訂單分佈</p>
          </div>
        </div>
        <div class="chart-body">
          <div v-if="loading" class="chart-loading">
            <div class="loader"></div>
          </div>
          <div v-else ref="pieChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 最近訂單列表 -->
    <div class="recent-orders-card">
      <div class="card-header">
        <div class="card-title">
          <h3>最近訂單</h3>
          <span class="badge">{{ recentOrders.length }}</span>
        </div>
        <button class="view-all-btn" @click="viewAllOrders">
          查看全部 <i class="ri-arrow-right-line"></i>
        </button>
      </div>
      <div class="orders-list">
        <div v-for="order in recentOrders" :key="order.id" class="order-item">
          <div class="order-info">
            <div class="order-id">訂單 #{{ order.id }}</div>
            <div class="order-time">{{ order.time }}</div>
          </div>
          <div class="order-status" :class="`status-${order.status}`">
            {{ order.statusText }}
          </div>
          <div class="order-amount">¥{{ order.amount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ServerApi from '@/utils/ServerApi'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const activePeriod = ref('7d')
const lineChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
let lineChart: ECharts | null = null
let pieChart: ECharts | null = null

const periods = [
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' }
]

// 統計數據
const stats = ref([
  {
    label: '今日營收',
    value: '¥12,345',
    change: '+12.5%',
    changeType: 'up',
    changeIcon: 'ri-arrow-up-line',
    icon: 'ri-money-dollar-circle-line',
    theme: 'blue'
  },
  {
    label: '訂單數量',
    value: '156',
    change: '+8.2%',
    changeType: 'up',
    changeIcon: 'ri-arrow-up-line',
    icon: 'ri-file-list-3-line',
    theme: 'green'
  },
  {
    label: '客戶總數',
    value: '2,341',
    change: '+5.7%',
    changeType: 'up',
    changeIcon: 'ri-arrow-up-line',
    icon: 'ri-user-line',
    theme: 'purple'
  },
  {
    label: '完成率',
    value: '94.2%',
    change: '-1.3%',
    changeType: 'down',
    changeIcon: 'ri-arrow-down-line',
    icon: 'ri-checkbox-circle-line',
    theme: 'orange'
  }
])

// 最近訂單
const recentOrders = ref([
  { id: '20241204001', time: '10:30', status: 'completed', statusText: '已完成', amount: 128 },
  { id: '20241204002', time: '10:25', status: 'preparing', statusText: '備餐中', amount: 95 },
  { id: '20241204003', time: '10:20', status: 'pending', statusText: '待支付', amount: 156 },
  { id: '20241204004', time: '10:15', status: 'completed', statusText: '已完成', amount: 88 },
  { id: '20241204005', time: '10:10', status: 'completed', statusText: '已完成', amount: 203 }
])

onMounted(async () => {
  await nextTick()
  initCharts()
  await loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
})

async function loadData() {
  loading.value = true
  try {
    const shopId = localStorage.getItem("shopId") || ""

    // 获取今日实时统计
    const todayStatsRes = await ServerApi.OrderInfo.todayRealTimeOrderStatisticsByShop(
      shopId,
      (error) => {
        console.error('获取今日统计失败:', error)
      }
    )

    if (todayStatsRes && todayStatsRes.status === 0 && todayStatsRes.data) {
      const todayData = todayStatsRes.data
      // 更新今日营收 (分转元)
      if (stats.value[0]) {
        const revenue = (todayData.totalNeedPayMop || 0) / 100
        stats.value[0].value = `MOP ${revenue.toFixed(2)}`
      }
      // 更新订单数量
      if (stats.value[1]) {
        stats.value[1].value = `${todayData.successOrderCount || 0}`
      }
    }

    // 获取订单统计数据（用于图表）
    const orderStatsRes = await ServerApi.OrderInfo.orderStatistics(
      (error) => {
        console.error('获取订单统计失败:', error)
      }
    )

    if (orderStatsRes && orderStatsRes.status === 0 && orderStatsRes.data) {
      const statsData = orderStatsRes.data

      // 更新每日订单分布（饼图）
      if (statsData.dailyJson && statsData.dailyJson.buckets) {
        updatePieChart(statsData.dailyJson.buckets)
      }

      // 更新每周订单趋势（折线图）
      if (statsData.weeklyJson && Array.isArray(statsData.weeklyJson)) {
        updateLineChart(statsData.weeklyJson)
      }
    }
  } catch (error) {
    console.error('加載數據失敗:', error)
  } finally {
    loading.value = false
  }
}

function initCharts() {
  if (!lineChartRef.value || !pieChartRef.value) return

  // 初始化折線圖
  lineChart = echarts.init(lineChartRef.value)
  const lineOption = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: { color: '#333' },
      axisPointer: {
        type: 'cross',
        crossStyle: { color: '#999' }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [
      {
        name: '訂單數',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 82, 217, 0.3)' },
            { offset: 1, color: 'rgba(0, 82, 217, 0.05)' }
          ])
        },
        lineStyle: { width: 3, color: '#0052d9' },
        itemStyle: { color: '#0052d9' }
      }
    ]
  }
  lineChart.setOption(lineOption)

  // 初始化餅圖
  pieChart = echarts.init(pieChartRef.value)
  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: { color: '#333' }
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: { color: '#666' }
    },
    series: [
      {
        name: '訂單狀態',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 48, name: '已完成', itemStyle: { color: '#52c41a' } },
          { value: 25, name: '備餐中', itemStyle: { color: '#1890ff' } },
          { value: 15, name: '待取餐', itemStyle: { color: '#faad14' } },
          { value: 12, name: '其他', itemStyle: { color: '#d9d9d9' } }
        ]
      }
    ]
  }
  pieChart.setOption(pieOption)
}

function updateLineChart(weeklyData: any[]) {
  if (!lineChart) return

  // 提取日期和数量
  const dates = weeklyData.map(item => {
    const date = new Date(item.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  const counts = weeklyData.map(item => item.count || 0)

  lineChart.setOption({
    xAxis: {
      data: dates
    },
    series: [{
      data: counts
    }]
  })
}

function updatePieChart(buckets: any[]) {
  if (!pieChart) return

  // 状态映射（基于实际返回的 key 值）
  const statusMap: Record<string, { name: string; color: string }> = {
    'finished': { name: '已完成', color: '#52c41a' },
    'preparing': { name: '備餐中', color: '#1890ff' },
    'waiting_pickup': { name: '待取餐', color: '#faad14' },
    'pending': { name: '待支付', color: '#fa8c16' },
    'refunding': { name: '退款中', color: '#faad14' },
    'payment_error': { name: '金額異常', color: '#ff4d4f' },
    'timeout': { name: '支付超時', color: '#d9d9d9' },
    'canceled': { name: '已取消', color: '#d9d9d9' },
    'refunded': { name: '已退款', color: '#d9d9d9' }
  }

  // 过滤掉数量为 0 的状态
  const pieData = buckets
    .filter(bucket => bucket.count > 0)
    .map(bucket => ({
      value: bucket.count,
      name: statusMap[bucket.key]?.name || bucket.label || '其他',
      itemStyle: { color: statusMap[bucket.key]?.color || '#d9d9d9' }
    }))

  // 如果没有数据,显示默认提示
  if (pieData.length === 0) {
    pieData.push({
      value: 1,
      name: '暫無數據',
      itemStyle: { color: '#f0f0f0' }
    })
  }

  pieChart.setOption({
    series: [{
      data: pieData
    }]
  })
}

function handleResize() {
  lineChart?.resize()
  pieChart?.resize()
}

function changePeriod(period: string) {
  activePeriod.value = period
  // 重新加載數據
  loadData()
}

function viewAllOrders() {
  router.push('/order-manage')
}
</script>

<style scoped>
.dashboard {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

/* 統計卡片網格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--stat-color-from), var(--stat-color-to));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.stat-card.stat-blue {
  --stat-color-from: #0052d9;
  --stat-color-to: #1890ff;
}

.stat-card.stat-green {
  --stat-color-from: #52c41a;
  --stat-color-to: #73d13d;
}

.stat-card.stat-purple {
  --stat-color-from: #722ed1;
  --stat-color-to: #9254de;
}

.stat-card.stat-orange {
  --stat-color-from: #fa8c16;
  --stat-color-to: #ffa940;
}

.stat-icon-wrapper {
  flex-shrink: 0;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--stat-color-from), var(--stat-color-to));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon i {
  font-size: 32px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.stat-change.up {
  background: #f6ffed;
  color: #52c41a;
}

.stat-change.down {
  background: #fff2e8;
  color: #fa8c16;
}

/* 圖表網格 */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.chart-card:hover {
  box-shadow: var(--shadow-md);
}

.chart-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.chart-title p {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.period-btn {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-gray);
  transition: all 0.2s;
}

.period-btn:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
}

.period-btn.active {
  background: var(--primary-color);
  color: white;
}

.chart-body {
  padding: 20px;
  position: relative;
}

.chart-container {
  width: 100%;
  height: 320px;
}

.chart-loading {
  width: 100%;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 最近訂單卡片 */
.recent-orders-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.badge {
  padding: 4px 12px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: var(--primary-light);
}

.orders-list {
  padding: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: var(--radius-md);
  transition: all 0.2s;
  cursor: pointer;
}

.order-item:hover {
  background: var(--bg-hover);
}

.order-info {
  flex: 1;
}

.order-id {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.order-time {
  font-size: 13px;
  color: var(--text-tertiary);
}

.order-status {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.order-status.status-completed {
  background: #f6ffed;
  color: #52c41a;
}

.order-status.status-preparing {
  background: #e6f7ff;
  color: #1890ff;
}

.order-status.status-pending {
  background: #fff7e6;
  color: #fa8c16;
}

.order-amount {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
  }

  .stat-icon i {
    font-size: 28px;
  }

  .stat-value {
    font-size: 24px;
  }

  .chart-container {
    height: 280px;
  }
}
</style>
