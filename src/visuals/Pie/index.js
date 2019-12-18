import { Group, Ring, Label } from 'spritejs'
import { BaseVisual } from '../../core'
import layout from './layout'
import { withGuide } from './guide'
import { withText } from './text'
import { flattern, axis, scaleLinear, formatAnimationAttr } from '../../util'

export class Pie extends BaseVisual {
  constructor(attrs = {}) {
    super(attrs)
    this.$rings = []
    this.sectors = []
  }

  get name() {
    const isRose = this.attr('rose')
    return isRose ? 'Rose' : 'Pie'
  }

  getDefaultAttrs() {
    return {
      radius: 0.8,
      innerRadius: 0,
      startAngle: Math.PI * -0.5,
      endAngle: Math.PI * 1.5,
      padAngle: 0,
      rose: false,
      translateOnClick: true,
      radiusOffset: 10,
      formatter: function(str) {
        return str
      }
    }
  }

  get maxOuterRadius() {
    const { startAngle, endAngle, radius, size } = this.attr()
    const [width, height] = size

    if (endAngle - startAngle === Math.PI / 2) {
      return Math.min(width, height) * radius
    } else {
      return (Math.min(width, height) / 2) * radius
    }
  }

  get innerRadius() {
    let { radius, innerRadius } = this.attr()
    return innerRadius <= 0 ? 0 : (this.maxOuterRadius / radius) * innerRadius
  }

  get animateDuration() {
    let { animation } = this.attr()
    if (animation && animation.duration) {
      return animation.duration
    }
    return 300
  }

  get center() {
    const { size } = this.attr()
    const [width, height] = size
    let [x, y] = [width / 2, height / 2]
    return [x, y]
  }

  get pos() {
    const { startAngle, endAngle, radius, size } = this.attr()
    const angle = (endAngle + startAngle) / 2
    const [width, height] = size
    const maxRadius = this.maxOuterRadius
    let [x, y] = [width / 2 - maxRadius, height / 2 - maxRadius]

    if (endAngle - startAngle === Math.PI / 2) {
      // 区分象限
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const maxWidth = radius * width
      const maxHeight = radius * height
      x += cos < 0 ? maxWidth / 2 : -(maxWidth / 2)
      y += sin < 0 ? maxHeight / 2 : -(maxHeight / 2)
    }

    return [x, y]
  }

  transform(data, nestData) {
    const { startAngle, endAngle, padAngle, rose } = this.attr()
    const rings = (this.sectors = layout()
      .startAngle(startAngle)
      .endAngle(endAngle)
      .padAngle(padAngle)
      .value(d => (rose ? 1 : +d.__valueGetter__()))(data)) // 如果是rose等分圆形

    const pos = this.pos
    const maxOuterRadius = this.maxOuterRadius
    const innerRadius = this.innerRadius
    const isRose = this.attr('rose')
    let outerRadiuses = [] // 分配给各个扇形的外半径

    if (isRose) {
      const ticks = axis({
        dataSet: nestData
      })

      const scale = scaleLinear()
        .domain([0, ticks[ticks.length - 1]])
        .range([innerRadius, maxOuterRadius])

      outerRadiuses = data.map(d => {
        return scale(d.disabled ? 0 : +d.__valueGetter__())
      })
    } else {
      outerRadiuses = rings.map(() => maxOuterRadius)
    }
    rings.forEach((ring, i) => {
      ring.index = i
      ring.maxRadius = maxOuterRadius
      ring.outerRadius = outerRadiuses[i]
      ring.innerRadius = innerRadius
      ring.pos = pos
      ring.fillColor = this.color(i)
      ring.lineWidth = 0
      ring.center = this.center
      // ring.__patchParent__({ visual: 'pie', color: ring.fillColor })

      const normalState = this.style('sector')(
        ring,
        ring.dataOrigin,
        ring.index
      )

      Object.assign(ring, normalState)

      if (ring.disabled) {
        ring.lineWidth = 0
      }

      if (ring.lineWidth && ring.lineWidth >= 1) {
        // 避免只展示一个扇形时出现边框
        const { startAngle, endAngle } = ring
        const angle = (startAngle + endAngle) % (Math.PI * 1)

        if (angle <= 0 && rings.filter(ring => !ring.disabled).length <= 1) {
          ring.lineWidth = 0
        }
      }
    })

    return rings
  }

  beforeRender() {
    super.beforeRender()
    const nestData = this.getData()
    const data = flattern(nestData)
    const rings = (this.rings = this.transform(data, nestData))
    this.fromTos = rings.map((ring, i) => {
      return {
        from: {
          startAngle: ring.startAngle,
          endAngle: ring.startAngle
        },
        to: {
          startAngle: ring.startAngle,
          endAngle: ring.endAngle
        }
      }
    })

    return rings
  }

