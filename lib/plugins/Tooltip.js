function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

import { Group, Label, Rect } from 'spritejs';
import { isArray, throttle, isFunction } from '../util';
import { BasePlugin } from '../core'; // function refixTooltipPosition(x, y, width, height, vw, vh, gap = 20) {
//   x += gap
//   y += gap
//   let pos = [x, y]
//   if (width > vw) {
//     console.warn('宽度溢出，考虑折行！')
//   } else {
//     if (x + width > vw) {
//       pos[0] = vw - width // x - ((x + width) - vw)
//     }
//   }
//   if (height > vw) {
//     console.warn('高度溢出！')
//   } else {
//     if (y + height > vh) {
//       pos[1] = vh - height // y - ((y + height) - vh)
//     }
//   }
//   pos.forEach((d, i) => {
//     if (d <= 0) {
//       pos[i] = gap
//     }
//   })
//   return pos
// }

function refixTooltipPosition(x, y, w, h, vw, vh) {
  var gap = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 10;

  // 极坐标等坐标系
  if (x < vw / 2) {
    // 左边
    if (w + 2 * gap < x) {
      x -= w + gap;
    } else {
      x += gap;
    }
  } else {
    // 右边
    if (x + w + 2 * gap < vw) {
      x += gap;
    } else {
      x -= w + gap;
    }
  }

  if (x < 0) {
    x = gap;
  }

  if (y < vh / 2) {
    // 上边
    if (h + 2 * gap < y) {
      y -= gap;
    }
  } else {
    // 下边
    if (y + h + 2 * gap < vh) {
      y += gap;
    } else {
      y -= h + gap;
    }
  }

  return [x, y];
}

export class Tooltip extends BasePlugin {
  constructor(attrs) {
    super(attrs);
    this.$group = null;
    this.prevPos = [0, 0];
    this.state = {
      hide: true
    }; // this.init()

    return this;
  }

  getDefaultAttrs() {
    return {
      throttleTime: 300,
      formatter: k => k.value || k,
      title: null,
      pos: null,
      // 一旦设置了此值，tooltip 的位置将固定
      _pos: null // 更新 pos 属性计算出的值，因为 pos 属性可以设置为 百分比

    };
  }

  beforeRender() {
    // super.beforeRender()
    var pos = this.attr('pos');
    this.dataset.on('hover:data', throttle(d => {
      if (!d) {
        !pos && this.setState({
          hide: true
        }, true);
      } else {
        var {
          layerX: x,
          layerY: y,
          data
        } = d;
        var {
          hide
        } = this.state;

        if (hide) {
          // 如果第一次出现，直接出现到当前位置
          this.$group.attr('pos', [x, y]);
        }

        data = isArray(data) ? data : [data];
        var [width, height] = this.$group.contentSize;
        var [t, r, b, l] = this.$group.attr('padding');
        var {
          width: borderWidth
        } = this.$group.attr('border');
        width += r + l + 2 * borderWidth;
        height += t + b + 2 * borderWidth;
        var [chartWidth, chartHieght] = this.chart.getSize();
        this.setState({
          pos: pos || refixTooltipPosition(x, y, width, height, chartWidth, chartHieght),
          data: data,
          hide: false
        }, true);
      }
    }, 300));
  }

  beforeUpdate() {}

  getTheme() {
    return this.chart.resolveTheme('Tooltip');
  }

  render() {
    var _this$getTheme = this.getTheme(),
        {
      title: titleStyle = {},
      group = {},
      icon = {},
      text = {}
    } = _this$getTheme,
        root = _objectWithoutProperties(_this$getTheme, ["title", "group", "icon", "text"]);

    var {
      hide,
      data = []
    } = this.state;
    var titleGetter = this.attr('title');
    var title = typeof titleGetter === 'undefined' ? null : isFunction(titleGetter) ? data && data.length ? titleGetter(data) : null : titleGetter;
    var rootPaddingBottom = root.padding ? isArray(root.padding) ? root.padding[0] : root.padding : root.paddingBottom || 0;
    return qcharts.h(Group, _extends({}, _objectSpread({
      clipOverflow: false,
      flexDirection: 'column',
      zIndex: 9999
    }, this.chart.style('Tooltip')() || {}, {}, root, {}, this.style('background')() || {}), {
      display: hide ? 'none' : 'flex',
      opacity: hide ? 0 : 1
    }), title ? qcharts.h(Label, _extends({
      text: title
    }, titleStyle, this.style('title')() || {})) : null, data.map((d, i) => {
      return qcharts.h(Group, _extends({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        enableCache: false
      }, group, i === 0 ? {
        paddingTop: rootPaddingBottom
      } : {}), qcharts.h(Rect, _extends({}, icon, {
        bgcolor: d.color
      }, this.style('icon')(d, d.dataOrigin, d.index) || {})), qcharts.h(Label, _extends({
        enableCache: false
      }, text, {
        text: this.attr('formatter')(d)
      }, this.style('text')() || {})));
    }));
  }

  updated() {
    var pos = this.state.pos;

    if (pos && pos.length) {
      var width = this.$group['boundingRect'][2];
      this.$group.attr({
        width: width + 0.1
      });
      this.$group.transition(0.2).attr('pos', this.state.pos);
      setTimeout(_ => {
        // 触发reflow
        this.$group.attr({
          width: ''
        });
      });
    }
  }

}