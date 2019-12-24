function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Polygon, Arc, Polyline, Label } from 'spritejs';
import { BaseVisual } from '../../core';
import { flattern, isFunction, isString, isArray, isNumber } from '../../util';

function tickLine(radius, angle, tickLength, labelOffset, isInner) {
  var cos = Math.cos(angle);
  var sin = Math.sin(angle); // 起点

  var [x, y] = [cos * radius, sin * radius]; // 中点

  var [cX0, cY0] = isInner ? [x - tickLength * cos, y - tickLength * sin] : [x + tickLength * cos, y + tickLength * sin];
  var labelPos = isInner ? [x - (tickLength + labelOffset) * cos, y - (tickLength + labelOffset) * sin] : [x + (tickLength + labelOffset) * cos, y + (tickLength + labelOffset) * sin];
  var anchorX = isInner ? cos : -cos;
  var anchorY = isInner ? sin : -sin;
  var anchor = [0.5, 0.5];

  if (Math.abs(anchorX) > Math.abs(anchorY)) {
    anchor[0] = anchorX < 0 ? 0 : anchorX;
  } else {
    anchor[1] = anchorY > 0 ? anchorY : 0;
  }

  return {
    points: [[x, y], [cX0, cY0]],
    labelPos,
    anchor
  };
}

