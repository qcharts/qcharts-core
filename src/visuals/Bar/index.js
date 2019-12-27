import { Group, Sprite, RectSprite } from 'spritejs'
import { clone } from '../../util'
import { BaseVisual } from '../../core'
import layout from './layout'
import { withText } from './text'

export class Bar extends BaseVisual {
  constructor(attrs = {}) {
    super(attrs)
    this.$groups = []
    this.$pillars = []
    this.groups = []
    this.chartSize = []
    this.hoverIndex = -1
  }

  getDefaultAttrs() {
    return {
      type: 'Bar',
      stack: false,
      transpose: false,
      barWidth: 0,
      mouseDisabled: false,
      barGap: 0,
      splitNumber: 0,
      stackGap: 0
    }
  }

  get name() {
    return this.attr('type')
  }
  ref(name, el) {
    this['$' + name].push(el)
  }
  transform(data) {
    if (!data || data.length === 0) {
      return { barData: [], groupData: [] }
    }
    const dataLength = data.length > 1 ? data.length : data[0].length
    this.legendArr = Array.from({ length: data.length }, () => {
      return 1
    })
    const dataInfoObj = {
      data: data,
      barSize: this.attr('size'),
      barWidth: this.attr('barWidth'),
      stack: this.attr('stack'),
      transpose: this.attr('transpose'),
      groupGap: this.attr('barGap'),
      splitNumber: this.attr('splitNumber'),
      stackGap: this.attr('stackGap')
    }
    const result = layout()(dataInfoObj)
    result.barData.forEach((bar, i) => {
      bar.fillColor = bar.fillColor || this.color(i % dataLength)

      bar.dataOrigin =
        data.length > 1
          ? clone(data[i % dataLength][Math.floor(i / dataLength)].dataOrigin)
          : clone(data[Math.floor(i / dataLength)][i % dataLength].dataOrigin)
      bar.index = i
      bar.color = bar.fillColor
      const normalState = this.style('pillar')(bar, bar.dataOrigin, bar.index)
      Object.assign(bar, normalState)
      // bar.strokeColor = bar.fillColor
    })
    result.groupData.forEach((bar, i) => {
      bar.index = i
    })
    return result
  }

  beforeRender() {
    this.$group.attr({ clipOverflow: false })
    super.beforeRender()
    let data = this.getData()
    const result = this.transform(data)
    this.pillars = result.barData
    this.groups = result.groupData
    this.fromTos = this.pillars.map((pillar, i) => {
      return {
        from: {
          size: this.attr('transpose')
            ? [0, pillar.size[1]]
            : [pillar.size[0], 0]
        },
        to: {
          size: pillar.size
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
          size: [0, 0],
          pos: nextPillar.pos,
          labelAttrs: null
        }
      }
      return {
        from: {
          size: prev.disable
            ? this.attr('transpose')
              ? [0, prev.size[1]]
              : [prev.size[0], 0]
            : prev.size,
          pos: prev.pos
        },
        to: {
          size: nextPillar.size,
          pos: nextPillar.pos
        },
        textFrom: {
          pos:
            prev.labelAttrs && prev.labelAttrs.pos
              ? prev.labelAttrs.pos
              : nextPillar.labelAttrs.pos
        },
        textTo: {
          pos: nextPillar.labelAttrs.pos
        }
      }
    })
    this.pillars = newRenderData.barData
    this.groups = newRenderData.groupData
    return newRenderData
  }

  showTooltip(evt, data) {
    evt.data = data
    this.dataset.hoverData({ ...evt, data: data })
  }

  hideTooltip() {
    this.dataset.hoverData(null)
  }
  dispatchAction(type, obj) {
    let { index, layerX, layerY } = obj
    if (type === 'hover') {
      if (this.hoverIndex >= 0) {
        this.$pillars[this.hoverIndex].attr('state', 'normal')
        this.$groups[this.hoverIndex].attr('state', 'normal')
      }
      this.$pillars[index].attr('state', type)
      this.$groups[index].attr('state', type)
      this.showTooltip({ layerX, layerY }, this.groups[index].rects)
      this.hoverIndex = index
    }
  }

  render(data) {
    return (
      <Group zIndex={100} enableCache={false} clipOverflow={false}>
        <Group>
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
              <Sprite
                ref={el => this.ref('groups', el)}
                {...pillar}
                {...normalState}
                hoverState={Object.assign(
                  { opacity: 0.05 },
                  this.style('backgroundpillar:hover')(
                    pillar,
                    pillar.dataOrigin,
                    pillar.index
                  )
                )}
                onMouseenter={(_, el) =>
                  !this.attr('mouseDisabled') &&
                  el.attr('state', 'hover') &&
                  this.showTooltip(_, pillar.rects)
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
                <RectSprite
                  ref={el => this.ref('pillars', el)}
                  {...pillar}
                  {...from}
                  animation={this.resolveAnimation({
                    from,
                    to,
                    duration: 300,
                    delay: 0,
                    attrFormatter: attr => {
                      return Object.assign(attr, {
                        size: [
                          Math.round(attr.size[0]),
                          Math.round(attr.size[1])
                        ]
                      })
                    },
                    useTween: true
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
                />
                {withText(this, pillar)}
              </Group>
            )
          })}
        </Group>
      </Group>
    )
  }
}
