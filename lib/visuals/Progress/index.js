function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Arc, Wave, Label } from 'spritejs';
import { BaseVisual } from '../../core';
import { flattern, isArray, requestAnimationFrame, cancelAnimationFrame } from '../../util';
export class Progress extends BaseVisual {
  constructor() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(attrs);
    this.$label = null;
    this.animations = [];
    this.timers = [];
    this.__hasFixRadiusByLabel = false;
  }

  getDefaultAttrs() {
    return {
      min: 0,
      max: 1,
      hoverBg: '#f8f8f8',
      offset: 10,
      type: 'pie',
      startAngle: 0,
      endAngle: Math.PI * 2,
      strokeBgcolor: '#ccc',
      lineWidth: 10,
      padding: 5,
      label: true,
      labelPosition: 'bottom',
      formatter: d => d
    };
  }

  transform(data) {
    var {
      min,
      max,
      padding,
      offset,
      lineWidth,
      size,
      labelPosition,
      startAngle,
      endAngle,
      type
    } = this.attr();
    var total = max - min; // 需要注意的是：文字会占去一部分宽高，所以需要根据文字宽高进行一次修正
    // 而文字只有渲染以后才能获取到宽高

    var labelSize = this.$label && this.$label.contentSize || [0, 0];
    var width = Math.min(size[0], size[1]);

    if (labelPosition === 'top' || labelPosition === 'bottom') {
      width -= Math.ceil(labelSize[1]);
    } else {
      width -= Math.ceil(labelSize[0]);
    }

    this.chart.layer.prepareRender().then(() => {
      if (this.$label && !this.__hasFixRadiusByLabel) {
        this.update();
        this.__hasFixRadiusByLabel = this.$label.contentSize.every(v => v > 0);
      }
    });
    var margin = padding + lineWidth + offset; // wave 内部圆环外边距

    var len = data.length;
    var radius = (width / len - margin * 2) / 2;

    if (radius <= 0) {
      radius = offset + 1;
    }

    var innerRadius = radius - offset;
    return data.map((d, i) => {
      var value = d.__valueGetter__();

      var color = this.color(i);
      var percent = d.disabled ? 0 : isArray(value) ? value.map(v => v / total) : value / total;

      var attrs = _objectSpread({}, d, {
        anchor: [0.5, 0.5],
        color,
        radius,
        maxRadius: radius,
        outerRadius: radius,
        innerRadius,
        offset,
        lineWidth
      });

      return type === 'pie' ? isArray(percent) ? percent.reduce((a, c, i) => {
        var sa = i === 0 ? startAngle : a[i - 1].endAngle;
        var ea = sa + (endAngle - startAngle) * c + startAngle;
        a.push(Object.assign({
          startAngle: sa,
          endAngle: ea
        }, attrs, {
          color: this.color(i),
          fillColor: this.color(i)
        }));
        return a;
      }, []) : _objectSpread({
        startAngle,
        endAngle: (endAngle - startAngle) * percent + startAngle
      }, attrs) : _objectSpread({}, attrs, {
        percent,
        wavesColor: isArray(value) ? value.map((_, j) => this.color(j)) : color,
        outlineColor: color
      });
    });
  }

  handleData() {
    var type = this.attr('type');
    var data = flattern(this.getData());
    var ret = this.transform(data);
    this.animations = ret.map((d, i) => ({
      from: this.animations[i] && this.animations[i].to || (type !== 'pie' ? {
        percent: isArray(d.percent) ? d.percent.map(_ => 0) : 0
      } : isArray(d) ? d.map((t, i) => i === 0 ? {
        startAngle: t.startAngle,
        endAngle: t.startAngle
      } : {
        startAngle: d[i - 1].endAngle,
        endAngle: t.startAngle
      }) : {
        startAngle: d.startAngle,
        endAngle: d.startAngle
      }),
      to: type !== 'pie' ? {
        percent: d.percent
      } : isArray(d) ? d.map(t => ({
        startAngle: t.startAngle,
        endAngle: t.endAngle
      })) : {
        startAngle: d.startAngle,
        endAngle: d.endAngle
      }
    }));
    return ret;
  }

  beforeRender() {
    super.beforeRender();
    return this.handleData();
  }

  beforeUpdate() {
    super.beforeUpdate();
    return this.handleData();
  }

  renderWave(d, i) {
    var animate = el => {
      if (!d.disabled) {
        cancelAnimationFrame(this.timers[i]);
        var speed = 0;

        var step = () => {
          speed += 0.1;
          el.attr('speed', speed);
          this.timers[i] = requestAnimationFrame(step);
        };

        this.timers[i] = requestAnimationFrame(step);
      } else {
        this.timers[i] = requestAnimationFrame(() => {
          cancelAnimationFrame(this.timers[i]);
        });
      }
    };

    return qcharts.h(Wave, _extends({}, d, this.style('normal')(d, d.dataOrigin, i), d.disabled ? {
      wavesColor: isArray(d.percent) ? d.percent.map(_ => '#ccc') : '#ccc',
      outlineColor: '#ccc'
    } : {}, {
      hoverState: this.style('hover')(d, d.dataOrigin, i),
      anchor: [0.5, 0.5],
      percent: d.percent,
      ref: el => animate(el),
      animation: _objectSpread({}, this.animations[i], {
        duration: 300
      })
    }));
  }

  renderPies(d, i, data) {
    var {
      startAngle,
      endAngle,
      strokeBgcolor
    } = this.attr();
    var onlyOne = false;

    if (!isArray(d)) {
      d = [d];
      onlyOne = true;
    }

    var radius = d[0].radius;
    return qcharts.h(Group, {
      border: [1, 'transparent'],
      clipOverflow: false
    }, qcharts.h(Arc, _extends({}, d[0], {
      startAngle: startAngle,
      endAngle: endAngle,
      color: strokeBgcolor,
      pos: [radius, radius]
    })), d.map((t, j) => qcharts.h(Arc, _extends({}, t, this.style('normal')(d[0], d[0].dataOrigin, i), {
      pos: [radius, radius],
      zIndex: j + 1,
      endAngle: t.endAngle,
      animation: _objectSpread({}, onlyOne ? isArray(this.animations[i]) ? this.animations[i][0] : this.animations[i] : this.animations[i][j], {
        duration: 300
      })
    }))));
  }

  renderChildren(d, i, data, labelPosition) {
    var type = this.attr('type');
    var components = [].concat(type === 'pie' ? [this.renderPies(d, i, data)] : [this.renderWave(d, i, data)], [this.attr('label') ? qcharts.h(Label, _extends({
      ref: el => this.$label = el
    }, this.style('label')(d, d.dataOrigin, i), {
      hoverState: this.style('label:hover')(d, d.dataOrigin, i),
      text: this.attr('formatter')(d.dataOrigin || d),
      margin: 5
    })) : null]);
    return labelPosition === 'top' || labelPosition === 'left' ? components.reverse() : components;
  }

  render(data) {
    var {
      hoverBg,
      labelPosition,
      size
    } = this.attr();
    var len = data.length;
    return qcharts.h(Group, {
      zIndex: -1
    }, data.map((d, i) => {
      return qcharts.h(Group, {
        size: [size[0] / len, size[1]],
        clipOverflow: false,
        x: i * size[0] / len,
        height: size[1],
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: labelPosition === 'top' || labelPosition === 'bottom' ? 'column' : 'row',
        bgcolor: 'transparent',
        hoverState: {
          bgcolor: hoverBg
        },
        onMouseenter: (_, el) => {
          this.chart.setCanvasCursor('pointer');
          el.attr('state', 'hover');
        },
        onMousemove: evt => this.dataset.hoverData(_objectSpread({}, evt, {
          data: _objectSpread({}, d.dataOrigin, {
            color: d.color
          })
        })),
        onMouseleave: (_, el) => {
          this.chart.setCanvasCursor('default');
          this.dataset.hoverData(null);
          el.attr('state', 'normal');
        }
      }, this.renderChildren(d, i, data, labelPosition));
    }));
  } // update() {
  //   this.forceUpdate()
  // }


  rendered() {
    this.on('resize', () => this.forceUpdate());
  }

}