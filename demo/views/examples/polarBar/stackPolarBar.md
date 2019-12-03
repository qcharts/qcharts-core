## 自定义颜色极坐标柱状图

:::demo

```javascript
const data = [
  {
    product: '05-08',
    year: '图例一',
    sales: 5
  },
  {
    product: '05-08',
    year: '图例二',
    sales: 15
  },

  {
    product: '05-09',
    year: '图例一',
    sales: 10
  },
  {
    product: '05-09',
    year: '图例二',
    sales: 25
  },

  {
    product: '05-10',
    year: '图例一',
    sales: 20
  },
  {
    product: '05-10',
    year: '图例二',
    sales: 30
  },
  {
    product: '05-11',
    year: '图例一',
    sales: 30
  },
  {
    product: '05-11',
    year: '图例二',
    sales: 30
  },
  {
    product: '05-12',
    year: '图例一',
    sales: 35
  },
  {
    product: '05-12',
    year: '图例二',
    sales: 35
  }
]
const { Chart, PolarBar, Tooltip, Axis, Legend } = qcharts
const chart = new Chart({
  container: '#app'
})
chart.source(data, {
  row: 'year',
  value: 'sales',
  text: 'product'
})
const colors = ['#FF0000', '#F28F0F', '#FFFF00', '#00FF00', '#4D6F6F']
// const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FFFFFF']
const bar = new PolarBar({
  stack: true,
  radius: 0.7,
  innerRadius: 0.2
}).style('pillar', (attr, data, i) => {
  if (i % 2 !== 0) {
    return { strokeColor: '#000', lineWidth: 1, fillColor: '#141718' }
  } else {
    return {
      strokeColor: '#000',
      lineWidth: 2,
      fillColor: colors[Math.floor(i / 2)]
    }
  }
})
const tooltip = new Tooltip({
  formatter: d => `${d.product}: ${d.sales}`
}).style('icon', (attr, data, i) => {
  if (i % 2 !== 0) {
    return { fillColor: '#141718' }
  } else {
    return {
      fillColor: colors[Math.floor(i / 2)]
    }
  }
})

chart.add([bar, tooltip])
chart.render()
```

:::
