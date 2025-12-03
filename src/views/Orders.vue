<template>
  <div class="orders">
    <!-- 页面头部 -->
    <div class="page-header mb-6">
      <div>
        <h2 class="page-title">訂單管理</h2>
        <p class="page-desc">{{ totalText }}</p>
      </div>
      <div class="header-actions">
        <t-button variant="outline" @click="handleReset">
          <i class="ri-restart-line"></i> 重置
        </t-button>
        <t-button theme="primary" @click="handleRefresh">
          <i class="ri-refresh-line"></i> 刷新
        </t-button>
      </div>
    </div>

    <!-- 订单列表卡片 -->
    <t-card :bordered="false">
      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <t-row :gutter="16" class="mb-4">
          <t-col :xs="24" :md="12">
            <t-input
              v-model="searchKeyword"
              placeholder="輸入訂單號（前綴亦可）"
              clearable
              @enter="handleSearch"
            >
              <template #prefix-icon>
                <i class="ri-search-line"></i>
              </template>
            </t-input>
          </t-col>
          <t-col :xs="24" :md="12">
            <t-date-range-picker
              v-model="dateRange"
              placeholder="選擇日期範圍"
              clearable
              @change="handleSearch"
            />
          </t-col>
        </t-row>

        <div class="mb-4">
          <div class="filter-label">訂單狀態</div>
          <t-tag-input
            v-model="statusFilter"
            :tag-props="getTagProps"
          >
            <template #suffixIcon>
              <t-popup
                placement="bottom-right"
                trigger="click"
              >
                <template #content>
                  <t-checkbox-group
                    v-model="statusFilter"
                    :options="orderStatuses"
                    @change="handleSearch"
                  />
                </template>
                <t-button variant="text" size="small">
                  <i class="ri-filter-line"></i> 篩選
                </t-button>
              </t-popup>
            </template>
          </t-tag-input>
        </div>

        <div class="filter-actions">
          <t-button theme="primary" @click="handleSearch">
            <i class="ri-search-line"></i> 搜索
          </t-button>
        </div>
      </div>

      <!-- 表格 -->
      <t-table
        :data="orders"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        row-key="orderId"
        hover
        @page-change="handlePageChange"
        @row-click="handleRowClick"
      >
        <template #orderId="{ row }">
          <div>
            <div class="font-weight-bold">{{ row.systemctlNumber || '--' }}</div>
            <div class="text-muted text-sm">#{{ formatOrderId(row.orderId, row.createTime) }}</div>
          </div>
        </template>

        <template #dishInfo="{ row }">
          <div class="text-ellipsis">{{ formatDishSummary(row.dishInfoList) }}</div>
        </template>

        <template #userInfo="{ row }">
          <div class="user-cell">
            <i class="ri-user-line"></i>
            {{ row.userInfo?.nickname || '--' }}
          </div>
        </template>

        <template #amount="{ row }">
          <span class="font-weight-bold">
            {{ formatMoney(row.totalAmount || row.actualPay || row.discountedPrice || row.totalPrice) }}
          </span>
        </template>

        <template #status="{ row }">
          <t-tag :theme="getStatusTheme(row.status)" variant="light">
            {{ getStatusText(row.status) }}
          </t-tag>
        </template>

        <template #createTime="{ row }">
          <div class="text-sm">{{ formatDateTime(row.createTime) }}</div>
        </template>

        <template #actions="{ row }">
          <t-button
            theme="primary"
            variant="text"
            size="small"
            @click.stop="showOrderDetail(row.orderId)"
          >
            查看
          </t-button>
        </template>
      </t-table>
    </t-card>

    <!-- 订单详情弹窗 -->
    <t-dialog
      v-model:visible="showDetailModal"
      :header="`訂單詳情 ${currentOrderId}`"
      width="800px"
      :confirm-btn="null"
      cancel-btn="關閉"
    >
      <div v-if="loadingDetail" class="dialog-loading">
        <t-loading size="large" />
      </div>
      <div v-else-if="orderDetail" class="order-detail">
        <!-- 订单信息 -->
        <div class="detail-section">
          <t-row :gutter="16">
            <t-col :span="12">
              <div class="detail-item">
                <span class="detail-label">訂單號:</span>
                <span class="detail-value">{{ orderDetail.systemctlNumber }}</span>
              </div>
            </t-col>
            <t-col :span="12">
              <div class="detail-item">
                <span class="detail-label">狀態:</span>
                <t-tag :theme="getStatusTheme(orderDetail.status)" variant="light">
                  {{ getStatusText(orderDetail.status) }}
                </t-tag>
              </div>
            </t-col>
          </t-row>
          <t-row :gutter="16">
            <t-col :span="12">
              <div class="detail-item">
                <span class="detail-label">創建時間:</span>
                <span class="detail-value">{{ formatFullTime(orderDetail.createTime) }}</span>
              </div>
            </t-col>
            <t-col :span="12">
              <div class="detail-item">
                <span class="detail-label">取餐窗口:</span>
                <span class="detail-value">{{ orderDetail.pickupWindow || '--' }}</span>
              </div>
            </t-col>
          </t-row>
        </div>

        <!-- 店铺信息 -->
        <t-divider />
        <h4 class="section-title">店鋪信息</h4>
        <div class="detail-section">
          <div class="detail-item">
            <span class="detail-label">店鋪名稱:</span>
            <span class="detail-value">{{ orderDetail.shopInfo?.shopName || '--' }}</span>
          </div>
        </div>

        <!-- 菜品列表 -->
        <t-divider />
        <h4 class="section-title">菜品列表</h4>
        <t-table
          :data="orderDetail.orderDishList || []"
          :columns="dishColumns"
          size="small"
          :pagination="false"
        />

        <!-- 金额信息 -->
        <t-divider />
        <div class="amount-section">
          <div class="amount-row">
            <span>商品總額:</span>
            <span>{{ formatMoney(orderDetail.goodsAmount) }}</span>
          </div>
          <div class="amount-row">
            <span>配送費:</span>
            <span>{{ formatMoney(orderDetail.deliveryFee) }}</span>
          </div>
          <div class="amount-row total">
            <span>實付金額:</span>
            <span class="total-amount">{{ formatMoney(orderDetail.totalAmount) }}</span>
          </div>
        </div>

        <!-- 备注 -->
        <div v-if="orderDetail.note">
          <t-divider />
          <div class="detail-item">
            <span class="detail-label">備註:</span>
            <span class="detail-value">{{ orderDetail.note }}</span>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAllOrderInfoByShopIdStaffUse, getDishOrderById } from '@/api/order'
