<template>
  <div class="dashboard-container">
    <!-- 统计数据展示 -->
    <div class="stats-section">
      <div class="stats-container">
        <div class="stat-item">
          <el-card shadow="hover" class="stat-card">
            <div class="card-body">
              <div class="icon-wrapper bg-primary">
                <el-icon><ShoppingCart /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-title">今日订单</div>
                <div class="stat-number">{{ stats.todayOrders }}</div>
                <div class="stat-desc">
                  <span :class="stats.orderTrend >= 0 ? 'text-success' : 'text-danger'">
                    <el-icon v-if="stats.orderTrend >= 0"><ArrowUp /></el-icon>
                    <el-icon v-else><ArrowDown /></el-icon>
                    {{ Math.abs(stats.orderTrend) }}%
                  </span>
                  较昨日
                </div>
              </div>
            </div>
          </el-card>
        </div>
        
        <div class="stat-item">
          <el-card shadow="hover" class="stat-card">
            <div class="card-body">
              <div class="icon-wrapper bg-success">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-title">今日销售额</div>
                <div class="stat-number">¥{{ stats.todaySales }}</div>
                <div class="stat-desc">
                  <span :class="stats.saleTrend >= 0 ? 'text-success' : 'text-danger'">
                    <el-icon v-if="stats.saleTrend >= 0"><ArrowUp /></el-icon>
                    <el-icon v-else><ArrowDown /></el-icon>
                    {{ Math.abs(stats.saleTrend) }}%
                  </span>
                  较昨日
                </div>
              </div>
            </div>
          </el-card>
        </div>
        
        <div class="stat-item">
          <el-card shadow="hover" class="stat-card">
            <div class="card-body">
              <div class="icon-wrapper bg-warning">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-title">新增用户</div>
                <div class="stat-number">{{ stats.newUsers }}</div>
                <div class="stat-desc">
                  <span :class="stats.userTrend >= 0 ? 'text-success' : 'text-danger'">
                    <el-icon v-if="stats.userTrend >= 0"><ArrowUp /></el-icon>
                    <el-icon v-else><ArrowDown /></el-icon>
                    {{ Math.abs(stats.userTrend) }}%
                  </span>
                  较昨日
                </div>
              </div>
            </div>
          </el-card>
        </div>
        
        <div class="stat-item">
          <el-card shadow="hover" class="stat-card">
            <div class="card-body">
              <div class="icon-wrapper bg-danger">
                <el-icon><Goods /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-title">商品总数</div>
                <div class="stat-number">{{ stats.totalProducts }}</div>
                <div class="stat-desc">
                  <span class="text-muted">库存紧张: {{ stats.lowStock }} 件</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 销售统计图表 -->
      <el-row :gutter="12" class="chart-row">
        <el-col :span="16">
          <el-card shadow="hover" class="chart-card sales-chart-card">
            <template #header>
              <div class="card-header">
                <span>销售趋势</span>
                <el-radio-group v-model="selectedPeriod">
                  <el-radio-button value="week">本周</el-radio-button>
                  <el-radio-button value="month">本月</el-radio-button>
                  <el-radio-button value="year">全年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <div id="sales-chart" class="chart-placeholder"></div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="chart-card ranking-card">
            <template #header>
              <div class="card-header">
                <span>商品销售排行</span>
                <div class="sort-buttons">
                  <el-button 
                    size="small" 
                    :type="rankingSortType === 'sales' ? 'primary' : ''" 
                    :plain="rankingSortType !== 'sales'"
                    @click="changeRankingSortType('sales')"
                  >
                    销量
                  </el-button>
                  <el-button 
                    size="small" 
                    :type="rankingSortType === 'amount' ? 'primary' : ''" 
                    :plain="rankingSortType !== 'amount'"
                    @click="changeRankingSortType('amount')"
                  >
                    金额
                  </el-button>
                </div>
              </div>
            </template>
            <div class="ranking-list">
              <div v-for="(item, index) in topProducts.slice(0, 7)" :key="index" class="ranking-item">
                <div class="ranking-index" :class="getRankingIndexClass(index)">{{ index + 1 }}</div>
                <div class="ranking-info">
                  <div class="ranking-name">
                    {{ item.name }}
                    <span class="ranking-stats">销量: {{ item.sales }} | 金额: ¥{{ item.amount }}</span>
                  </div>
                </div>
                <div class="ranking-value" :class="getPercentClass(index)">{{ item.percent }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 最新订单和商品销售占比 -->
      <el-row :gutter="12" class="data-row">
        <el-col :span="16">
          <el-card shadow="hover" class="order-card">
            <template #header>
              <div class="card-header">
                <span>最新订单</span>
                <el-button text type="primary" @click="goToOrderManagement">查看全部</el-button>
              </div>
            </template>
            <el-table 
              :data="latestOrders" 
              style="width: 100%" 
              size="small"
              :border="true"
              :fit="true"
              :header-cell-style="{background:'#fafafa', color:'#606266', height: '36px'}"
            >
              <el-table-column prop="orderNo" label="订单号" width="200" align="center">
                <template #default="scope">
                  <el-tooltip :content="scope.row.orderNo" placement="top">
                    <span class="order-no-text">{{ scope.row.orderNo }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="customer" label="客户" width="200" align="center">
                <template #default="scope">
                  <el-tooltip :content="scope.row.customer" placement="top">
                    <span class="customer-text">{{ scope.row.customer }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="金额" width="100" align="center">
                <template #default="scope">
                  ¥{{ scope.row.amount }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="80" align="center">
                <template #default="scope">
                  <el-tag
                    :type="getOrderStatusType(scope.row.status)"
                    size="small"
                  >
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="下单时间" min-width="140" align="center">
                <template #default="scope">
                  <el-tooltip :content="scope.row.createTime" placement="top">
                    <span class="create-time-text">{{ scope.row.createTime }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
    
        <el-col :span="8">
          <el-card shadow="hover" class="pie-card">
            <template #header>
              <div class="card-header">
                <span>商品销售占比</span>
                <div class="sort-buttons">
                  <el-button 
                    size="small" 
                    :type="pieSortType === 'sales' ? 'primary' : ''" 
                    :plain="pieSortType !== 'sales'"
                    @click="changePieSortType('sales')"
                  >
                    销量
                  </el-button>
                  <el-button 
                    size="small" 
                    :type="pieSortType === 'amount' ? 'primary' : ''" 
                    :plain="pieSortType !== 'amount'"
                    @click="changePieSortType('amount')"
                  >
                    金额
                  </el-button>
                </div>
              </div>
            </template>
            <div class="chart-container pie-container">
              <div id="pie-chart" class="chart-placeholder"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getOrderStats, getSalesTrends, getLatestOrders } from '../api/order'
import { getProductSales } from '../api/product'

// 路由实例
const router = useRouter()

// 图表时间范围
const selectedPeriod = ref('week')

// 监听时间范围变化，更新图表
watch(selectedPeriod, () => {
  initSalesChart()
})

// 统计数据
const stats = reactive({
  todayOrders: 0,
  orderTrend: 0,
  todaySales: 0,
  saleTrend: 0,
  newUsers: 0,
  userTrend: 0,
  totalProducts: 0,
  lowStock: 0
})

// 热销商品
const topProducts = ref([])
// 饼图产品数据
const pieProducts = ref([])
// 原始产品数据（用于排序）
const originalProductsData = ref([])
// 排行榜排序方式：'sales' | 'amount'
const rankingSortType = ref('sales')
// 饼图排序方式：'sales' | 'amount'  
const pieSortType = ref('sales')

// 最近订单
const latestOrders = ref([])

// 获取订单状态对应的标签类型
const getOrderStatusType = (status) => {
  const statusMap = {
    '已完成': 'success',
    '配送中': 'warning',
    '待付款': 'info',
    '已取消': 'danger',
    '待配送': 'primary'
  }
  return statusMap[status] || 'info'
}

// 跳转到订单管理页面
const goToOrderManagement = () => {
  router.push('/orders')
}

// 切换排行榜排序方式
const changeRankingSortType = (type) => {
  rankingSortType.value = type
  sortRankingProducts()
}

// 切换饼图排序方式
const changePieSortType = (type) => {
  pieSortType.value = type
  sortPieProducts()
  // 重新初始化饼图
  nextTick(() => {
    initPieChart()
  })
}

// 对排行榜产品数据进行排序
const sortRankingProducts = () => {
  if (!originalProductsData.value || originalProductsData.value.length === 0) {
    return
  }
  
  // 深度复制原始数据，确保完全独立
  const sortedData = originalProductsData.value.map(item => ({
    id: item.id,
    name: item.name,
    sales: item.sales,
    amount: item.amount,
    percent: 0
  }))
  
  // 根据排序类型排序
  if (rankingSortType.value === 'sales') {
    sortedData.sort((a, b) => b.sales - a.sales)
  } else if (rankingSortType.value === 'amount') {
    sortedData.sort((a, b) => b.amount - a.amount)
  }
  
  // 重新计算百分比
  const total = sortedData.reduce((sum, item) => {
    return sum + (rankingSortType.value === 'sales' ? item.sales : item.amount)
  }, 0)
  
  sortedData.forEach(item => {
    if (rankingSortType.value === 'sales') {
      item.percent = total > 0 ? Math.round((item.sales / total) * 100) : 0
    } else {
      item.percent = total > 0 ? Math.round((item.amount / total) * 100) : 0
    }
  })
  
  topProducts.value = sortedData
}

// 对饼图产品数据进行排序
const sortPieProducts = () => {
  if (!originalProductsData.value || originalProductsData.value.length === 0) {
    return
  }
  
  // 深度复制原始数据，确保完全独立
  const sortedData = originalProductsData.value.map(item => ({
    id: item.id,
    name: item.name,
    sales: item.sales,
    amount: item.amount,
    percent: 0
  }))
  
  // 根据排序类型排序
  if (pieSortType.value === 'sales') {
    sortedData.sort((a, b) => b.sales - a.sales)
  } else if (pieSortType.value === 'amount') {
    sortedData.sort((a, b) => b.amount - a.amount)
  }
  
  // 重新计算百分比
  const total = sortedData.reduce((sum, item) => {
    return sum + (pieSortType.value === 'sales' ? item.sales : item.amount)
  }, 0)
  
  sortedData.forEach(item => {
    if (pieSortType.value === 'sales') {
      item.percent = total > 0 ? Math.round((item.sales / total) * 100) : 0
    } else {
      item.percent = total > 0 ? Math.round((item.amount / total) * 100) : 0
    }
  })
  
  pieProducts.value = sortedData
}

// 初始化饼图
const initPieChart = () => {
  const chartDom = document.getElementById('pie-chart')
  if (!chartDom) {
    console.error('饼图容器未找到')
    return
  }
  
  if (pieChart) {
    pieChart.dispose()
  }
  
  pieChart = echarts.init(chartDom)
  
  // 如果没有数据，显示加载中
  if (!pieProducts.value || pieProducts.value.length === 0) {
    console.log('饼图数据为空，显示加载中')
    pieChart.showLoading({
      text: '加载中...',
      maskColor: 'rgba(255, 255, 255, 0.8)'
    })
    return
  }
  
  console.log('初始化饼图，产品数据:', pieProducts.value)
  pieChart.hideLoading()
  
  // 饼图颜色
  const pieColors = [
    '#1890FF', '#36CBCB', '#4ECB73', '#FBD437', '#F2637B', 
    '#975FE4', '#36A3F7', '#58D1C9', '#F5A623', '#E74C3C'
  ]
  
  // 准备饼图数据，根据排序类型选择显示的值
  const pieData = pieProducts.value.slice(0, 7).map((item, index) => ({
    name: item.name,
    value: pieSortType.value === 'sales' ? item.sales : item.amount,
    itemStyle: {
      color: pieColors[index % pieColors.length]
    }
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const unit = pieSortType.value === 'sales' ? '销量' : '金额'
        const value = pieSortType.value === 'sales' ? params.value : `¥${params.value}`
        return `${params.seriesName} <br/>${params.name}: ${value} (${params.percent}%)`
      }
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      },
      data: pieProducts.value.slice(0, 7).map(item => item.name)
    },
    series: [
      {
        name: pieSortType.value === 'sales' ? '销量占比' : '金额占比',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['30%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{d}%',
          fontSize: 12,
          color: '#fff'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  }
  
  pieChart.setOption(option)
  console.log('饼图初始化完成')
}

// 获取百分比样式类
const getPercentClass = (index) => {
  if (index === 0) return 'percent-first'
  if (index === 1) return 'percent-second'
  if (index === 2) return 'percent-third'
  return ''
}

// 获取排行序号样式类
const getRankingIndexClass = (index) => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return ''
}

// 销售图表和饼图实例
let salesChart = null
let pieChart = null

// 初始化销售趋势图表
const initSalesChart = async () => {
  const chartDom = document.getElementById('sales-chart')
  if (!chartDom) {
    console.error('销售图表容器未找到')
    return
  }

  if (salesChart) {
    salesChart.dispose()
  }
  
  salesChart = echarts.init(chartDom)
  
  // 显示加载中
  salesChart.showLoading({
    text: '加载中...',
    maskColor: 'rgba(255, 255, 255, 0.8)'
  })
  
  try {
    // 从API获取销售趋势数据
    const response = await getSalesTrends(selectedPeriod.value)
    salesChart.hideLoading()
    
    if (response && response.success && response.data && response.data.salesTrends) {
      const trendData = response.data.salesTrends[selectedPeriod.value]
      console.log('销售趋势数据:', trendData)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['销售额', '订单数'],
          top: 'top',
          left: 'center'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: trendData.xAxis || [],
          axisLabel: {
            interval: 0,
            rotate: selectedPeriod.value === 'month' ? 45 : 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额',
            axisLabel: {
              formatter: '{value} 元'
            }
          },
          {
            type: 'value',
            name: '订单数',
            position: 'right',
            axisLabel: {
              formatter: '{value} 单'
            }
          }
        ],
        series: [
          {
            name: '销售额',
            type: 'bar',
            data: trendData.salesData || [],
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '订单数',
            type: 'line',
            yAxisIndex: 1,
            data: trendData.orderData || [],
            itemStyle: {
              color: '#E6A23C'
            }
          }
        ]
      }
      
      salesChart.setOption(option)
      console.log('销售图表初始化完成')
    } else {
      console.error('获取销售趋势数据失败或返回数据格式不正确')
      // 显示空状态
      salesChart.setOption({
        title: {
          text: '暂无销售趋势数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        }
      })
    }
  } catch (error) {
    console.error('获取销售趋势数据出错:', error)
    salesChart.hideLoading()
    // 显示错误状态
    salesChart.setOption({
      title: {
        text: '加载销售趋势数据失败',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#f56c6c',
          fontSize: 16
        }
      }
    })
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (salesChart) {
    salesChart.resize()
  }
  if (pieChart) {
    pieChart.resize()
  }
}

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    // 获取统计数据
    const statsResponse = await getOrderStats()
    if (statsResponse && statsResponse.success && statsResponse.data) {
      const data = statsResponse.data
      // 更新统计数据
      stats.todayOrders = data.todayOrders || 0
      stats.orderTrend = data.orderTrend || 0
      stats.todaySales = data.todaySales || 0
      stats.saleTrend = data.saleTrend || 0
      stats.newUsers = data.newUsers || 0
      stats.userTrend = data.userTrend || 0
      stats.totalProducts = data.totalProducts || 0
      stats.lowStock = data.lowStockProducts || 0
    } else {
      console.error('获取仪表盘数据失败:', statsResponse)
      ElMessage.error('获取仪表盘数据失败')
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    ElMessage.error('获取仪表盘数据失败')
  }
}

// 获取最新订单数据
const fetchLatestOrders = async () => {
  try {
    const response = await getLatestOrders(8) // 获取8条最新订单
    if (response && response.success) {
      latestOrders.value = response.data || []
    } else {
      console.error('获取最新订单数据失败')
      latestOrders.value = []
    }
  } catch (error) {
    console.error('获取最新订单数据失败:', error)
    latestOrders.value = []
  }
}

// 获取真实的商品销售数据
const fetchProductSales = async () => {
  try {
    console.log('开始获取商品销售数据...')
    const response = await getProductSales()
    if (response && response.success && response.data) {
      console.log('获取到商品销售数据:', response.data)
      originalProductsData.value = response.data
      sortRankingProducts() // 初始化排行榜数据
      sortPieProducts() // 初始化饼图数据
    } else {
      console.error('获取商品销售数据失败:', response)
      // 如果API失败，使用备用的模拟数据
      console.log('使用备用模拟数据')
      originalProductsData.value = generateMockProductSales()
      sortRankingProducts() // 初始化排行榜数据
      sortPieProducts() // 初始化饼图数据
    }
  } catch (error) {
    console.error('获取商品销售数据出错:', error)
    // API出错时使用模拟数据作为备份
    console.log('API出错，使用备用模拟数据')
    originalProductsData.value = generateMockProductSales()
    sortRankingProducts() // 初始化排行榜数据
    sortPieProducts() // 初始化饼图数据
  }
}

// 生成基于真实SPRINKLE产品的销售数据（解决数据重复问题）
const generateMockProductSales = () => {
  const productNames = [
    'SPRINKLE 纯净水 350ml',
    'SPRINKLE 矿泉水 500ml', 
    'SPRINKLE 山泉水 1L',
    'SPRINKLE 苏打水 330ml',
    'SPRINKLE 饮用纯净水 1.5L',
    'SPRINKLE 天然矿泉水 2L',
    'SPRINKLE 气泡水 330ml'
  ];
  
  // 预设不同的销量，确保数据不重复
  const salesNumbers = [1520, 1230, 980, 820, 760, 640, 580];
  const prices = [2.00, 2.50, 3.00, 3.50, 4.00, 4.50, 5.50];
  
  const salesData = [];
  let totalSales = 0;
  
  // 为每个产品生成唯一的销售数据
  productNames.forEach((name, index) => {
    const sales = salesNumbers[index];
    const amount = sales * prices[index];
    
    salesData.push({
      name,
      sales,
      amount: Math.round(amount * 100) / 100
    });
    
    totalSales += sales;
  });
  
  // 计算百分比
  salesData.forEach(item => {
    item.percent = Math.round((item.sales / totalSales) * 100);
  });
  
  // 已经按销量排序，无需再次排序
  return salesData;
}

onMounted(async () => {
  // 获取仪表盘数据
  await fetchDashboardData()
  
  // 获取最新订单数据
  await fetchLatestOrders()
  
  // 获取真实的商品销售数据
  await fetchProductSales()
  
  // 使用nextTick确保DOM完全渲染后再初始化图表
  await nextTick()
  
  // 延迟初始化图表，确保容器已经有正确的尺寸
  setTimeout(async () => {
    // 初始化销售趋势图表 - 使用真实API数据
    await initSalesChart()
    
    // 初始化饼图
    initPieChart()
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)
    
    // 初始化后立即调整图表大小以适应容器
    setTimeout(() => {
      handleResize()
    }, 100)
  }, 500)
})

// 组件销毁前清理
onBeforeUnmount(() => {
  // 移除事件监听器
  window.removeEventListener('resize', handleResize)
  
  // 释放图表实例
  if (salesChart) {
    salesChart.dispose()
    salesChart = null
  }
  
  if (pieChart) {
    pieChart.dispose()
    pieChart = null
  }
})

// 这个函数已被替换为下方新的实现
</script>

<style scoped>
.dashboard-container {
  padding: 0;
  margin: 0;
  width: 100%;
  height: calc(100vh - 60px);
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.dashboard-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 统计区域样式 */
.stats-section {
  background: transparent;
  padding: 24px 24px 12px 24px;
  margin: -24px -24px 0 -24px;
  flex-shrink: 0;
}

.stats-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: calc(66.67% - 6px); /* 精确对齐销售趋势图表右侧，考虑gutter间距 */
  max-width: 1200px;
}

.stat-item {
  flex: 1;
  margin-right: 12px;
}

.stat-item:last-child {
  margin-right: 0;
}

.stat-card {
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  background: white;
  /* 移除鼠标焦点特效 */
}

.stat-card .el-card__body {
  padding: 20px;
  height: 100%;
  background: white;
}

.card-body {
  display: flex;
  align-items: center;
  height: 100%;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  margin-left: 8px;
}

.icon-wrapper .el-icon {
  font-size: 30px;
  color: white;
}

.bg-primary {
  background: linear-gradient(135deg, #409EFF 0%, #3A8EE6 100%);
}

.bg-success {
  background: linear-gradient(135deg, #67C23A 0%, #5DAE28 100%);
}

.bg-warning {
  background: linear-gradient(135deg, #E6A23C 0%, #D19E34 100%);
}

.bg-danger {
  background: linear-gradient(135deg, #F56C6C 0%, #E85D5D 100%);
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 6px;
  font-weight: 500;
}

.stat-number {
  font-size: 26px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 6px;
  line-height: 1;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}

.text-success {
  color: #67C23A;
}

.text-danger {
  color: #F56C6C;
}

.text-muted {
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  line-height: 1;
}

.sort-buttons {
  display: flex;
  gap: 8px;
}

.sort-buttons .el-button {
  padding: 4px 8px;
  font-size: 12px;
  height: 24px;
}

/* 趋势图按钮样式，与排序按钮保持一致 */
.el-radio-group .el-radio-button__inner {
  padding: 4px 8px;
  font-size: 12px;
  height: 24px;
  line-height: 16px;
  border-radius: 4px;
}

.el-radio-group .el-radio-button:first-child .el-radio-button__inner {
  border-radius: 4px 0 0 4px;
}

.el-radio-group .el-radio-button:last-child .el-radio-button__inner {
  border-radius: 0 4px 4px 0;
}

.chart-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sales-chart-card, .ranking-card {
  height: 360px; /* 统一卡片高度 */
}

.chart-container {
  flex: 1;
  min-height: 300px; /* 确保图表容器有最小高度 */
  height: 300px; /* 设置固定高度 */
}

/* 统一卡片样式 */
:deep(.el-card__header) {
  padding: 0;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 8px;
  flex: 1;
  overflow: hidden;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  min-height: 320px; /* 增加高度确保内容完整显示 */ /* 确保图表有最小高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  color: #909399;
  font-size: 14px;
}

.ranking-list {
  padding: 4px 0 8px 0;
  height: 320px; /* 增加高度确保内容完整显示 */ /* 设置固定高度 */
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #ebeef5;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-index {
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  max-width: 24px;
  max-height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  background-color: #f0f2f5;
  margin-right: 10px;
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}

.rank-first {
  background-color: #F56C6C;
  color: white;
}

.rank-second {
  background-color: #E6A23C;
  color: white;
}

.rank-third {
  background-color: #409EFF;
  color: white;
}

.ranking-info {
  flex: 1;
}

.ranking-name {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.ranking-stats {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
  flex: 1;
}

.ranking-desc {
  font-size: 12px;
  color: #909399;
}

.ranking-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-left: 20px;
}

.percent-first {
  color: #F56C6C;
  font-weight: bold;
}

.percent-second {
  color: #E6A23C;
  font-weight: bold;
}

.percent-third {
  color: #409EFF;
  font-weight: bold;
}

.pie-card {
  height: 360px; /* 统一卡片高度 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pie-container {
  flex: 1;
  min-height: 320px; /* 增加高度确保内容完整显示 */ /* 确保图表有最小高度 */
}

.order-card {
  height: 360px; /* 统一卡片高度 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.order-card :deep(.el-card__body) {
  padding: 0;
  flex: 1;
  overflow: hidden;
}

:deep(.el-table--small .el-table__cell) {
  padding: 4px 0;
}

/* 移除所有按钮的焦点边框 */
.el-button:focus,
.el-button:focus-visible,
.el-radio-button__inner:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  border: 1px solid #dcdfe6 !important;
}

.el-button--text:focus,
.el-button--text:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
}

.el-radio-button__inner:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 12px 0 24px 0; /* 增加底部内边距确保内容不被切断 */
  display: flex;
  flex-direction: column;
  min-height: 0; /* 允许内容收缩 */
}

.chart-row {
  margin-bottom: 20px;
  flex-shrink: 0; /* 防止图表行被压缩 */
}

.data-row {
  margin-bottom: 0;
  flex-shrink: 0; /* 防止数据行被压缩 */
}

/* 表格文本溢出样式 */
.order-no-text,
.customer-text,
.create-time-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}

/* 响应式设计 - 小屏幕适配 */
@media (max-height: 800px) {
  .dashboard-container {
    height: auto;
    min-height: calc(100vh - 60px);
    padding-bottom: 20px;
  }
  
  .stats-section {
    padding: 16px 24px 8px 24px;
  }
  
  .stat-card {
    height: 100px; /* 增加高度避免内容被遮挡 */
  }
  
  .icon-wrapper {
    width: 48px;
    height: 48px;
    margin-right: 16px;
  }
  
  .icon-wrapper .el-icon {
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 22px;
  }
  
  .sales-chart-card, .ranking-card, .pie-card, .order-card {
    height: 350px; /* 增加高度确保内容完整显示 */
  }
  
  .chart-container {
    min-height: 260px;
    height: 260px;
  }
  
  .chart-placeholder {
    min-height: 240px;
  }
  
  .ranking-list {
    height: 240px;
  }
  
  .pie-container {
    min-height: 240px;
  }
}

@media (max-height: 700px) {
  .stats-section {
    padding: 12px 24px 6px 24px;
  }
  
  .stat-card {
    height: 90px; /* 增加高度避免内容被遮挡 */
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .icon-wrapper .el-icon {
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .sales-chart-card, .ranking-card, .pie-card, .order-card {
    height: 320px; /* 增加高度确保内容完整显示 */
  }
  
  .chart-container {
    min-height: 220px;
    height: 220px;
  }
  
  .chart-placeholder {
    min-height: 200px;
  }
  
  .ranking-list {
    height: 200px;
  }
  
  .pie-container {
    min-height: 200px;
  }
  
  .main-content {
    padding: 8px 0 16px 0;
  }
  
  .chart-row {
    margin-bottom: 16px;
  }
}

/* 响应式设计 - 小屏幕适配 */
@media (max-height: 800px) {
  .dashboard-container {
    height: auto;
    min-height: calc(100vh - 60px);
    padding-bottom: 20px;
  }
  
  .stats-section {
    padding: 16px 24px 8px 24px;
  }
  
  .stat-card {
    height: 100px; /* 增加高度避免内容被遮挡 */
  }
  
  .icon-wrapper {
    width: 48px;
    height: 48px;
    margin-right: 16px;
  }
  
  .icon-wrapper .el-icon {
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 22px;
  }
  
  .sales-chart-card, .ranking-card, .pie-card, .order-card {
    height: 350px; /* 增加高度确保内容完整显示 */
  }
  
  .chart-container {
    min-height: 260px;
    height: 260px;
  }
  
  .chart-placeholder {
    min-height: 240px;
  }
  
  .ranking-list {
    height: 240px;
  }
  
  .pie-container {
    min-height: 240px;
  }
}

@media (max-height: 700px) {
  .stats-section {
    padding: 12px 24px 6px 24px;
  }
  
  .stat-card {
    height: 90px; /* 增加高度避免内容被遮挡 */
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .icon-wrapper .el-icon {
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .sales-chart-card, .ranking-card, .pie-card, .order-card {
    height: 320px; /* 增加高度确保内容完整显示 */
  }
  
  .chart-container {
    min-height: 220px;
    height: 220px;
  }
  
  .chart-placeholder {
    min-height: 200px;
  }
  
  .ranking-list {
    height: 200px;
  }
  
  .pie-container {
    min-height: 200px;
  }
  
  .main-content {
    padding: 8px 0 16px 0;
  }
  
  .chart-row {
    margin-bottom: 16px;
  }
}

/* 超小屏幕适配 */
@media (max-height: 600px) {
  .dashboard-container {
    padding-bottom: 30px;
  }
  
  .stats-container {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .stat-item {
    flex: 1 1 calc(50% - 4px);
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .stat-card {
    height: 60px;
  }
  
  .icon-wrapper {
    width: 36px;
    height: 36px;
    margin-right: 10px;
  }
  
  .icon-wrapper .el-icon {
    font-size: 18px;
  }
  
  .stat-number {
    font-size: 18px;
  }
  
  .stat-title {
    font-size: 12px;
  }
  
  .stat-desc {
    font-size: 11px;
  }
  
  .sales-chart-card, .ranking-card, .pie-card, .order-card {
    height: 250px;
  }
  
  .chart-container {
    min-height: 190px;
    height: 190px;
  }
  
  .chart-placeholder {
    min-height: 170px;
  }
  
  .ranking-list {
    height: 170px;
  }
  
  .pie-container {
    min-height: 170px;
  }
}
</style> 