/**
 * 饼图的布局算法
 */

/**
 * 为 扇形 设置 padAngle
 * @param {*} arr
 * @param {*} padAngle
 */
var attachPadAngleOfArr = function attachPadAngleOfArr(arr) {
  var padAngle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // 设置 padAngle
  var maxPadAngle = Math.min.apply(null, arr.filter(d => !d.disabled).map(a => a.endAngle - a.startAngle));

  if (padAngle >= 0) {
    padAngle = padAngle > maxPadAngle ? maxPadAngle / 2 : padAngle;
    arr.filter(d => !d.disabled).forEach(a => {
      if (a.endAngle - a.startAngle > padAngle * 2) {
        a.padAngle = padAngle;
        a.startAngle += padAngle;
        a.endAngle -= padAngle;
      }
    });
  }
};

var TAU = Math.PI * 2;
export default function pieLayout() {
  var value = v => v;

  var startAngle = 0;
  var endAngle = TAU;
  var padAngle = 0;

  function divide(num, total) {
    if (total <= 0) {
      return 0;
    }

    return num / total;
  }

  function pie(data) {
    var i = 0;
    var len = data.length;
    var sum = 0;
    var arcs = new Array(len);

    while (i < len) {
      if (!data[i].disabled) {
        sum += value(data[i]);
      }

      i++;
    }

    i = 0;

    while (i < len) {
      var sa = i >= 1 ? arcs[i - 1].endAngle : startAngle; // 起始角度

      var proportion = divide(value(data[i]), sum); // 占比

      var ea = data[i].disabled ? sa : sa + proportion * (endAngle - startAngle); // 结束角度

      arcs[i] = Object.assign({}, data[i], {
        index: i,
        id: i,
        startAngle: sa,
        endAngle: ea,
        proportion
      });
      i++;
    }

    attachPadAngleOfArr(arcs, padAngle);
    return arcs;
  }

  pie.value = val => {
    value = val;
    return pie;
  };

  pie.startAngle = angle => {
    startAngle = angle;
    return pie;
  };

  pie.endAngle = angle => {
    endAngle = angle;
    return pie;
  };

  pie.padAngle = angle => {
    padAngle = angle;
    return pie;
  };

  return pie;
}