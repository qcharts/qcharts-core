## Basic Column Chart 基础柱状图

:::demo

```javascript
const data = [
  {
    product: '05-08',
    year: '图例一',
    sales: 30
  },
  {
    product: '05-08',
    year: '图例二',
    sales: 10
  },
  {
    product: '05-08',
    year: '图例三',
    sales: 20
  },
  {
    product: '05-09',
    year: '图例一',
    sales: 30
  },
  {
    product: '05-09',
    year: '图例二',
    sales: 10
  },
  {
    product: '05-09',
    year: '图例三',
    sales: 20
  },

  {
    product: '05-10',
    year: '图例一',
    sales: 17.57867
  },
  {
    product: '05-10',
    year: '图例二',
    sales: 24
  },
  {
    product: '05-10',
    year: '图例三',
    sales: 37.5432
  },

  {
    product: '05-11',
    year: '图例一',
    sales: 80
  },
  {
    product: '05-11',
    year: '图例二',
    sales: 28
  },
  {
    product: '05-11',
    year: '图例三',
    sales: 3
  },

  {
    product: '05-12',
    year: '图例一',
    sales: 5
  },
  {
    product: '05-12',
    year: '图例二',
    sales: 25
  },
  {
    product: '05-12',
    year: '图例三',
    sales: 35
  },

  {
    product: '05-13',
    year: '图例一',
    sales: 10
  },
  {
    product: '05-13',
    year: '图例二',
    sales: 25
  },
  {
    product: '05-13',
    year: '图例三',
    sales: 40
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
const bar = new PolarBar({
  stack: true,
  innerRadius: 0.1,
  radius: 0.8,
  padAngle: Math.PI * 0.01,
  groupPadAngle: Math.PI * 0.02
}).style('pillar', {
  strokeColor: '#FFF',
  lineWidth: 1
})
const tooltip = new Tooltip({
  formatter: d => `${d.product}: ${d.sales}`
})
const legend = new Legend({ align: ['center', 'bottom'] })

chart.add([bar, legend, tooltip])
chart.render()
```

:::
