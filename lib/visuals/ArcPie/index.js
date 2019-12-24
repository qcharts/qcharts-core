function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Arc, Label } from 'spritejs';
import { Pie } from '../Pie';
import { isFunction } from '../../util';
export class ArcPie extends Pie {
  getDefaultAttrs() {
    return Object.assign({}, super.getDefaultAttrs(), {
      lineWidth: 10,
      title: null,
      subTitle: null
    });
  }

  transform(data) {
    var ret = super.transform(data);
    var {
      lineWidth,
      startAngle,
      endAngle
    } = this.attr();
    ret = ret.map((d, i) => _objectSpread({
      pos: d.pos,
      disabled: d.disabled,
      startAngle: d.startAngle,
      endAngle: d.endAngle,
      padAngle: d.padAngle,
      innerRadius: d.innerRadius,
      radius: d.outerRadius,
      strokeColor: d.fillColor,
      lineWidth: lineWidth,
      dataOrigin: d.dataOrigin
    }, this.style('arc')(d, d.dataOrigin, i)));
    ret.forEach(d => {
      d.lineCap = !d.disabled ? d.lineCap : 'butt'; // round 会导致禁用后显示成一个原点

      if (d.lineCap && (d.lineCap === 'round' || d.lineCap === 'square')) {
        var r = lineWidth / 2 / (2 * Math.PI * d.radius) * (endAngle - startAngle);
        var se = d.endAngle - d.startAngle;

        if (se > r * 2) {
          d.oriStartAngle = d.startAngle;
          d.oriEndAngle = d.endAngle;
          d.startAngle += r;
          d.endAngle -= r;
        } else {
          if (se <= r) {
            d.lineCap = 'butt'; // 无法绘制 round | square 线帽
          } else {
            d.startAngle += r / 2;
            d.endAngle -= r / 2;
          }
        }
      }
    });
    return ret;
  }

  render() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var {
      title,
      subTitle
    } = this.attr();
    return qcharts.h(Group, {
      clipOverflow: false
    }, data.map((d, i) => {
      return qcharts.h(Group, null, qcharts.h(Arc, _extends({}, d, {
        animation: this.resolveAnimation(_objectSpread({}, this.fromTos[i], {
          duration: 300,
          delay: 0
        })),
        hoverState: this.style('arc:hover')(d, d.dataOrigin, d.index)
      })));
    }), title ? qcharts.h(Label, _extends({
      text: isFunction(title) ? title(data) : title,
      pos: this.center,
      textAlign: "center",
      zIndex: 10,
      padding: 5,
      anchor: subTitle ? [0.5, 0.75] : [0.5, 0.5]
    }, this.style('title')(data, null, null))) : null, subTitle ? qcharts.h(Label, _extends({
      text: isFunction(subTitle) ? subTitle(data) : subTitle,
      pos: this.center,
      textAlign: "center",
      zIndex: 10,
      padding: 5,
      anchor: [0.5, -0.25]
    }, this.style('subTitle')(data, null, null))) : null);
  }

}