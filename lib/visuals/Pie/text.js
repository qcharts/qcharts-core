function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { Label } from 'spritejs';
import { isBoolean } from '../../util';
export var withText = (visual, attrs) => {
  var {
    startAngle,
    endAngle,
    pos: center,
    maxRadius: outerRadius,
    innerRadius,
    dataOrigin,
    index
  } = attrs;

  if (attrs.disabled) {
    return null;
  }

  var textStyle = visual.style('text')(attrs, dataOrigin, index);

  if (!textStyle) {
    return;
  }

  var angle = (startAngle + endAngle) / 2;
  var pos = [outerRadius * (1 + Math.cos(angle)) + center[0] - (outerRadius - innerRadius) / 2 * Math.cos(angle), outerRadius * (1 + Math.sin(angle)) + center[1] - (outerRadius - innerRadius) / 2 * Math.sin(angle)];
  return qcharts.h(Label, _extends({
    color: '#fff',
    fontSize: '12px',
    text: attrs.__valueGetter__(),
    pos,
    zIndex: 1000,
    anchor: [0.5, 0.5] // rotate: (angle / Math.PI) * 180

  }, isBoolean(textStyle) ? {} : textStyle, {
    onMousemove: (_, el) => el.attr('state', 'hover'),
    onMouseleave: (_, el) => el.attr('state', 'normal'),
    hoverState: visual.style('text:hover')(attrs, attrs.dataOrigin, attrs.index)
  }));
};