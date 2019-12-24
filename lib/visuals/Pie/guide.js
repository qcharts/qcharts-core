import { Group, Polyline, Label } from 'spritejs';
import { isBoolean } from '../../util';
var LINES_MAP = new WeakMap();
var LABELS_MAP = new WeakMap();
export var withGuide = (visual, attrs) => {
  if (attrs.disabled) {
    return null;
  }

  var lineStyle = visual.style('guideline')(attrs, attrs.dataOrigin, attrs.index);
  var textStyle = visual.style('guideText')(attrs, attrs.dataOrigin, attrs.index);

  if (!lineStyle && !textStyle) {
    return null;
  }

  var {
    points,
    anchor,
    labelPos
  } = linePoints(attrs);
  var line = Object.assign({
    points: points,
    strokeColor: attrs.fillColor // 默认采用扇形的填充色

  }, isBoolean(lineStyle) ? {} : lineStyle);
  var label = Object.assign({
    color: '#67728C',
    fontSize: '12px',
    text: attrs.__textGetter__(),
    pos: labelPos,
    anchor // anchor: [direction === 'right' ? 0 : 1, 0.5]

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

function linePoints(attrs) {
  var {
    startAngle,
    endAngle,
    pos: center,
    outerRadius: radius,
    maxRadius
  } = attrs; // const minAngle = Math.PI / 6

  var angle = (startAngle + endAngle) / 2;
  var [centerX, centerY] = center;
  var offset = 0; // 相对父组件外围的偏移量

  var offsetRadius = maxRadius - radius;
  var length = 20; // 起点到中点的距离
  // const length2 = 10 // 中点到终点的距离
  // 绘制所需的3个点坐标
  // 起点

  var [x, y] = [Math.cos(angle) * (radius + offset) + radius + offsetRadius + centerX, Math.sin(angle) * (radius + offset) + radius + offsetRadius + centerY]; // 中点
  // FIXME: 文字重叠问题

  var [cX0, cY0] = [x + length * Math.cos(angle), y + length * Math.sin(angle)];
  var labelPos = [x + (length + 5) * Math.cos(angle), y + (length + 5) * Math.sin(angle)];
  var anchorX = -Math.cos(angle);
  var anchorY = -Math.sin(angle);
  var anchor = [0.5, 0.5];

  if (Math.abs(anchorX) > Math.abs(anchorY)) {
    anchor[0] = anchorX < 0 ? 0 : anchorX;
  } else {
    anchor[1] = anchorY > 0 ? anchorY : 0;
  }

  return {
    points: [[x, y], [cX0, cY0]],
    labelPos,
    anchor
  };
}