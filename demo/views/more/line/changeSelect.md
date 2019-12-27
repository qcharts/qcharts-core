## 折线轮播选中

:::demo

```javascript
const data = [
  { date: '05-01', catgory: '图例一', sales: 15.2 },
  { date: '05-02', catgory: '图例一', sales: 39.2 },
  { date: '05-03', catgory: '图例一', sales: 31.2 },
  { date: '05-04', catgory: '图例一', sales: 65.2 },
  { date: '05-05', catgory: '图例一', sales: 55.2 },
  { date: '05-06', catgory: '图例一', sales: 75.2 },
  { date: '05-07', catgory: '图例一', sales: 95.2 },
  { date: '05-08', catgory: '图例一', sales: 110 }
]

const { Chart, Line, Legend, Tooltip, Axis } = qcharts

const chart = new Chart({
  container: '#app'
})

chart.source(data, {
  row: 'catgory',
  value: 'sales',
  text: 'date'
})

const line = new Line({ smooth: true }).style('point', { strokeColor: '#fff' })

const tooltip = new Tooltip({
  formatter: function(data) {
    return `${data.date} ${data.sales}`
  }
})

const axisBottom = new Axis()

const axisLeft = new Axis({ orient: 'left' })

const legend = new Legend({ align: ['center', 'bottom'] })
  .style('icon', { borderRadius: 10 })
  .style('text', { fontSize: 12 })

chart.add([line, tooltip, axisBottom, axisLeft, legend])
chart.render()
let num = 0
setTimeout(_ => {
  if (num > 7) {
    num = 0
  }
  line.dispatchAction('hover', { index: num++ })
}, 1000)
```

:::
