import { Group, Ring } from 'spritejs'
import { clone } from '../../util'
import { BaseVisual } from '../../core'
import layout from './layout'
// import { withText } from './text'

export class PolarBar extends BaseVisual {
  constructor(attrs = {}) {
    super(attrs)
    this.$pillars = []
    this.chartSize = []
  }

  getDefaultAttrs() {
    return {
      groupPadAngle: 0,
      radius: 1,
      innerRadius: 0,
      // startAngle: Math.PI * -0.5,
      // endAngle: Math.PI * 1.5,
      padAngle: 0,
      type: 'PolarBar',
      stack: false,
      mouseDisabled: false,
      splitNumber: 0,
      stackGap: 0,
      translateOnClick: true
    }
  }

  get name() {
    return this.attr('type')
  }
  get center() {
    const { size } = this.attr()
    const [width, height] = size
    let [x, y] = [width / 2, height / 2]
    return [x, y]
  }
  get maxOuterRadius() {
    const { radius, size } = this.attr()
    const [width, height] = size

    // if (endAngle - startAngle === Math.PI / 2) {
    //   return Math.min(width, height) * radius
    // } else {
    return (Math.min(width, height) / 2) * radius
    // }
  }
  get pos() {
    const { size } = this.attr()
    const [width, height] = size
    const maxRadius = this.maxOuterRadius
    let [x, y] = [width / 2 - maxRadius, height / 2 - maxRadius]
    return [x, y]
  }
  transform(data) {
    if (!data || data.length === 0) {
      return { barData: [], groupData: [] }
    }
    const dataLength = data.length > 1 ? data.length : data[0].length
    this.legendArr = Array.from({ length: data.length }, () => {
      return 1
    })
    const pos = this.pos
    const maxOuterRadius = this.maxOuterRadius
    // const innerRadius = this.innerRadius
    const dataInfoObj = {
      radius: this.attr('radius'),
      innerRadius: this.attr('innerRadius'),
      data: data,
      barSize: this.attr('size'),
      stack: this.attr('stack'),
      groupGap: this.attr('groupPadAngle'),
      splitNumber: this.attr('splitNumber'),
      stackGap: this.attr('stackGap'),
      padAngle: this.attr('padAngle')
    }
    const result = layout()(dataInfoObj)
    result.barData.forEach((bar, i) => {
      bar.fillColor = bar.fillColor || this.color(i % dataLength)
      bar.maxRadius = maxOuterRadius
      bar.pos = pos
      bar.dataOrigin =
        data.length > 1
          ? clone(data[i % dataLength][Math.floor(i / dataLength)].dataOrigin)
          : clone(data[Math.floor(i / dataLength)][i % dataLength].dataOrigin)
      bar.index = i
      bar.strokeColor = '#FFF'
      bar.lineWidth = 1
      bar.color = bar.fillColor
      // debugger
      const normalState = this.style('pillar')(bar, bar.dataOrigin, bar.index)
      Object.assign(bar, normalState)
    })
    result.groupData.forEach((bar, i) => {
      bar.index = i
      bar.pos = pos
      bar.maxRadius = maxOuterRadius
    })
    return result
  }

  beforeRender() {
    this.$group.attr({ clipOverflow: false })
    super.beforeRender()
    let data = this.getData()
    const result = this.transform(data)
    this.pillars = result.barData
    this.fromTos = this.pillars.map((pillar, i) => {
      return {
        from: {
          endAngle: pillar.startAngle
        },
        to: {
          endAngle: pillar.endAngle
        }
      }
    })
    return result
  }

  beforeUpdate() {
    super.beforeUpdate()
    let data = this.getData()
    const pillars = this.pillars
    const newRenderData = this.transform(data)
    this.fromTos = newRenderData.barData.map((nextPillar, i) => {
      let prev = pillars[i] ? pillars[i] : newRenderData.barData[i - 1]
      if (!prev) {
        prev = {
          startAngle: 0,
          endAngle: 0
        }
      }
      if (this.attr('stack')) {
        return {
          from: {
            innerRadius: prev.disabled
              ? nextPillar.innerRadius
              : prev.innerRadius,
            outerRadius: prev.disabled
              ? nextPillar.innerRadius
              : prev.outerRadius
          },
          to: {
            innerRadius: nextPillar.disabled
              ? prev.innerRadius
              : nextPillar.innerRadius,
            outerRadius: nextPillar.disabled
              ? prev.innerRadius
              : nextPillar.outerRadius
          }
        }
      } else {
        return {
          from: {
            startAngle: prev.startAngle,
            endAngle: prev.endAngle
          },
          to: {
            startAngle: nextPillar.startAngle,
            endAngle: nextPillar.endAngle
          }
        }
      }
    })
    this.pillars = newRenderData.barData
    return newRenderData
  }

