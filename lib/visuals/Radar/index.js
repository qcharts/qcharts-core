function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Polyline, Label, Circle } from 'spritejs';
import { BaseVisual } from '../../core';
import { isArray, isNumber } from '../../util/is';
import { hexToRgba } from '../../util/color';
import layout from './layout';
import { getSymbolAndStyle } from '../../util/pointSymbol';
export class Radar extends BaseVisual {
  constructor() {
    var attr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(attr);
    this.$areaEl = [];
    this.$pointEl = [];
    this.$axisEl = [];
    this.$gridEl = [];
    this.$labelEl = [];
    this.$scaleEl = [];
    this.isUpdate = false; // 网格背景数据备份，数据全部隐藏的时候显示上一个备份的数据

    this.lastGridAttr = [];
  }

  get name() {
    return 'Radar';
  }

  getDefaultAttrs() {
    return {
      size: ['100%', '100%'],
      pos: [0, 0],
      padding: [0, 0, 0, 0],
      gridType: 'polygon',
      // 网格类型,polygon,circle
      splitNumber: 4,
      // 网格层次
      startAngle: 270,
      // 起始角度
      radius: 0.6,
      // 雷达图半径
      labelOffset: 7 // 文字偏移

    };
  }

  get padding() {
    var {
      padding
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

  get center() {
    var {
      size
    } = this.attr();
    var [width, height] = size;
    return [width / 2, height / 2];
  }

  get len() {
    var {
      radius
    } = this.attr();
    return Math.min(...this.center) * radius;
  }

  _layout() {
    var dataSet = this.getData(); // // FIXME 数据筛选之前先按照label进行排序?是否需要？

    var len = this.len;
    var {
      splitNumber,
      startAngle,
      labelOffset
    } = this.attr();
    var {
      sectionAttrs,
      axisAttrs,
      gridAttrs
    } = layout(dataSet, len, splitNumber, startAngle, labelOffset);
    sectionAttrs.forEach((s, i) => {
      var color = this.color(i);
      var fillColor = hexToRgba(color, 0.3);
      s.strokeColor = color;
      s.fillColor = fillColor;
    });
    var sLen = sectionAttrs.length;

    for (var i = sLen; i < this.$areaEl.length; i++) {
      this.$areaEl[i] = null;
    }

    return {
      sectionAttrs,
      axisAttrs,
      gridAttrs
    };
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
      data: {
        color: attr.fillColor,
        data: attr.dataOrigin
      }
    }, evt));
  }

  hideTooltip() {
    this.dataset.hoverData(null);
  }

  beforeUpdate() {
    super.beforeUpdate();
    this.isUpdate = true;
    return this._layout();
  }

  beforeRender() {
    super.beforeRender();
    return this._layout();
  }

  update() {
    this.forceUpdate();
  }

  _getScaleAnimation(toScale) {
    return {
      from: {
        scale: 0
      },
      to: {
        scale: toScale
      }
    };
  }

  _getStyle(type, attr, data, index) {
    return {
      style: this.style(type)(attr, data, index),
      hoverState: this.style("".concat(type, ":hover"))(attr, data, index),
      onMouseenter: (_, el) => el.attr('state', 'hover'),
      onMouseleave: (evt, el) => {
        el.attr('state', 'normal');
        this.chart.setCanvasCursor('default');
      }
    };
  }

  _isSamePoints(fromPts, toPts) {
    if (fromPts.toString() === toPts.toString()) {
      return true;
    }

    return false;
  }

  _getPolylineAnimation(attr, index) {
    var newAttr = attr;

    var animation = this._getScaleAnimation(1); // 更新的动画


    var preEl = this.$areaEl[index];

    if (preEl) {
      var {
        points: toPoints
      } = attr,
          other = _objectWithoutProperties(attr, ["points"]);

      var {
        points
      } = preEl.attr();

      if (!this._isSamePoints(points, toPoints)) {
        animation = {
          from: {
            points
          },
          to: {
            points: toPoints
          },
          useTween: true
        };
        newAttr = other;
      } else {
        animation = {};
      }
    }

    return {
      attr: newAttr,
      animation
    };
  } // 控制tooltip的显示与隐藏


  createBgGridEl(attr, GridShape) {
    return qcharts.h(GridShape, _extends({}, attr, {
      strokeColor: 'transparent',
      onMousemove: (evt, el) => {
        Promise.resolve().then(_ => {
          var targetSprites = evt.targetSprites;

          if (targetSprites) {
            var targets = targetSprites.filter(e => e.attr('$elType') === 'section');
            var topEls = targets.sort((a, b) => b.attr('zIndex') - a.attr('zIndex'));

            if (topEls.length > 0) {
              this.$areaEl.forEach(e => {
                e && e.attr('state', 'normal');
              });
              topEls[0].attr('state', 'hover');
              this.showTooltip(evt, topEls[0].attr());
            } else {
              this.$areaEl.forEach(e => {
                if (e && e.attr('state') !== 'normal') {
                  e.attr('state', 'normal');
                }
              });
              this.hideTooltip();
              this.chart.setCanvasCursor('default');
            }
          }
        });
      }
    }));
  }

  renderGrid(gridAttrs) {
    if (gridAttrs.length !== 0) {
      this.lastGridAttr = gridAttrs;
    } else {
      gridAttrs = this.lastGridAttr;
    }

    var {
      gridType
    } = this.attr();
    var GridShape = Polyline;
    var anchor = [0, 0];

    if (gridType === 'circle') {
      GridShape = Circle;
      anchor = [0.5, 0.5];
    }

    var grids = gridAttrs.map((attr, i) => {
      var animation = this.isUpdate ? {} : this._getScaleAnimation(attr.scale);

      var _this$_getStyle = this._getStyle('grid', attr, null, i),
          {
        style
      } = _this$_getStyle,
          other = _objectWithoutProperties(_this$_getStyle, ["style"]);

      if (style === false) {
        return;
      }

      return qcharts.h(GridShape, _extends({
        ref: el => this.getEl(i, el, 'grid'),
        anchor: anchor
      }, attr, style, other, {
        animation: this.resolveAnimation(animation)
      }));
    });
    var bgGrid = this.createBgGridEl(gridAttrs[0], GridShape);
    grids.push(bgGrid);
    return grids;
  }

  renderAxis(axisAttrs) {
    var animation = this.isUpdate ? {} : this._getScaleAnimation(1);
    return axisAttrs.map((attr, i) => {
      if (attr.disabled) {
        return;
      }

      var _this$_getStyle2 = this._getStyle('axis', attr, {
        text: attr.label
      }, i),
          {
        style
      } = _this$_getStyle2,
          other = _objectWithoutProperties(_this$_getStyle2, ["style"]);

      if (style === false) {
        return;
      }

      return qcharts.h(Group, {
        clipOverflow: false,
        size: [1, 1]
      }, qcharts.h(Polyline, _extends({
        ref: el => this.getEl(i, el, 'axis')
      }, attr, style, other, {
        animation: this.resolveAnimation(animation)
      })), this._renderAxisLabel(attr, i), this._renderAxisScale(attr, i));
    });
  }

  _renderAxisLabel(attrs, i) {
    var calcAnchor = radian => {
      var x = 0.5 - Math.cos(radian);
      var y = 0.5 - Math.sin(radian);
      return [x, y];
    };

    var {
      label,
      labelPos,
      radian
    } = attrs;
    var anchor = calcAnchor(radian);
    var attr = {
      text: label,
      pos: labelPos,
      color: '#67728C',
      radian,
      anchor,
      font: '12px 宋体'
    };
    var animation = this.isUpdate ? {} : this._getScaleAnimation(1);

    var _this$_getStyle3 = this._getStyle('label', attr, {
      text: attr.label,
      radian
    }, i),
        {
      style
    } = _this$_getStyle3,
        other = _objectWithoutProperties(_this$_getStyle3, ["style"]);

    if (style === false) {
      return;
    }

    return qcharts.h(Label, _extends({
      ref: el => this.getEl(i, el, 'label')
    }, attr, style, other, {
      animation: this.resolveAnimation(animation)
    }));
  }

  _renderAxisScale(attrs, index) {
    var _this = this;

    var getPt = attrs => {
      var {
        points,
        splitNumber,
        maxScale
      } = attrs;
      var [x, y] = points[1];
      var perNum = maxScale / splitNumber;
      return [[x / splitNumber, y / splitNumber], perNum];
    };

    var [[perX, perY], perNum] = getPt(attrs);
    var labels = [];
    var display = index === 0 ? 'block' : 'none';
    var common = {
      font: '12px "宋体"',
      anchor: [1, 0.5],
      translate: [-5, 0],
      display
    };

    for (var i = 0; i < attrs.splitNumber + 1; i++) {
      var point = [perX * i, perY * i];
      var text = perNum * i;

      var attr = _objectSpread({
        text,
        color: '#67728C',
        pos: point
      }, common);

      var _this$_getStyle4 = this._getStyle('scale', attr, {
        text,
        index
      }, i),
          {
        style
      } = _this$_getStyle4,
          other = _objectWithoutProperties(_this$_getStyle4, ["style"]);

      if (style === false) {
        return;
      }

      if (attr.display !== 'none') {
        (function () {
          var elIndex = index * attrs.splitNumber + i;
          var preEl = _this.$scaleEl[elIndex];
          var animation = _this.isUpdate ? {} : {
            from: {
              pos: [0, 0]
            },
            to: {
              pos: point
            }
          };

          if (preEl) {
            var {
              text: preText
            } = preEl.attr();
            var numText = Number(preText);

            if (numText !== text) {
              animation = {
                from: {
                  text: numText
                },
                to: {
                  text
                },
                attrFormatter: attr => {
                  attr.text = attr.text.toFixed(0);
                  return attr;
                },
                useTween: true
              };
            }
          }

          labels.push(qcharts.h(Label, _extends({
            ref: el => _this.getEl(elIndex, el, 'scale')
          }, attr, style, other, {
            animation: _this.resolveAnimation(animation)
          })));
        })();
      }
    }

    return labels;
  }

  renderSection(sectionAttrs) {
    return sectionAttrs.map((attr, i) => {
      if (attr.disabled) {
        this.$areaEl[i] = null;
        return;
      }

      var {
        animation
      } = this._getPolylineAnimation(attr, i);

      var _this$_getStyle5 = this._getStyle('section', attr, _objectSpread({}, attr.dataOrigin), i),
          {
        style,
        hoverState
      } = _this$_getStyle5,
          other = _objectWithoutProperties(_this$_getStyle5, ["style", "hoverState"]);

      if (style === false) {
        return;
      }

      var hoverStyle = hoverState;

      if (!hoverState) {
        hoverStyle = {};
        var {
          lineWidth = 1
        } = attr;
        hoverStyle.lineWidth = lineWidth + 1;
      }

      return qcharts.h(Polyline, _extends({
        ref: el => this.getEl(i, el, 'area'),
        zIndex: 9 + i,
        animation: this.resolveAnimation(animation)
      }, attr, style, {
        hoverState: hoverStyle
      }, other));
    });
  }

  renderPoints(sectionAttrs) {
    var allPoints = sectionAttrs.map((attrs, index) => {
      if (attrs.disabled) {
        return;
      }

      var {
        points,
        dataOrigin,
        strokeColor
      } = attrs;
      var prePoints;

      if (this.$areaEl[index]) {
        prePoints = this.$areaEl[index].attr().points;
      }

      return points.map((point, i) => {
        var attr = {
          fillColor: strokeColor,
          strokeColor,
          radius: 3,
          dataOrigin: dataOrigin[i],
          anchor: [0.5, 0.5]
        };
        var animation = {
          from: {
            pos: [0, 0]
          },
          to: {
            pos: point
          }
        };

        if (prePoints && prePoints[i]) {
          if (!this._isSamePoints(prePoints[i], point)) {
            animation.from.pos = prePoints[i];
            animation.useTween = true;
          } else {
            animation = {};
            attr.pos = point;
          }
        }

        var style = this.style('point')(attr, _objectSpread({}, attr.dataOrigin), i);

        if (style === false) {
          return;
        }

        var hStyle = this.style('point:hover')(attr, attr.dataOrigin, i);
        var {
          PointSymbol,
          normalStyle,
          hoverStyle
        } = getSymbolAndStyle(style, hStyle);
        return qcharts.h(PointSymbol, _extends({
          ref: el => this.getEl(index * sectionAttrs.length + i, el, 'point')
        }, _objectSpread({}, attr, {
          $elType: 'point'
        }), {
          animation: this.resolveAnimation(animation)
        }, normalStyle, {
          hoverState: hoverStyle,
          onMouseenter: (_, el) => {
            el.attr('state', 'hover');
          },
          onMouseleave: (evt, el) => {
            el.attr('state', 'normal');
          }
        }));
      });
    });
    return allPoints.reduce((pre, cur) => pre.concat(cur), []);
  }

  render(_ref) {
    var {
      sectionAttrs,
      axisAttrs,
      gridAttrs
    } = _ref;
    var center = this.center;
    var padding = this.padding;
    var {
      size
    } = this.attr();
    return qcharts.h(Group, {
      size: size,
      padding: padding,
      zIndex: 100,
      clipOverflow: false
    }, qcharts.h(Group, {
      pos: center,
      clipOverflow: false
    }, this.renderGrid(gridAttrs), this.renderAxis(axisAttrs), this.renderSection(sectionAttrs), this.renderPoints(sectionAttrs)));
  }

}