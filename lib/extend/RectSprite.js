export function install(_ref) {
  var {
    Sprite,
    utils,
    registerNodeType
  } = _ref;
  var {
    findColor
  } = utils;

  class RectSprite extends Sprite {
    constructor(subject) {
      super(subject);
      this.attr({
        fillColor: 'transparent',
        lineWidth: 0,
        strokeColor: 'transparent'
      });
    }

    render(t, drawingContext) {
      var [width, height] = this.contentSize;
      drawingContext.beginPath();
      drawingContext.rect(0, 0, width, height);
      drawingContext.strokeStyle = this.attr('strokeColor');
      drawingContext.fillStyle = findColor(drawingContext, this, 'fillColor');
      drawingContext.lineWidth = this.attr('lineWidth');
      drawingContext.fill();
      drawingContext.stroke();

      if (this.images && this.images.length) {
        var textures = this.textures;
        textures.forEach((texture, i) => {
          texture.rect = texture.rect || [0, 0, this.images[0].width, this.images[0].height];
        });
      }

      super.render(t, drawingContext);
    }

  }

  registerNodeType('RectSprite', RectSprite);
  return {
    RectSprite
  };
}