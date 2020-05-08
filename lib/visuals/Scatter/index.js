function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Polyline, Label } from 'spritejs';
import { BaseVisual } from '../../core';
import { isArray, isNumber } from '../../util/is';
import { scaleLinear } from '../../util/q-scale';
import { hexToRgba } from '../../util/color';
import { getSymbolAndStyle } from '../../util/pointSymbol';
import layout from './layout';
export class Scatter extends BaseVisual {
  constructor() {
    var attr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(attr);
    this.$scatterEl = {};
    this.$guidelineEl = [];
    this._attr = attr;
  }

  getDefaultAttrs() {
    return {
      labelField: null,
      areaField: null,
      areaRange: null,
      showGuideLine: false,
      layoutWay: null
    };
  }

  get name() {
    return 'Scatter';
  }

  get padding() {
    var {
      padding = [0, 0, 0, 0]
    } = this.attr();
    var [top, right, bottom, left] = [0, 0, 0, 0];

    if (isNumber(padding)) {
      top = right = bottom = left = padding;
    } else if (isArray(padding)) {
      if (padding.length === 2) {
        top = bottom = padding[0];
        right = left = padding[1];
      } else {
        ;
        [top, right, bottom, left] = [...padding, 0, 0, 0, 0];
      }
    }

    return [top, right, bottom, left];
  }

  _layout() {
    var dataSet = this.getData();
    var dataAttr = this.dataset._attrs;
    var {
      size
    } = this.attr();
    var layoutWay = this._attr.layoutWay;
    var {
      data,
      layoutWay: newLayoutWay
    } = layout(dataSet, dataAttr, size, layoutWay);
    this.attr('layoutWay', _objectSpread({}, layoutWay, {}, newLayoutWay));
    data.forEach((d, i) => {
      var color = this.color(i);
      var fillColor = hexToRgba(color, 0.3);
      d.forEach(di => {
        di.strokeColor = color;
        di.fillColor = fillColor;
      });
    });
    return data;
  }

  getEl(index, el, type) {
    if (!el) {
      return;
    }

    this["$".concat(type, "El")][index] = el;
  }

  showTooltip(evt, attr) {
    this.chart.setCanvasCursor('pointer');
    this.dataset.hoverData(_objectSpread({
      data: _objectSpread({
        color: attr.fillColor
      }, attr.dataOrigin)
    }, evt));
    var {
      showGuideLine
    } = this.attr();

    if (showGuideLine) {
      var {
        x,
        y
      } = evt;
      var {
        size
      } = this.attr();
      var [offsetX, offsetY] = this.$group.pointToOffset(x, y).map(Math.round);
      this.$guidelineEl.forEach((el, index) => {
        var style = this.style('guideline')(index);

        if (style === false) {
          return;
        }

        el.attr(style);
        var points = index === 0 ? [[0, offsetY], [size[0], offsetY]] : [[offsetX, 0], [offsetX, size[1]]];
        el.attr('points', points);
      });
    }
  }

  hideTooltip() {
    this.dataset.hoverData(null);
    var {
      showGuideLine
    } = this.attr();

    if (showGuideLine) {
      this.$guidelineEl.forEach(el => el.attr('points', [[0, 0], [0, 0]]));
    }
  }

  beforeUpdate() {
    super.beforeUpdate();
    return this._layout();
  }

  beforeRender() {
    super.beforeRender();
    this.$scatterEl = {};
    return this._layout();
  }

  update() {
    this.forceUpdate();
  }

  getRealRadius(attr) {
    var {
      areaRange,
      areaField
    } = this.attr();
    var {
      radius,
      dataOrigin
    } = attr;

    if (!areaField || !dataOrigin.hasOwnProperty(areaField)) {
      return radius;
    }

    if (!areaRange) {
      return dataOrigin[areaField];
    }

    var allData = this.dataset.dataOrigin.map(d => d[areaField]).sort((a, b) => a - b);
    var linear = scaleLinear().domain([allData[0], allData[allData.length - 1]]).range(areaRange);
    var realArea = linear(dataOrigin[areaField]);
    return realArea;
  }

