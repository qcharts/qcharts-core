export function install({ Sprite, utils, registerNodeType }, options) {
  const { setDeprecation, findColor } = utils

  class RectSprite extends Sprite {
    constructor(attrs) {
      super(attrs)
      console.log(attrs)
    }
    attr(name, val) {
      let arr = ['strokeColor']
      if (arr.indexOf(name) !== -1) {
        console.log(name, val)
        if (typeof name === 'object') {
        } else {
        }
      }
      let res = super.attr(name, val)
      return res
    }
    get contentSize() {
      let [width, height] = this.attr('size')
      return [width, height]
    }
    render(t, drawingContext) {
      super.render(t, drawingContext)
      const [width, height] = this.contentSize
      drawingContext.beginPath()
      drawingContext.rect(0, 0, width, height)
      // console.log('abc', this.attr('strokeColor'))
      drawingContext.strokeStyle = findColor(
        drawingContext,
        this,
        'strokeColor'
      )
      drawingContext.fillStyle = this.attr('fillColor')
      drawingContext.lineWidth = this.attr('lineWidth')

      drawingContext.fill()
      drawingContext.stroke()
      const textures = this.textures
      let cliped = !this.attr('clipOverflow')
      if (this.images && this.images.length) {
        // debugger
        textures.forEach((texture, i) => {
          const img = this.images[i]
          const [w, h] = this.contentSize
          const rect = texture.rect || [
            0,
            0,
            this.images[0].width,
            this.images[0].height
          ]
          const srcRect = texture.srcRect

          if (!cliped && (rect[2] >= w || rect[3] >= h)) {
            cliped = true
            drawingContext.beginPath()
            drawingContext.rect(0, 0, w, h)
            drawingContext.clip()
          }

          drawingContext.save()

          if (texture.filter) {
            setDeprecation(
              'texture.filter',
              'Instead use sprite.attr({filter}).'
            )
            const imgRect = srcRect
              ? [0, 0, srcRect[2], srcRect[3]]
              : [0, 0, img.width, img.height]

            const sx = rect[2] / imgRect[2]
            const sy = rect[3] / imgRect[3]

            drawingContext.filter = Object.entries(texture.filte)
              .reduce((accumulator, curVal) => {
                return accumulator.concat(this[curVal[0]](curVal[1]))
              }, [])
              .join(' ')

            if (srcRect) {
              drawingContext.drawImage(
                img,
                ...srcRect,
                sx * imgRect[0] + rect[0],
                sy * imgRect[1] + rect[1],
                sx * srcRect[2],
                sy * srcRect[3]
              )
            } else {
              drawingContext.drawImage(
                img,
                sx * imgRect[0] + rect[0],
                sy * imgRect[1] + rect[1],
                sx * img.width,
                sy * img.height
              )
            }
          } else if (srcRect) {
            drawingContext.drawImage(img, ...srcRect, ...rect)
          } else {
            drawingContext.drawImage(img, ...rect)
          }

          drawingContext.restore()
        })
      }
    }
  }

  registerNodeType('RectSprite', RectSprite)
  return { RectSprite }
}