  beforeUpdate() {
    super.beforeUpdate()
    const nestData = this.getData()
    const data = flattern(nestData)
    const rings = this.rings
    const nextRings = this.transform(data, nestData)
    this.fromTos = nextRings.map((nextRing, i) => {
      let prev = rings[i] ? rings[i] : nextRings[i - 1]
      if (!prev) {
        prev = {
          startAngle: this.attr('startAngle'),
          endAngle: this.attr('startAngle')
        }
      }
      return {
        from: {
          startAngle: prev.disabled ? prev.endAngle : prev.startAngle,
          endAngle: prev.endAngle
        },
        to: {
          startAngle: nextRing.startAngle,
          endAngle: nextRing.endAngle
        }
      }
    })
    this.rings = nextRings
    return nextRings
  }

  getRing = (ring, i, el) => {
    if (!el) {
      return
    }
    this.$rings[i] = el
    if (el.isTranslatedByInitiativeClick) {
      // 主动点击导致扇形移动，将不会自动移回
      return
    }
    if (ring.selected && ring.endAngle > ring.startAngle) {
      if (!el.parentNode) {
        el.on('append', () => this.clickToggle(ring, el))
      } else {
        const isTranslated = el.isTranslated

        if (isTranslated) {
          el.isTranslated = false
        }
        this.clickToggle(ring, el)
      }
    } else if (!ring.selected && el.isTranslated) {
      this.clickToggle(ring, el)
    }
  }

  clickToggle(ring, el) {
    if (ring.animation === false) {
      this.toggleTranslate(ring, null, el, false)
      return
    }
    if (ring.animation && ring.animation.type === 'slide') {
      this.toggleAnimate(ring, null, el)
    } else {
      this.toggleTranslate(ring, null, el)
    }
  }