  renderLabel(attr, normalStyle, animation, i) {
    var {
      labelField
    } = this.attr();
    var dataOrigin = attr.dataOrigin;
    var style = this.style('label')(attr, _objectSpread({}, attr.dataOrigin), i);

    if (style === false) {
      return;
    }

    if (labelField && dataOrigin.hasOwnProperty(labelField) || style) {
      var {
        strokeColor
      } = attr,
          other = _objectWithoutProperties(attr, ["strokeColor"]);

      var {
        size,
        lineWidth = 0
      } = normalStyle;
      var text = dataOrigin[labelField];
      var renderText = style && style.text || text;
      var ctx = this.chart.layer.context;
      var textWidth = ctx.measureText(renderText).width;
      var translate = [0, 0];

      if (size * 2 - lineWidth < textWidth * 1.3) {
        translate[1] = size + lineWidth + 10;
      }

      return qcharts.h(Label, _extends({}, _objectSpread({}, other, {
        fillColor: strokeColor,
        text,
        translate,
        anchor: [0.5, 0.5],
        fontSize: '12px'
      }), {
        animation: this.resolveAnimation(animation)
      }, style, {
        hoverState: this.style('label:hover')(attr, attr.dataOrigin, i),
        onMouseenter: (_, el) => {
          el.attr('state', 'hover');
        },
        onMouseleave: (evt, el) => {
          el.attr('state', 'normal');
        }
      }));
    }
  }

  renderGuideline() {
    var _this = this;

    var guildLine = [];
    var attr = {
      points: [[0, 0], [0, 0]],
      strokeColor: '#ddd',
      lineWidth: 1
    };

    var _loop = function _loop(i) {
      var guidelineType = i === 0 ? 'horizontal' : 'vertical ';
      guildLine.push(qcharts.h(Polyline, _extends({
        ref: el => _this.getEl(i, el, 'guideline')
      }, attr, {
        guidelineType: guidelineType,
        translate: [0.5, 0.5]
      })));
    };

    for (var i = 0; i < 2; i++) {
      _loop(i);
    }

    return guildLine;
  }

  renderScatter(data) {
    var {
      row
    } = this.dataset._attrs;
    var scatters = data.map((attrs, index) => {
      return attrs.map((attr, i) => {
        var rowName = row ? attr.dataOrigin[row] : '*';
        var elIndex = "".concat(rowName).concat(i);

        if (attr.disabled) {
          this.$scatterEl[elIndex] = null;
          return;
        } // 根据用户设置的面积字段获得半径


        var radius = this.getRealRadius(attr);
        var style = this.style('point')(attr, _objectSpread({}, attr.dataOrigin), i);

        if (style === false) {
          return;
        }

        style = _objectSpread({
          size: radius
        }, style);
        var hStyle = this.style('point:hover')(attr, attr.dataOrigin, i);

        if (!hStyle) {
          hStyle = {
            size: attr.radius + 1
          };

          if (style) {
            if (isNumber(style.scale)) {
              hStyle.scale = style.scale * 1.2;
            } else if (isNumber(style.size)) {
              hStyle.size = style.size * 1.2;
            } else if (isArray(style.size)) {
              hStyle.size = style.size.map(s => s * 1.2);
            }
          }
        }

        var {
          PointSymbol,
          normalStyle,
          hoverStyle
        } = getSymbolAndStyle(style, hStyle);
        var preEl = this.$scatterEl[elIndex];
        var animation = {
          from: {
            scale: 0
          },
          to: {
            scale: 1
          }
        };

        if (preEl) {
          var pos = preEl.attr('pos');

          if (pos.toString() !== attr.pos.toString()) {
            animation = {
              from: {
                pos
              },
              to: {
                pos: attr.pos
              }
            };
          } else {
            animation = {};
          }
        }

        return qcharts.h(Group, {
          clipOverflow: false
        }, qcharts.h(PointSymbol, _extends({
          ref: el => this.getEl(elIndex, el, 'scatter'),
          animation: this.resolveAnimation(animation)
        }, attr, normalStyle, {
          hoverState: hoverStyle,
          onMouseenter: (_, el) => {
            el.attr('state', 'hover');
          },
          onMousemove: (evt, el) => {
            this.showTooltip(evt, _objectSpread({}, attr), el);
          },
          onMouseleave: (evt, el) => {
            el.attr('state', 'normal');
            this.hideTooltip();
            this.chart.setCanvasCursor('default');
          }
        })), this.renderLabel(attr, normalStyle, animation, index));
      });
    });
    return scatters.reduce((pre, cur) => {
      return pre.concat(cur);
    }, []);
  }

  render(data) {
    var {
      size
    } = this.attr();
    var padding = this.padding;
    return qcharts.h(Group, {
      size: size,
      padding: padding,
      zIndex: 100,
      clipOverflow: false
    }, this.renderScatter(data), this.renderGuideline());
  }

}
export default Scatter;