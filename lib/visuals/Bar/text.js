function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { Label } from 'spritejs';
import { isBoolean } from '../../util';
export var withText = (visual, attrs) => {
  var {
    labelAttrs,
    dataOrigin,
    index
  } = attrs;

  if (attrs.disabled) {
    return null;
  }

  var textStyle = visual.style('text')(attrs, dataOrigin, index, visual.$group);

  if (!textStyle) {
    return;
  }

  var {
    textFrom,
    textTo
  } = visual.fromTos[attrs.index];

  if (textStyle.pos) {
    visual.pillars[attrs.index].labelAttrs.pos = textStyle.pos;

    if (textTo && textTo.pos) {
      textTo.pos = textStyle.pos;
    }
  }

  return qcharts.h(Label, _extends({}, labelAttrs, isBoolean(textStyle) ? {} : textStyle, textFrom, {
    animation: visual.resolveAnimation({
      from: textFrom,
      to: textTo,
      duration: 300,
      delay: 0,
      useTween: true
    }),
    onMousemove: (evt, el) => !visual.attr('mouseDisabled') && el.attr('state', 'hover'),
    onMouseleave: (evt, el) => !visual.attr('mouseDisabled') && el.attr('state', 'normal'),
    hoverState: visual.style('text:hover')(attrs, attrs.dataOrigin, attrs.index)
  }));
};