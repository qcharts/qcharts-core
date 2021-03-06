import { axis } from '../../util'
const attachPadAngleOfArr = (arr, padAngle = 0) => {
  // 设置 padAngle
  const maxPadAngle = Math.min.apply(
    null,
    arr.filter(d => !d.disabled).map(a => a.endAngle - a.startAngle)
  )

  if (padAngle >= 0) {
    padAngle = padAngle > maxPadAngle ? maxPadAngle / 2 : padAngle

    arr
      .filter(d => !d.disabled)
      .forEach(a => {
        if (a.endAngle - a.startAngle > padAngle * 2) {
          a.padAngle = padAngle
          a.startAngle += padAngle
          a.endAngle -= padAngle
        }
      })
  }
}

export default function barLayout() {
  function bar(dataInfo) {
    // 输入
    const data = dataInfo.data
    const barSize = dataInfo.barSize
    const stack = dataInfo.stack
    const groupGap = dataInfo.groupGap
    const stackGap = dataInfo.stackGap
    const splitNumber = dataInfo.splitNumber
    const radius = dataInfo.radius
    const barInnerRadius = dataInfo.innerRadius
    const padAngle = dataInfo.padAngle
    // 输出
    const barData = []
    const groupData = []

    const bgPillarAttr = { opacity: 0.00001, fillColor: '#000' }

    // const valueAxis = getAxis(stack, data)
    const valueAxis = axis({ dataSet: data, stack, splitNumber })
    if (!valueAxis || !valueAxis.length) {
      return { barData, groupData }
    }

    const tableSize = Math.min(barSize[0], barSize[1])
    const axisValueMax = Math.max.apply(this, valueAxis)
    const axisValueMin = Math.min.apply(this, valueAxis)
    const POSITIVE_RATIO = axisValueMax / (axisValueMax - axisValueMin) // 正负柱子高度比例
    const GROUP_BAR_NUM = computerLegend(data) // 图例显示个数

    const GROUP_NUM = data[0].length
    const BAR_MAX_HEIGHT = 0.5 * radius * tableSize
    const BAR_HEIGHT_FACTOR = BAR_MAX_HEIGHT / (axisValueMax - axisValueMin)
    if (!stack) {
      // 分组柱状图
      for (let i = 0, len = GROUP_NUM; i < len; i++) {
        let flag = 0 // 计算当前柱子前面有几根被隐藏
        let value = 0
        let gpData = { rects: [] }
        let groupAngle = (Math.PI * 2 - GROUP_NUM * groupGap) / GROUP_NUM
        // 计算单根柱子
        for (let j = 0, lenj = data.length; j < lenj; j++) {
          if (data[j][i].disabled !== true) {
            data[j][i].disabled = false
          }
          let barAngle = groupAngle / GROUP_BAR_NUM
          let startAngle =
            (groupAngle + groupGap) * i + barAngle * (j - flag) - Math.PI * 0.5
          value = data[j][i].__valueGetter__()
          let barHeight = BAR_HEIGHT_FACTOR * value
          let innerRadius =
            BAR_MAX_HEIGHT * (1 - POSITIVE_RATIO) +
            barInnerRadius * tableSize * 0.5

          let rect = {
            innerRadius: innerRadius,
            outerRadius: innerRadius + barHeight,
            startAngle: startAngle,
            endAngle: startAngle + barAngle,
            ...data[j][i],
            id: i * lenj + j,
          }
          if (rect.disabled) {
            rect.endAngle = rect.startAngle
            rect.radius = 0
            rect.opacity = 0
            flag++
          } else {
            rect.opacity = 1
            gpData.rects.push(rect)
          }
          barData.push(rect)
        }
        // 柱子整体属性
        gpData = Object.assign(gpData, {
          innerRadius: barInnerRadius * 0.5 * tableSize,
          outerRadius: (barInnerRadius + radius) * 0.5 * tableSize,
          startAngle: (groupGap + groupAngle) * i - Math.PI * 0.5,
          endAngle: (groupGap + groupAngle) * i + groupAngle - Math.PI * 0.5,
          ...bgPillarAttr
        })
        groupData.push(gpData)
      }
    } else {
      // 堆叠柱状图
      for (let i = 0, len = GROUP_NUM; i < len; i++) {
        let heightSumUp = 0
        let heightSumDown = 0
        let value = 0
        let gpData = { rects: [] }
        let groupAngle = (Math.PI * 2 - GROUP_NUM * groupGap) / GROUP_NUM
        // 计算单根柱子
        for (let j = 0, lenj = data.length; j < lenj; j++) {
          if (data[j][i].disabled !== true) {
            data[j][i].disabled = false
          }
          let startAngle = (groupAngle + groupGap) * i - Math.PI * 0.5
          value = data[j][i].__valueGetter__()
          let barHeight = BAR_HEIGHT_FACTOR * value
          let innerRadius =
            value < 0
              ? BAR_MAX_HEIGHT * (1 - POSITIVE_RATIO) - heightSumDown
              : BAR_MAX_HEIGHT * (1 - POSITIVE_RATIO) + heightSumUp
          innerRadius = innerRadius + barInnerRadius * tableSize * 0.5
          let rect = {
            innerRadius: innerRadius,
            outerRadius: innerRadius + barHeight - stackGap,
            startAngle: startAngle,
            endAngle: startAngle + groupAngle,
            ...data[j][i],
          }

          if (rect.disabled) {
            rect.opacity = 0
          } else {
            rect.opacity = 1
            value < 0
              ? (heightSumDown = heightSumDown - barHeight)
              : (heightSumUp = heightSumUp + barHeight)
            gpData.rects.push(rect)
          }
          barData.push(rect)
        }
        // 柱子整体属性
        gpData = Object.assign(gpData, {
          innerRadius: barInnerRadius * 0.5 * tableSize,
          outerRadius: (barInnerRadius + radius) * 0.5 * tableSize,
          startAngle: (groupGap + groupAngle) * i - Math.PI * 0.5,
          endAngle: (groupGap + groupAngle) * i + groupAngle - Math.PI * 0.5,
          ...bgPillarAttr
        })
        groupData.push(gpData)
      }
    }
    attachPadAngleOfArr(barData, padAngle)
    return { barData, groupData }
  }

  function computerLegend(data) {
    let flag = 0
    for (let i = 0, len = data.length; i < len; i++) {
      if (data[i][0].disabled !== true) {
        flag++
      }
    }
    if (flag === 0) {
      // console.warn('data invalid!')
    }
    return flag || 1
  }
  return bar
}