export class Gauge extends BaseVisual {
  constructor() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(attrs);
    this.animations = [];
    this.style('tickText', true);
    this.style('tickLine', true);
  }

  get name() {
    return 'Gauge';
  }

  getDefaultAttrs() {
    return {
      min: 0,
      max: 1,
      lineCap: 'round',
      lineWidth: 8,
      startAngle: Math.PI * 0.8,
      endAngle: Math.PI * 2.2,
      strokeBgcolor: '#dde3ea',
      hoverBg: '#f8f8f8',
      title: d => d,
      subTitle: d => d,
      tickStep: 0.1,
      // tick 步进，生成 tick 的数量为 (max - min) / tickStep
      tickLength: 5,
      // 刻度长度，为负值时向外绘制
      labelOffset: 5,
      tickFormatter: d => d // 刻度文本格式化

    };
  }

  get radius() {
    var size = this.attr('size');
    var lw = this.attr('lineWidth');
    var len = this.getData().length;
    return ~~((Math.min.apply(size, size.map(v => v / 2)) - lw * (len - 1) * 2) / len);
  }

  get pointerWidth() {
    return this.radius / 10;
  }

  get center() {
    var {
      lineWidth
    } = this.attr();
    var radius = this.radius;
    return [radius + lineWidth / 2, radius + lineWidth / 2];
  }

  get ticks() {
    var {
      min,
      max,
      startAngle,
      endAngle,
      lineWidth,
      tickStep,
      tickLength,
      labelOffset,
      tickFormatter
    } = this.attr();
    var count = Math.abs(max - min) / tickStep;
    var total = endAngle - startAngle;

    if (total > Math.PI * 2) {
      endAngle = startAngle + Math.PI * 2;
      total = endAngle - startAngle;
    }

    var isInner = tickLength > 0;
    var perAngle = total / count;
    var ticks = [];
    var radius = isInner ? this.radius - lineWidth : this.radius;
    var angle = 0;
    var i = -1;

    while (++i <= count) {
      angle = i * perAngle + startAngle;
      var ret = tickLine(radius, angle, Math.abs(tickLength), Math.abs(labelOffset), isInner);
      ticks.push({
        points: ret.points,
        label: {
          text: tickFormatter(i * tickStep),
          pos: ret.labelPos,
          anchor: ret.anchor
        }
      });
    }

    if ((ticks[0].angle + ticks[ticks.length - 1].angle) % (Math.PI * 2) === 0) {
      ticks.pop();
    }

    return ticks;
  }

  transform(data) {
    var {
      startAngle,
      endAngle,
      min,
      max
    } = this.attr();
    var total = Math.abs(max - min);
    var radius = this.radius;
    return data.reduce((a, d, i) => {
      var value = d.__valueGetter__();

      var arc = {
        dataOrigin: d.dataOrigin,
        startAngle,
        radius,
        endAngle: d.disabled ? startAngle : (endAngle - startAngle) * value / total + startAngle,
        color: this.color(i)
      };
      a.push(arc);
      return a;
    }, []);
  }

  beforeRender() {
    super.beforeRender();
    var data = flattern(this.getData());
    var arcs = this.transform(data);
    this.animations = arcs.reduce((a, c, i) => {
      a.push({
        from: {
          startAngle: c.startAngle,
          endAngle: c.startAngle
        },
        to: {
          startAngle: c.startAngle,
          endAngle: c.endAngle
        }
      });
      return a;
    }, []);
    return arcs;
  }

  beforeUpdate() {
    super.beforeUpdate();
    var data = flattern(this.getData());
    var arcs = this.transform(data);
    this.animations = arcs.map((arc, i) => {
      var animation = this.animations[i];

      if (animation) {
        return {
          from: animation.to,
          to: {
            startAngle: arc.startAngle,
            endAngle: arc.endAngle
          }
        };
      } else {
        return {
          from: {
            startAngle: arc.startAngle,
            endAngle: arc.startAngle
          },
          to: {
            startAngle: arc.startAngle,
            endAngle: arc.endAngle
          }
        };
      }
    });
    return arcs;
  }

  color(i) {
    if (i && typeof i !== 'number') {
      this._useBuiltInColors = false;
    }

    return super.color(i);
  } // 将 arc 弧度转为 transform 的 rotate角度，同时加上两者起始位置的偏差度


  transformArcAngle2Rotate(angel) {
    return 180 / Math.PI * angel + 90;
  }
  /**
   * 渲染指针
   * @param {Number} angle 角度
   */


  renderPointer(d, i, maxTickTextFontSize) {
    var style = this.style('pointer')(d, d.dataOrigin, i);

    if (style === false) {
      return;
    } // 动画


    var {
      from,
      to
    } = this.animations[i];
    var fromRotate = this.transformArcAngle2Rotate(from.endAngle);
    var toRotate = this.transformArcAngle2Rotate(to.endAngle);
    var pointerAnimation = {
      from: {
        transform: {
          rotate: fromRotate
        }
      },
      to: {
        transform: {
          rotate: toRotate
        }
      }
    }; // 半径

    var radius = this.radius;
    var {
      tickLength,
      labelOffset,
      lineWidth,
      pointerWidth
    } = this.attr(); // 指针顶部离仪表盘的距离

    var pointerTopOffset = tickLength + lineWidth + labelOffset + maxTickTextFontSize + 10;

    if (tickLength < 0) {
      pointerTopOffset = pointerTopOffset - tickLength - labelOffset;
    } // 指针长度


    var pointerLen = radius - pointerTopOffset; // 指针宽度

    var pWidth = radius / 10;

    if (isNumber(pointerWidth)) {
      pWidth = pointerWidth;
    } else if (isArray(pointerWidth)) {
      pWidth = i < pointerWidth.length ? pointerWidth[i] : pointerWidth[pointerWidth.length - 1];
    } // 指针角度


    var pointerAngle = this.transformArcAngle2Rotate(d.endAngle); // 指针颜色

    var color = this.color(i);
    var attr = {
      fillColor: color,
      strokeColor: 'transparent',
      transform: {
        rotate: pointerAngle
      },
      zIndex: 11,
      anchor: [0.5, 1],
      pos: [radius, radius],
      points: [[pWidth / 2, pointerTopOffset], [pWidth, pointerTopOffset + pointerLen * 0.9], [pWidth / 2, radius], [0, pointerTopOffset + pointerLen * 0.9], [pWidth / 2, pointerTopOffset]]
    };
    return qcharts.h(Polygon, _extends({}, attr, style, {
      animation: this.resolveAnimation(_objectSpread({}, pointerAnimation, {
        duration: 300
      }))
    }));
  }

  render() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var {
      title,
      subTitle,
      startAngle,
      endAngle,
      lineWidth,
      lineCap,
      strokeBgcolor,
      hoverBg
    } = this.attr();
    var center = this.center;
    var radius = this.radius;
    var labelCenter = [radius, radius * 1.4];
    var ticks = this.ticks;
    var tickLine = this.isStyleExist('tickLine');
    var tickText = this.isStyleExist('tickText');
    var gradientColor = null; // 默认使用内置的渐变配色方案

    if (this._useBuiltInColors !== false) {
      var colors = this.color().reverse();
      gradientColor = {
        vector: [0, 0, center[0] * 2, center[1] * 2],
        colors: [{
          color: colors[0],
          offset: 0
        }, {
          color: colors[1],
          offset: 0.3
        }, {
          color: colors[2],
          offset: 1
        }]
      };
    }

    var maxTickTextFontSize = 16;

    if (tickText !== false) {
      data.map((d, i) => {
        ticks.map((tick, j) => {
          var style = this.style('tickText')(d, d.dataOrigin, j);

          if (style && style.fontSize) {
            if (isNumber(style.fontSize) && maxTickTextFontSize < style.fontSize) {
              maxTickTextFontSize = style.fontSize;
            }

            if (isString(style.fontSize)) {
              var realSize = Number(style.fontSize.replace('px', ''));

              if (isNumber(realSize) && maxTickTextFontSize < realSize) {
                maxTickTextFontSize = realSize;
              }
            }
          }
        });
      });
    }

    return qcharts.h(Group, {
      display: "flex",
      justifyContent: data.length === 1 ? 'center' : 'space-between',
      alignItems: 'center',
      clipOverflow: false
    }, data.map((d, i) => {
      return qcharts.h(Group, {
        bgcolor: "transparent",
        clipOverflow: false,
        hoverState: {
          bgcolor: hoverBg
        }
      }, qcharts.h(Arc, {
        lineWidth: lineWidth,
        lineCap: lineCap,
        startAngle: startAngle,
        endAngle: endAngle,
        color: strokeBgcolor,
        radius: this.radius,
        zIndex: 10
      }), qcharts.h(Arc, _extends({
        lineCap: lineCap,
        lineWidth: lineWidth
      }, d, {
        zIndex: 10,
        animation: this.resolveAnimation(_objectSpread({}, this.animations[i], {
          duration: 300
        }))
      }, gradientColor ? {
        strokeColor: gradientColor
      } : {
        strokeColor: this.color[i]
      }, this.style('arc')(d, d.dataOrigin, i))), this.renderPointer(d, i, maxTickTextFontSize), title ? qcharts.h(Label, _extends({
        text: isFunction(title) ? title(d.dataOrigin) : title,
        pos: labelCenter,
        textAlign: "center",
        zIndex: 10,
        anchor: [0.5, 1]
      }, this.style('title')(d, d.dataOrigin, i))) : null, subTitle ? qcharts.h(Label, _extends({
        text: isFunction(subTitle) ? subTitle(d.dataOrigin) : subTitle,
        pos: labelCenter,
        textAlign: "center",
        zIndex: 10,
        color: strokeBgcolor,
        anchor: [0.5, 0]
      }, this.style('subTitle')(d, d.dataOrigin, i))) : null, tickLine !== false || tickText !== false ? ticks.map((tick, j) => qcharts.h(Group, {
        pos: center.map(v => v - lineWidth / 2),
        anchor: [0, 0],
        zIndex: 1010,
        size: [1, 1],
        clipOverflow: false
      }, tickLine !== false ? qcharts.h(Polyline, _extends({
        points: tick.points,
        strokeColor: strokeBgcolor
      }, this.style('tickLine')(d, d.dataOrigin, j))) : null, tickText !== false ? qcharts.h(Label, _extends({}, tick.label, this.style('tickText')(d, d.dataOrigin, j))) : null)) : null);
    }));
  }

  rendered() {
    this.on('resize', () => this.forceUpdate());
  }

}