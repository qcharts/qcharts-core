## Basic Column Chart 基础柱状图

:::demo

```javascript
const data = [
  { value: 43, label: 'TOP1' },
  { value: 26, label: 'TOP2' },
  { value: 24, label: 'TOP3' },
  { value: 20, label: 'TOP4' },
  { value: 10, label: 'TOP5' }
]
const { Chart, Bar, Tooltip, Axis, Legend } = qcharts
const chart = new Chart({
  container: '#app'
})
chart.source(data, {
  row: '*',
  value: 'value',
  text: 'label'
})
const bar = new Bar({
  pos: ['20%', '10%'],
  size: ['70%', '80%'],
  transpose: true,
  barWidth: 30
})
const texture1 = 'http://p3.qhimg.com/t01128a717c0ff244f1.png'
const texture2 = 'http://p0.qhimg.com/t011e930b32bd7c44b8.png'
bar
  .style('pillar', (attrs, data, i) => {
    return { strokeColor: '#00FF00', lineWidth: 5, fillColor: '#FFFF00' }
  })
  .style('text', (attrs, data, i) => {
    let anchor = attrs.anchor || [0, 0]
    let size = attrs.size
    let pos = attrs.pos
    return {
      color: '#1DCE91',
      rotate: 0,
      text: data.value,
      anchor: [0, 0.5],
      pos: [400, pos[1] + size[1] / 2]
    }
  })
const tooltip = new Tooltip({
  formatter: d => `${d.label}: ${d.value}`
})
const legend = new Legend({ align: ['center', 'bottom'] }).style('text', {
  text: '图例一'
})

const axisLeft = new Axis({
  orient: 'left'
})
  .style('axis', { strokeColor: '#1DCE91' })
  .style('grid', false)
  .style('scale', false)
  .style('label', { color: '#1DCE91' })
chart.add([bar, axisLeft])
chart.render()
```

:::