import { useUserStore } from '@/stores/user'
import { MessagePlugin } from 'tdesign-vue-next'
import type { TableProps, PaginationProps, TagProps } from 'tdesign-vue-next'
import { formatDateTime as formatDateTimeUtil, formatMoney as formatMoneyUtil } from '@/utils/format'

const userStore = useUserStore()

// 搜索条件
const searchKeyword = ref('')
const statusFilter = ref<number[]>([])
const dateRange = ref<[string, string] | null>(null)

// 订单列表
const orders = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 订单详情
const showDetailModal = ref(false)
const loadingDetail = ref(false)
const orderDetail = ref<any>(null)
const currentOrderId = ref('')

// 订单状态配置
const orderStatuses = [
  { label: '待支付', value: 1 },
  { label: '備餐中', value: 3 },
  { label: '待取餐', value: 4 },
  { label: '已完成', value: 5 },
  { label: '退款中', value: 19 },
  { label: '金額異常', value: 20 },
  { label: '支付超時', value: 21 },
  { label: '已取消', value: 22 },
  { label: '已退款', value: 23 }
]

const statusThemeMap: Record<number, string> = {
  1: 'warning',
  3: 'primary',
  4: 'success',
  5: 'default',
  19: 'warning',
  20: 'danger',
  21: 'default',
  22: 'default',
  23: 'default'
}

const totalText = computed(() => {
  return total.value > 0 ? `共 ${total.value} 條` : ''
})

const pagination = computed<PaginationProps>(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: total.value,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100]
}))

const columns: TableProps['columns'] = [
  {
    colKey: 'orderId',
    title: '訂單號',
    width: 180,
    cell: 'orderId'
  },
  {
    colKey: 'dishInfo',
    title: '菜品信息',
    minWidth: 250,
    cell: 'dishInfo'
  },
  {
    colKey: 'userInfo',
    title: '用戶',
    width: 140,
    align: 'center',
    cell: 'userInfo'
  },
  {
    colKey: 'amount',
    title: '金額',
    width: 120,
    align: 'center',
    cell: 'amount'
  },
  {
    colKey: 'status',
    title: '狀態',
    width: 100,
    align: 'center',
    cell: 'status'
  },
  {
    colKey: 'createTime',
    title: '時間',
    width: 130,
    align: 'center',
    cell: 'createTime'
  },
  {
    colKey: 'actions',
    title: '操作',
    width: 80,
    align: 'center',
    fixed: 'right',
    cell: 'actions'
  }
]

const dishColumns: TableProps['columns'] = [
  {
    colKey: 'dishName',
    title: '菜品名稱'
  },
  {
    colKey: 'num',
    title: '數量',
    width: 80,
    align: 'center',
    cell: ({ row }) => `x${row.num || row.qty || 1}`
  },
  {
    colKey: 'price',
    title: '單價',
    width: 120,
    align: 'right',
    cell: ({ row }) => formatMoney(row.price)
  }
]

onMounted(() => {
  fetchOrders()
})

