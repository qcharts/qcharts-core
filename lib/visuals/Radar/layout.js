import { Global } from '../../core/Global';
/**
 * 根据给定角度和长度获取圆坐标值
 * @param {Number} radian 角度
 * @param {Number} length 长度
 * @returns {Array} [x,y]
 */

var getPointCoordinate = (radian, length) => {
  var x = Math.cos(radian) * length;
  var y = Math.sin(radian) * length;
  return [x, y];
};
/**
 * 获取s数组中最大数除以层级后的整数
 * @param {Array} data
 * @param {Number} splitNumber
 * @returns {Number}
 */


var getMax = (data, splitNumber) => {
  var indicatorMax = Math.max(...data);

  if (indicatorMax < splitNumber * 10) {
    return Math.ceil(indicatorMax / splitNumber) * splitNumber;
  } else {
    return Math.ceil(indicatorMax / 10 / splitNumber) * 10 * splitNumber;
  }
};
/**
 * 根据给定的数据，返回绘制雷达图所需要的数据
 * @param {Array} dataset 数据集
 * @param {Number} radius 雷达图半径
 * @param {Number} splitNumber  雷达图背景层级
 * @param {Number} startAngle 雷达图起始轴角度
 * @param {Number} labelOffset 雷达图文字偏移值
 * @returns {Object} { sectionAttrs, borderAttrs, axisAttrs, gridAttrs }
 */


export default function layout(data, radius, splitNumber, startAngle, labelOffset) {
  var bgPoints = []; // 最外层背景多边形

  var gridAttrs = []; // 蜘蛛网图背景

  var axisAttrs = []; // 坐标轴

  var sectionAttrs = []; // 多边形数据

  if (data.some(d => d.length === 0)) {
    return {
      sectionAttrs,
      axisAttrs,
      gridAttrs
    };
  }

  var allData = data.filter(d => !d[0].disabled).reduce((t, c) => {
    var cv = c.map(d => d.__valueGetter__());
    return t.concat(cv);
  }, []);
  var max = getMax(allData, splitNumber);
  var realMax = getMax(allData.map(val => Global.datasetReverse ? Global.datasetReverse(val) : val), splitNumber); // 每个类别的弧度

  var dimension = data[0].length;
  var perRadian = Math.PI * 2 / dimension; // 起始角度->转弧度

  var startRadian = Math.PI / 180 * startAngle;

  for (var i = 0; i < dimension; i++) {
    // 根据角度和半径，计算对应的坐标
    var currentRadian = i * perRadian + startRadian;
    var point = getPointCoordinate(currentRadian, radius);
    bgPoints.push({
      point,
      radian: currentRadian
    }); // 类别指示坐标

    var labelPos = getPointCoordinate(currentRadian, radius + labelOffset);

    var label = data[0][i].__textGetter__();

    var labelDisabled = data.every(d => d[0].disabled); // 坐标轴属性

    axisAttrs.push({
      points: [[0, 0], point],
      lineWidth: 1,
      lineDash: [3, 2],
      strokeColor: '#DDE0E5',
      label,
      labelPos,
      radian: currentRadian,
      maxScale: realMax,
      splitNumber: splitNumber,
      $elType: 'axis',
      disabled: labelDisabled
    });
  }

  data.forEach((dArray, index) => {
    var categoryPoints = dArray.map((d, i) => {
      var value = d.__valueGetter__();

      var radian = bgPoints[i].radian;
      return getPointCoordinate(radian, value / max * radius);
    });
    var dataOrigin = dArray.map(d => d.dataOrigin);
    var disabled = dArray[0].disabled;
    sectionAttrs.push({
      points: categoryPoints,
      index: index,
      dataOrigin,
      disabled,
      close: true,
      $elType: 'section'
    });
  }); // 背景网格多边形坐标

  var gridPoints = bgPoints.map(p => p.point);

  for (var _i = 0; _i < splitNumber; _i++) {
    var scale = 1 - _i / splitNumber;
    gridAttrs.push({
      scale,
      radius,
      points: gridPoints,
      index: _i,
      opacity: 1,
      lineWidth: 1,
      strokeColor: '#DDE0E5',
      close: true,
      $elType: 'grid'
    });
  }

  return {
    sectionAttrs,
    axisAttrs,
    gridAttrs
  };
}