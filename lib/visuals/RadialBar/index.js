function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { Group, Arc } from 'spritejs';
import { BaseVisual } from '../../core';
import { flattern, clone } from '../../util';
export class RadialBar extends BaseVisual {
  constructor() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(attrs);
    this.animators = [];
  }

  get name() {
    return 'RadialBar';
  }

  getDefaultAttrs() {
    return {
      radius: 0.8,
      innerRadius: 0,
      startAngle: Math.PI * -0.5,
      endAngle: Math.PI * 1.5,
      lineWidth: 5,
      strokeBgcolor: '#f5f5f5'
    };
  }

  get maxOuterRadius() {
    var {
      startAngle,
      endAngle,
      radius,
      size
    } = this.attr();
    var [width, height] = size;

    if (endAngle - startAngle === Math.PI / 2) {
      return Math.min(width, height) * radius;
    } else {
      return Math.min(width, height) / 2 * radius;
    }
  }

  get center() {
    var {
      startAngle,
      endAngle,
      radius,
      size
    } = this.attr();
    var angle = (endAngle + startAngle) / 2;
    var [width, height] = size;
    var maxRadius = this.maxOuterRadius;
    var [x, y] = [width / 2 - maxRadius, height / 2 - maxRadius];

    if (endAngle - startAngle === Math.PI / 2) {
      // 区分象限
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      var maxWidth = radius * width;
      var maxHeight = radius * height;
      x += cos < 0 ? maxWidth / 2 : -(maxWidth / 2);
      y += sin < 0 ? maxHeight / 2 : -(maxHeight / 2);
    }

    return [x, y];
  }

  get innerRadius() {
    var {
      radius,
      innerRadius
    } = this.attr();
    return innerRadius <= 0 ? 0 : this.maxOuterRadius / radius * innerRadius;
  }

  transform(data) {
    var {
      startAngle,
      endAngle,
      max,
      min,
      lineWidth
    } = this.attr();
    var total = 0;

    if (!isNaN(max) && !isNaN(min)) {
      total = max - min;
    } else {
      var cloneData = clone(data);
      cloneData.sort((a, b) => b.__valueGetter__() - a.__valueGetter__());
      total = cloneData[0].__valueGetter__() * 1.3;
    }

    var angle = endAngle - startAngle;
    var innerRadius = this.innerRadius;
    var outerRadius = this.maxOuterRadius;
    var arcOffset = 0.5;
    var len = data.length;
    var perRadius = ((outerRadius - innerRadius) * 2 - lineWidth * (lineWidth >= 5 ? 1 : len - 1)) / ((len * 2 - 1) * (1 + arcOffset));
    var value = null;
    data.forEach((d, i) => {
      value = +d.__valueGetter__();
      d.pos = [outerRadius, outerRadius];
      d.anchor = [0.5, 0.5];
      d.lineWidth = lineWidth;
      d.startAngle = startAngle;
      d.endAngle = d.disabled ? startAngle : startAngle + angle * value / total;
      d.innerRadius = innerRadius + i * (1 + arcOffset) * perRadius;
      d.radius = d.innerRadius + 1 * perRadius;
      d.strokeColor = this.color(i);
      var normalStyle = this.style('arc')(d, d.dataOrigin, d.index);
      Object.assign(d, normalStyle);
      d.lineCap = !d.disabled ? d.lineCap : 'butt'; // round 会导致禁用后显示成一个原点
    });
    return data;
  }

  beforeRender() {
    super.beforeRender();
    var startAngle = this.attr('startAngle');
    var data = flattern(this.getData());
    data = this.transform(data);
    this.animators = data.map(d => ({
      from: {
        startAngle,
        endAngle: startAngle
      },
      to: {
        startAngle,
        endAngle: d.endAngle
      }
    }));
    return data;
  }

  beforeUpdate() {
    super.beforeUpdate();
    var {
      startAngle
    } = this.attr('');
    var data = flattern(this.getData());
    data = this.transform(data);
    this.animators = data.map((d, i) => {
      if (d.anticlockwise) {
        return d.disabled ? {
          from: {
            opacity: 1
          },
          to: {
            opacity: 0
          }
        } : {
          from: {
            opacity: 1
          },
          to: {
            opacity: 1
          }
        };
      } else {
        var prev = this.animators[i] ? this.animators[i].to : data[i - 1];

        if (!prev) {
          prev = {
            startAngle: startAngle,
            endAngle: startAngle
          };
        }

        return {
          from: {
            startAngle: prev.startAngle,
            endAngle: prev.endAngle
          },
          to: {
            startAngle: d.startAngle,
            endAngle: d.endAngle
          }
        };
      }
    });
    return data;
  }

  render() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var {
      strokeBgcolor
    } = this.attr('');
    return qcharts.h(Group, {
      clipOverflow: false
    }, data.map((d, i) => {
      return qcharts.h(Group, {
        pos: this.center,
        size: [this.maxOuterRadius * 2, this.maxOuterRadius * 2],
        clipOverflow: false
      }, qcharts.h(Arc, _extends({}, d, {
        startAngle: 0,
        endAngle: Math.PI * 2,
        strokeColor: strokeBgcolor
      })), qcharts.h(Arc, _extends({}, d, {
        animation: this.resolveAnimation(_objectSpread({}, this.animators[i], {
          duration: 300,
          delay: 0
        })),
        hoverState: this.style('arc:hover')(d, d.dataOrigin, d.index)
      })));
    }));
  }

}