  getRing = (ring, i, el) => {
    if (!el) {
      return
    }
    this.$pillars[i] = el

    if (el.isTranslatedByInitiativeClick) {
      // 主动点击导致扇形移动，将不会自动移回
      return
    }

    if (ring.selected && ring.endAngle > ring.startAngle) {
      if (!el.parentNode) {
        el.on('append', () => this.toggleTranslate(ring, null, el))
      } else {
        const isTranslated = el.isTranslated

        if (isTranslated) {
          el.isTranslated = false
        }

        this.toggleTranslate(ring, null, el)
      }
    } else if (!ring.selected && el.isTranslated) {
      this.toggleTranslate(ring, null, el)
    }
  }

  toggleTranslate = (attrs, evt, el) => {
    let isTranslated = el.isTranslated
    const offset = Math.max(20, attrs.maxRadius * 0.1)
    const { startAngle, endAngle } = attrs
    const angle = (startAngle + endAngle) / 2
    const translate = [offset * Math.cos(angle), offset * Math.sin(angle)]

    // let target = el.parentNode
    let target = el

    // if (target.attr('name') === 'pieRoot') {
    //   target = el
    // }

    if (isTranslated) {
      target.transition(0.3).attr('translate', [0, 0])

      el.isTranslated = false
    } else {
      target.transition(0.3).attr('translate', translate)

      el.isTranslated = true
    }
  }

  showTooltip(evt, data) {
    evt.data = data
    this.dataset.hoverData({ ...evt, data: data })
  }

  hideTooltip() {
    this.dataset.hoverData(null)
  }
  render(data) {
    const translateOnClick = this.attr('translateOnClick')
    return (
      <Group zIndex={100} enableCache={false} clipOverflow={false}>
        <Group clipOverflow={false}>
          {data.groupData.map((pillar, i) => {
            const normalState = this.style('backgroundPillar')(
              pillar,
              pillar.dataOrigin,
              pillar.index
            )
            if (normalState === false) {
              return
            }
            return (
              <Ring
                {...pillar}
                {...normalState}
                hoverState={Object.assign(
                  {},
                  this.style('backgroundpillar:hover')(
                    pillar,
                    pillar.dataOrigin,
                    pillar.index
                  )
                )}
                onMouseenter={(_, el) =>
                  !this.attr('mouseDisabled') && el.attr('state', 'hover')
                }
                onMousemove={(evt, el) => {
                  !this.attr('mouseDisabled') &&
                    this.showTooltip(evt, pillar.rects)
                }}
                onMouseleave={(evt, el) => {
                  if (!this.attr('mouseDisabled')) {
                    this.hideTooltip()
                    el.attr('state', 'normal')
                  }
                }}
              />
            )
          })}
        </Group>
        <Group clipOverflow={false}>
          {data.barData.map((pillar, i) => {
            const { from, to } = this.fromTos[i]
            return (
              <Group enableCache={false} clipOverflow={false}>
                <Ring
                  ref={el => this.getRing(pillar, i, el)}
                  {...pillar}
                  animation={this.resolveAnimation({
                    from,
                    to,
                    duration: 500,
                    delay: 0
                  })}
                  hoverState={this.style('pillar:hover')(
                    pillar,
                    pillar.dataOrigin,
                    pillar.index
                  )}
                  onMouseenter={(_, el) =>
                    !this.attr('mouseDisabled') && el.attr('state', 'hover')
                  }
                  onMouseleave={(evt, el) => {
                    !this.attr('mouseDisabled') && el.attr('state', 'normal')
                  }}
                  onClick={(evt, el) => {
                    evt.stopDispatch()
                    if (!this.attr('stack') && translateOnClick) {
                      el.isTranslatedByInitiativeClick = true // 主动点击
                      this.toggleTranslate(pillar, evt, el)
                    }
                  }}
                />
              </Group>
            )
          })}
        </Group>
      </Group>
    )
  }
}
