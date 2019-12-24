function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Label, Polyline, Circle } from 'spritejs';
import { BasePlugin } from '../../core';
import { layout } from './layout';
import pieLayout from '../../visuals/Pie/layout';
import { Bar, Scatter, Pie } from '../../visuals/index';
import { mergeStyle } from '../../util/merge-style'; // import { convertPercent2Number as transPx } from '../../util/'

export class Axis extends BasePlugin {
  constructor() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(attrs);
    this.$lines = [];
    this.optionAttrs = attrs;
    this.renderData = [];
  }

  getDefaultAttrs() {
    var dObj = {
      orient: 'bottom',
      // ['top','left','right','bottom']
      axisGap: undefined,
      // 绘制图形是否从0位置开始
      type: undefined,
      // ['value','category']
      target: undefined,
      stack: undefined,
      field: undefined,
      range: undefined,
      // 刻度范围
      coord: 'cartesian2d',
      // [cartesian2d,polar]
      coordPos: ['50%', '50%'],
      splitNumber: 0,
      name: '',
      // 坐标轴名字
      formatter: function formatter(str, data) {
        // 格式化坐标轴文字显示
        return str;
      }
    };
    return dObj;
  }

  beforeRender() {
    super.beforeRender();
    var data = this.getData();
    this.prepareAttrs(this.chart.dataset.attr());
    this.renderData = layout(_objectSpread({}, this.attr(), {
      data
    }));
    this.renderData.scales.forEach(scale => {
      scale.from = scale.to = {
        pos: scale.pos
      };
      scale.labelFrom = scale.labelTo = {
        text: getNumberText(scale.text, this.attr())
      };
    });
    return this.renderData;
  }

  beforeUpdate() {
    super.beforeRender();
    var data = this.getData();
    this.prepareAttrs(this.chart.dataset.attr());
    var oldRenderData = this.renderData;
    this.renderData = layout(_objectSpread({}, this.attr(), {
      data
    }));
    this.renderData.scales.forEach((scale, i) => {
      var from = {
        pos: scale.pos
      };
      var labelFrom = {
        text: getNumberText(scale.text, this.attr())
      };

      if (oldRenderData.scales[i]) {
        from = {
          pos: oldRenderData.scales[i].pos
        };
        labelFrom = {
          text: getNumberText(oldRenderData.scales[i].text, this.attr())
        };
      }

      scale.from = from;
      scale.to = {
        pos: scale.pos
      };
      scale.labelFrom = labelFrom;
      scale.labelTo = {
        text: getNumberText(scale.text, this.attr())
      };
    });
    return this.renderData;
  }

  prepareAttrs(fields) {
    // 处理默认属性，部分属性会默认从对应visula继承过来
    var {
      target: $target,
      orient,
      axisGap
    } = this.attr();
    var optionAttrs = this.optionAttrs;
    var type = 'category'; // 默认按照category分类进行

    var field = fields.text;

    if (this.chart.visuals.length >= 1 && $target === undefined) {
      // 如果visual大于等于一个
      $target = this.chart.visuals[0];
      this.attr({
        target: $target
      });
    }

    if ($target && $target.attr('transpose')) {
      if (orient === 'top' || orient === 'bottom') {
        type = 'value';
      }
    } else if (orient === 'left' || orient === 'right') {
      type = 'value';
    }

    this.attr({
      type,
      field
    });
    this.mergeAttr($target, ['stack', 'axisGap', 'size', 'pos']); // 合并来自对应visual的属性

    if (type === 'value') {
      // 如果为value类型，axisGap强制为false
      this.attr({
        axisGap: false,
        field: fields.value
      });
    }

    if ($target instanceof Scatter) {
      this.attr({
        type: 'value'
      });

      if (orient === 'bottom' || orient === 'top') {
        this.attr({
          field: fields.text
        });
      }
    }

    if (optionAttrs.field !== undefined) {
      this.attr({
        field: optionAttrs.field
      });
    }

    if ($target && $target.attr('layoutWay')) {
      var layoutWay = $target.attr('layoutWay');

      var _field = this.attr('field');

      var curLayout = layoutWay[_field];
      this.attr({
        range: [curLayout.min, curLayout.max]
      });
    }

    if (optionAttrs.type !== undefined) {
      this.attr({
        type: optionAttrs.type
      });
    }

    if (axisGap === undefined && $target instanceof Bar && type === 'category') {
      // 特殊情况Bar特殊处理
      this.attr({
        axisGap: true
      });
    }
  }

  nameStyle(el, attrs) {
    var {
      pos
    } = el.attr();
    var {
      pos: oPos
    } = attrs;

    if (pos && oPos && (pos[0] !== oPos[0] || pos[1] !== oPos[1])) {
      el.reflow();
    }
  }

  mergeAttr($target, arr) {
    if ($target) {
      arr.forEach(name => {
        var tarVal = $target.attr(name);
        var myVal = this.attr(name);

        if ((this.optionAttrs[name] === undefined || myVal === undefined) && tarVal !== undefined) {
          if (name === 'size' || name === 'pos') {
            this.attr('__' + name + '__', tarVal);
          }

          this.attr(name, tarVal);
        }
      });
    }
  }

  mergeTheme(name, args) {
    var themes = this.chart.resolveTheme('Axis')[this.attr('orient')];
    return mergeStyle(this.style(name), args, themes[name]);
  }

  render() {
    var renderData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var axisStyle = this.mergeTheme('axis', [renderData.axisAttrs]);
    var axisName = this.attr('name');
    axisName = String(axisName);
    var nameStyle = this.mergeTheme('name', [renderData.nameAttrs]);
    nameStyle.text = axisName;
    var rings = [];
    var {
      axisGap,
      formatter,
      pos,
      coord,
      size,
      coordPos
    } = this.attr();
    var $target = this.attr('target');

    if ($target instanceof Pie && coord === 'polar') {
      var {
        startAngle,
        endAngle,
        padAngle
      } = $target.attr();
      rings = pieLayout().startAngle(startAngle).endAngle(endAngle).padAngle(padAngle).value(d => +d[0].__valueGetter__())(this.getData().filter(d => !d[0].disabled));
    }

    return qcharts.h(Group, {
      pos: pos
    }, qcharts.h(Group, {
      clipOverflow: false
    }, renderData.scales.map((scale, i) => {
      var labelStyle = this.mergeTheme('label', [renderData.labelAttrs, scale, i]);
      var scaleStyle = this.mergeTheme('scale', [renderData.scaleAttrs, scale, i]);
      var gridStyle = this.mergeTheme('grid', [renderData.gridAttrs, scale, i]);
      var labelAnimation = {
        from: scale.labelFrom,
        to: scale.labelTo,
        duration: 200,
        attrFormatter: attr => {
          if (typeof attr.text === 'number') {
            var text = formatter(formatNumber(attr.text, scale.labelFrom.text, scale.labelTo.text));
            var resAttr = Object.assign(attr, {
              text: text
            });
            return resAttr;
          }

          return attr;
        },
        useTween: true
      };

      if (typeof scale.labelTo.text !== 'number' || typeof scale.labelFrom.text !== 'number') {
        labelAnimation = {};
      }

      return qcharts.h(Group, {
        size: [1, 1],
        pos: scale.from.pos,
        clipOverflow: false,
        animation: this.resolveAnimation({
          from: scale.from,
          to: scale.to,
          duration: 200,
          useTween: true
        })
      }, labelStyle === false ? null : qcharts.h(Label, _extends({}, labelStyle, {
        clipOverflow: false,
        text: formatter(scale.labelTo.text),
        animation: this.resolveAnimation(labelAnimation)
      })), scaleStyle === false ? null : qcharts.h(Polyline, scaleStyle), coord === 'polar' || gridStyle === false || scale.offset === 0 && !axisGap ? null : qcharts.h(Polyline, gridStyle));
    })), qcharts.h(Group, {
      size: size
    }, renderData.scales.map((scale, i) => {
      var gridStyle = this.mergeTheme('grid', [renderData.gridAttrs, scale, i]);
      return coord !== 'polar' || gridStyle === false || scale.offset === 0 && !axisGap ? null : qcharts.h(Circle, _extends({
        pos: coordPos,
        radius: scale.offset
      }, gridStyle, {
        anchor: [0.5]
      }));
    })), qcharts.h(Group, {
      clipOverflow: false
    }, rings.map(ring => {
      // 绘制射线
      var angle = (ring.startAngle + ring.endAngle) / 2;
      var maxRadius = this.attr('target').maxOuterRadius;

      var txt = ring['0'].__textGetter__();

      var anchorX = -Math.cos(angle);
      var anchorY = -Math.sin(angle);
      var anchor = [0.5, 0.5];

      if (Math.abs(anchorX) > Math.abs(anchorY)) {
        anchor[0] = anchorX < 0 ? 0 : anchorX;
      } else {
        anchor[1] = anchorY > 0 ? anchorY : 0;
      }

      var ang = Math.abs(angle / Math.PI * 180 % 90); // 角度转换为[0-90];

      var k = Math.abs(45 - Math.abs(ang - 45)) / 45; // 相关数据转化为[0-1]

      var labelDis = maxRadius * (1.01 + k / 18); // 18为影响因子 1.01为基准距离

      var pos = transPx(coordPos, size);
      var newPoint = [pos[0] + maxRadius * Math.cos(angle), pos[1] + maxRadius * Math.sin(angle)];
      var labelPoint = [pos[0] + labelDis * Math.cos(angle), pos[1] + labelDis * Math.sin(angle)];
      return qcharts.h(Group, {
        clipOverflow: false,
        size: ['100%', '100%']
      }, qcharts.h(Polyline, {
        points: [pos, newPoint],
        color: '#dde0e5',
        lineDash: [3, 4]
      }), qcharts.h(Label, {
        pos: labelPoint,
        color: '#67728C',
        text: formatter(txt),
        fontSize: 12,
        anchor: anchor
      }));
    })), axisStyle === false ? null : qcharts.h(Polyline, _extends({}, axisStyle, {
      pos: renderData.originalPoint
    })), nameStyle === false ? null : qcharts.h(Label, _extends({
      ref: el => this.nameStyle(el, nameStyle)
    }, nameStyle)));
  }

}

function transPx(point, size) {
  return point.map((num, i) => {
    var ind = String(num).indexOf('%');

    if (ind !== -1) {
      return size[i] * num.substr(0, ind) / 100;
    }

    return num;
  });
}

function formatNumber(str, fromStr, toStr) {
  if (typeof str === 'number' && typeof fromStr === 'number' && typeof toStr === 'number') {
    var len = getDigit(toStr);
    return str.toFixed(len);
  }

  return toStr;
}

function getDigit(num) {
  var arrNum = String(num).split('.');

  if (arrNum.length > 1) {
    return arrNum[1].length;
  }

  return 0;
}

function getNumberText(str, attrs) {
  if (!isNaN(str) && attrs.type === 'value') {
    return Number(str);
  }

  return str;
}