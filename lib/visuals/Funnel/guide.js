import { Group, Polyline, Label } from 'spritejs';
import { isBoolean } from '../../util';
var LINES_MAP = new WeakMap();
var LABELS_MAP = new WeakMap();
export var withGuide = (visual, attrs, formatter) => {
  if (attrs.dataOrigin.disabled === true) {
    return null;
  }

  var lineStyle = visual.style('guideline')(attrs, attrs.dataOrigin, attrs.index);
  var textStyle = visual.style('guideText')(attrs, attrs.dataOrigin, attrs.index);

  if (!lineStyle && !textStyle) {
    return null;
  }

  var right = attrs.align !== 'right';
  var {
    points
  } = linePoints(attrs, right, lineStyle && lineStyle.length);
  var line = Object.assign({
    points,
    color: '#EDEFF1'
  }, isBoolean(lineStyle) ? {} : lineStyle);
  var label = Object.assign({
    color: '#000',
    fontSize: '12px',
    text: formatter(attrs.dataOrigin) || attrs.dataOrigin.__textGetter__() + attrs.dataOrigin.__valueGetter__(),
    pos: [points[1][0] + (right ? 10 : -10), points[1][1]],
    anchor: [right ? 0 : 1, 0.5]
  }, isBoolean(textStyle) ? {} : textStyle);

  var getPolyline = el => {
    if (LINES_MAP.get(el)) {
      el.animate([LINES_MAP.get(el), line], {
        duration: 300,
        fill: 'forwards'
      }).finished.then(() => el.attr(line) && LINES_MAP.set(el, line));
    } else {
      el.attr(line);
      LINES_MAP.set(el, line);
    }
  };

  var getLabel = el => {
    if (LABELS_MAP.get(el)) {
      el.animate([LABELS_MAP.get(el), label], {
        duration: 300,
        fill: 'forwards'
      }).finished.then(() => el.attr(label) && LABELS_MAP.set(el, label));
    } else {
      el.attr(label);
      LABELS_MAP.set(el, label);
    }
  };

  return qcharts.h(Group, {
    clipOverflow: false,
    size: [1, 1]
  }, lineStyle ? qcharts.h(Polyline, {
    ref: getPolyline,
    onMousemove: (_, el) => {
      el.attr('state', 'hover');
    },
    onMouseleave: (_, el) => {
      el.attr('state', 'normal');
    },
    hoverState: visual.style('guideline:hover')(attrs, attrs.dataOrigin, attrs.index)
  }) : null, textStyle ? qcharts.h(Label, {
    ref: getLabel,
    onMousemove: (_, el) => {
      el.attr('state', 'hover');
    },
    onMouseleave: (_, el) => {
      el.attr('state', 'normal');
    },
    hoverState: visual.style('guideText:hover')(attrs, attrs.dataOrigin, attrs.index)
  }) : null);
};

function linePoints(attrs, right, length) {
  var {
    points
  } = attrs; // 起点

  var x, y;

  if (right) {
    ;
    [x, y] = [(points[1][0] + points[2][0]) / 2 + 10, (points[1][1] + points[2][1]) / 2];
  } else {
    ;
    [x, y] = [(points[0][0] + (points.length === 3 ? points[2][0] : points[3][0])) / 2 - 10, (points[0][1] + (points.length === 3 ? points[2][1] : points[3][1])) / 2];
  } // 终点


  var [cX, cY] = [right ? x + (length || 40) : x - (length || 40), y];
  return {
    points: [[x, y], [cX, cY]]
  };
}