export function install({ Sprite, utils, registerNodeType }) {
  const { findColor } = utils
  class RectSprite extends Sprite {
    constructor(subject) {
      super(subject)
      this.attr({
        fillColor: 'transparent',
        lineWidth: 0,
        strokeColor: 'transparent'
      })
    }
    render(t, drawingContext) {
      const [width, height] = this.contentSize
      drawingContext.beginPath()
      drawingContext.rect(0, 0, width, height)
      drawingContext.strokeStyle = this.attr('strokeColor')
      drawingContext.fillStyle = findColor(drawingContext, this, 'fillColor')
      drawingContext.lineWidth = this.attr('lineWidth')
      drawingContext.fill()
      drawingContext.stroke()
      if (this.images && this.images.length) {
        const textures = this.textures
        textures.forEach((texture, i) => {
          texture.rect = texture.rect || [
            0,
            0,
            this.images[0].width,
            this.images[0].height
          ]
        })
      }
      super.render(t, drawingContext)
    }
  }
  registerNodeType('RectSprite', RectSprite)
  return { RectSprite }
}