async function fetchOrders() {
  loading.value = true

  try {
    const params = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      statusList: statusFilter.value.length > 0 ? statusFilter.value : null,
      beginTime: dateRange.value?.[0] ? `${dateRange.value[0]} 00:00:00` : null,
      endTime: dateRange.value?.[1] ? `${dateRange.value[1]} 23:59:59` : null,
      orderId: searchKeyword.value || null
    }

    const res = await getAllOrderInfoByShopIdStaffUse(params)

    if (res.status === 0) {
      const data = res.data

      if (Array.isArray(data)) {
        orders.value = data
        total.value = data.length
      } else if (data && typeof data === 'object') {
        orders.value = data.records || data.list || data.rows || data.items || []
        total.value = data.total || data.count || orders.value.length
      }
    } else {
      MessagePlugin.error(res.message || '獲取訂單列表失敗')
      orders.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('獲取訂單列表異常:', error)
    MessagePlugin.error('獲取訂單列表失敗')
    orders.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchOrders()
}

function handleReset() {
  searchKeyword.value = ''
  statusFilter.value = []
  dateRange.value = null
  currentPage.value = 1
  fetchOrders()
}

function handleRefresh() {
  fetchOrders()
}

function handlePageChange(pageInfo: any) {
  currentPage.value = pageInfo.current
  pageSize.value = pageInfo.pageSize
  fetchOrders()
}

function handleRowClick({ row }: any) {
  showOrderDetail(row.orderId)
}

async function showOrderDetail(orderId: string) {
  currentOrderId.value = orderId
  showDetailModal.value = true
  loadingDetail.value = true
  orderDetail.value = null

  try {
    const res = await getDishOrderById(orderId)

    if (res.status === 0 && res.data) {
      const data = res.data
      orderDetail.value = {
        shopInfo: data.shopInfo || {},
        systemctlNumber: data.systemctlNumber || '',
        status: data.status,
        orderId: data.orderId || '',
        createTime: data.createTime,
        orderDishList: data.dishInfoList || [],
        goodsAmount: data.totalPrice,
        deliveryFee: data.deliveryFee || 0,
        totalAmount: data.actualPay || data.discountedPrice || data.totalPrice,
        pickupWindow: data.pickupWindow || data.estimateServeTime || '',
        note: data.description || data.note || ''
      }
    } else {
      MessagePlugin.error(res.message || '獲取訂單詳情失敗')
    }
  } catch (error) {
    console.error('獲取訂單詳情異常:', error)
    MessagePlugin.error('獲取訂單詳情失敗')
  } finally {
    loadingDetail.value = false
  }
}

function formatMoney(amount: number | null | undefined): string {
  if (amount == null) return 'MOP 0.00'
  return formatMoneyUtil(amount)
}

function formatDateTime(time: string | null | undefined): string {
  if (!time) return '--'
  try {
    const date = new Date(time.replace(' ', 'T'))
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hour}:${minute}`
  } catch (e) {
    return time
  }
}

function formatFullTime(time: string | null | undefined): string {
  if (!time) return '--'
  try {
    const date = new Date(time.replace(' ', 'T'))
    return date.toLocaleString('zh-CN', { hour12: false })
  } catch (e) {
    return time
  }
}

function formatOrderId(orderId: string | null | undefined, createTime: string | null | undefined): string {
  if (!orderId) return '--'
  const shortId = orderId.substring(0, Math.min(8, orderId.length))

  if (!createTime) return shortId

  try {
    const date = new Date(createTime.replace(' ', 'T'))
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${shortId}-${year}${month}${day}`
  } catch (e) {
    return shortId
  }
}

function formatDishSummary(dishList: any[] | null | undefined): string {
  if (!dishList || dishList.length === 0) return '—'
  return dishList.map(dish => {
    const name = dish.dishName || ''
    const amount = dish.num || dish.qty || 1
    return `${name} x${amount}`
  }).join('、')
}

function getStatusText(status: number): string {
  const found = orderStatuses.find(s => s.value === status)
  return found ? found.label : '未知'
}

function getStatusTheme(status: number): string {
  return statusThemeMap[status] || 'default'
}

function getTagProps(tag: any): TagProps {
  const status = orderStatuses.find(s => s.value === tag)
  return {
    theme: getStatusTheme(tag),
    variant: 'light'
  }
}
</script>

<style scoped>
.orders {
  padding: 0;
}

.mb-6 {
  margin-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  margin: 0 0 4px 0;
}

.page-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-section {
  padding: 24px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 24px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #000;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
}

.font-weight-bold {
  font-weight: 600;
}

.text-muted {
  color: #999;
}

.text-sm {
  font-size: 13px;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.dialog-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.order-detail {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.detail-value {
  color: #000;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 12px 0;
}

.amount-section {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.amount-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e7e7e7;
  font-size: 16px;
  font-weight: 600;
}

.total-amount {
  color: #52c41a;
  font-size: 18px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions :deep(.t-button) {
    flex: 1;
  }
}
</style>