  toggleTranslate = (attrs, evt, el) => {
    let duration =
      attrs.animation && attrs.animation.duration
        ? attrs.animation.duration * 0.001
        : this.animateDuration * 0.001
    let globalAnimation = this.attr('animation')
    let isTranslated = el.isTranslated
    const offset = Math.max(10, attrs.maxRadius * 0.1)
    const { startAngle, endAngle } = attrs
    const angle = (startAngle + endAngle) / 2
    const translate = [offset * Math.cos(angle), offset * Math.sin(angle)]
    let target = el.parentNode
    if (target.attr('name') === 'pieRoot') {
      target = el
    }
    if (isTranslated) {
      target.transition(duration).attr('translate', [0, 0])
      el.isTranslated = false
    } else {
      target
        .transition(duration)
        .attr(
          'translate',
          attrs.animation === false ||
            (!attrs.animation && globalAnimation === false)
            ? [0, 0]
            : translate
        )
      el.isTranslated = true
      for (let i = 0, len = this.$rings.length; i < len; i++) {
        if (
          el.id !== this.$rings[i].id &&
          this.$rings[i].isTranslated === true
        ) {
          if (this.$rings[i].parentNode.attr('name') === 'pieRoot') {
            this.$rings[i].transition(duration).attr('translate', [0, 0])
          } else {
            this.$rings[i].parentNode
              .transition(duration)
              .attr('translate', [0, 0])
          }
          this.$rings[i].isTranslated = false
        }
      }
    }
  }
  toggleAnimate = (attrs, evt, el) => {
    let duration =
      attrs.animation && attrs.animation.duration
        ? attrs.animation.duration * 0.001
        : this.animateDuration * 0.001
    let isTranslated = el.isTranslated
    let globalAnimation = this.attr('animation')
    const offset =
      attrs.animation === false ||
      (!attrs.animation && globalAnimation === false)
        ? 0
        : Math.max(this.attr('radiusOffset'), attrs.maxRadius * 0.1)

    let target = el.parentNode
    if (target.attr('name') === 'pieRoot') {
      target = el
    }
    if (isTranslated) {
      el.transition(duration).attr({
        innerRadius: this.innerRadius,
        outerRadius: this.maxOuterRadius
      })
      el.isTranslated = false
    } else {
      el.transition(duration).attr({
        innerRadius: this.innerRadius + offset,
        outerRadius: this.maxOuterRadius + offset
      })

      el.isTranslated = true
      for (let i = 0, len = this.$rings.length; i < len; i++) {
        if (
          el.id !== this.$rings[i].id &&
          this.$rings[i].isTranslated === true
        ) {
          this.$rings[i].transition(duration).attr({
            innerRadius: this.innerRadius,
            outerRadius: this.maxOuterRadius
          })
          this.$rings[i].isTranslated = false
        }
      }
    }
  }
  render(rings = []) {
    const { formatter } = this.attr()
    const translateOnClick = this.attr('translateOnClick')
    const needChildren =
      this.isStyleExist('guideline') ||
      this.isStyleExist('guideText') ||
      this.isStyleExist('text')

    const renderRing = (ring, i, from, to) => {
      return (
        <Ring
          ref={el => this.getRing(ring, i, el)}
          {...ring}
          animation={this.resolveAnimation({
            from,
            to,
            duration: 300,

            delay: 0
          })}
          actions={[
            {
              both: ['normal', 'hover'],
              action: {
                duration: this.animateDuration
              }
            }
          ]}
          hoverState={this.style('sector:hover')(
            ring,
            ring.dataOrigin,
            ring.index
          )}
          onMouseenter={(evt, el) => {
            evt.stopDispatch()
            el.attr('state', 'hover')
          }}
          onMousemove={(evt, el) => {
            evt.stopDispatch()
            this.chart.setCanvasCursor('pointer')
            this.dataset.hoverData({
              data: {
                color: ring.fillColor,
                ...ring.dataOrigin
              },
              ...evt
            })
          }}
          onMouseleave={(evt, el) => {
            evt.stopDispatch()
            this.dataset.hoverData(null)
            el.attr('state', 'normal')
            this.chart.setCanvasCursor('default')
          }}
          onClick={(evt, el) => {
            evt.stopDispatch()
            if (translateOnClick) {
              el.isTranslatedByInitiativeClick = true // 主动点击
              this.clickToggle(ring, el)
            }
          }}
        />
      )
    }
    const rendingLabel = (self, rings) => {
      let animateTextStyle = this.style('title')(rings)
      let rotateTextStyle = this.style('subtitle')(rings)
      if (!animateTextStyle && !rotateTextStyle) {
        return
      }
      let lastAnimateText = ''
      let lastRotateText = ''
      let titleAnimation = {}
      let subTitleAnimation = {}
      if (animateTextStyle) {
        titleAnimation = formatAnimationAttr(animateTextStyle.animation)
        lastAnimateText = self.lastAnimateText || {
          text: animateTextStyle.text
        }
        self.lastAnimateText = { text: animateTextStyle.text }
      }
      if (rotateTextStyle) {
        subTitleAnimation = formatAnimationAttr(rotateTextStyle.animation)
        lastRotateText = self.lastRotateText || { text: rotateTextStyle.text }
        self.lastRotateText = { text: rotateTextStyle.text }
      }
      return (
        <Group clipOverflow={false} enableCache={false}>
          {animateTextStyle ? (
            <Label
              {...animateTextStyle}
              text={formatter(lastAnimateText.text)}
              animation={self.resolveAnimation(
                {
                  from:
                    animateTextStyle.animation === false
                      ? self.lastAnimateText
                      : lastAnimateText,
                  to: self.lastAnimateText,
                  duration: 300,
                  delay: 0,
                  useTween: true,
                  attrFormatter: attr => {
                    if (typeof attr.text === 'number') {
                      let text = formatter(Math.round(attr.text))
                      return { text: text }
                    } else {
                      return { text: formatter(attr.text) }
                    }
                  }
                },
                titleAnimation
              )}
            />
          ) : null}
          {rotateTextStyle ? (
            <Label
              {...rotateTextStyle}
              text={lastRotateText.text}
              animation={self.resolveAnimation(
                {
                  from: {
                    text:
                      rotateTextStyle.animation === false
                        ? self.lastRotateText.text
                        : lastRotateText.text,
                    last: [1, 1]
                  },
                  middle: {
                    text: self.lastRotateText.text,
                    scale: rotateTextStyle.animation === false ? [1, 1] : [0, 1]
                  },
                  to: { text: self.lastRotateText.text, scale: [1, 1] },
                  duration: 300,
                  delay: 0,
                  useTween: false
                },
                subTitleAnimation
              )}
            />
          ) : null}
        </Group>
      )
    }
    return (
      <Group zIndex={100} enableCache={false} name="pieRoot">
        {rings.map((ring, i) => {
          const { from, to } = this.fromTos[i]
          return needChildren ? (
            <Group enableCache={false} clipOverflow={false} size={[1, 1]}>
              {renderRing(ring, i, from, to)}
              {withText(this, ring)}
              {withGuide(this, ring)}
            </Group>
          ) : (
            renderRing(ring, i, from, to)
          )
        })}
        {rendingLabel(this, rings)}
      </Group>
    )
  }
}
