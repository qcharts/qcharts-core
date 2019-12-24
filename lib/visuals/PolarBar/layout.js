function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { axis } from '../../util';

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

export default function barLayout() {
  function bar(dataInfo) {
    // 输入
    var data = dataInfo.data;
    var barSize = dataInfo.barSize;
    var stack = dataInfo.stack;
    var groupGap = dataInfo.groupGap;
    var stackGap = dataInfo.stackGap;
    var splitNumber = dataInfo.splitNumber;
    var radius = dataInfo.radius;
    var barInnerRadius = dataInfo.innerRadius;
    var padAngle = dataInfo.padAngle; // 输出

    var barData = [];
    var groupData = [];
    var bgPillarAttr = {
      opacity: 0.00001,
      fillColor: '#000'
    }; // const valueAxis = getAxis(stack, data)

    var valueAxis = axis({
      dataSet: data,
      stack,
      splitNumber
    });

    if (!valueAxis || !valueAxis.length) {
      return {
        barData,
        groupData
      };
    }

    var tableSize = Math.min(barSize[0], barSize[1]);
    var axisValueMax = Math.max.apply(this, valueAxis);
    var axisValueMin = Math.min.apply(this, valueAxis);
    var POSITIVE_RATIO = axisValueMax / (axisValueMax - axisValueMin); // 正负柱子高度比例

    var GROUP_BAR_NUM = computerLegend(data); // 图例显示个数

    var GROUP_NUM = data[0].length;
    var BAR_MAX_HEIGHT = 0.5 * radius * tableSize;
    var BAR_HEIGHT_FACTOR = BAR_MAX_HEIGHT / (axisValueMax - axisValueMin);

    if (!stack) {
      // 分组柱状图
      for (var i = 0, len = GROUP_NUM; i < len; i++) {
        var flag = 0; // 计算当前柱子前面有几根被隐藏

        var value = 0;
        var gpData = {
          rects: []
        };
        var groupAngle = (Math.PI * 2 - GROUP_NUM * groupGap) / GROUP_NUM; // 计算单根柱子

        for (var j = 0, lenj = data.length; j < lenj; j++) {
          if (data[j][i].disabled !== true) {
            data[j][i].disabled = false;
          }

          var barAngle = groupAngle / GROUP_BAR_NUM;
          var startAngle = (groupAngle + groupGap) * i + barAngle * (j - flag) - Math.PI * 0.5;
          value = data[j][i].__valueGetter__();
          var barHeight = BAR_HEIGHT_FACTOR * value;
          var innerRadius = BAR_MAX_HEIGHT * (1 - POSITIVE_RATIO) + barInnerRadius * tableSize * 0.5;

          var rect = _objectSpread({
            innerRadius: innerRadius,
            outerRadius: innerRadius + barHeight,
            startAngle: startAngle,
            endAngle: startAngle + barAngle
          }, data[j][i]);

          if (rect.disabled) {
            rect.endAngle = rect.startAngle;
            rect.radius = 0;
            rect.opacity = 0;
            flag++;
          } else {
            rect.opacity = 1;
            gpData.rects.push(rect);
          }

          barData.push(rect);
        } // 柱子整体属性


        gpData = Object.assign(gpData, _objectSpread({
          innerRadius: barInnerRadius * 0.5 * tableSize,
          outerRadius: (barInnerRadius + radius) * 0.5 * tableSize,
          startAngle: (groupGap + groupAngle) * i - Math.PI * 0.5,
          endAngle: (groupGap + groupAngle) * i + groupAngle - Math.PI * 0.5
        }, bgPillarAttr));
        groupData.push(gpData);
      }
    } else {
      // 堆叠柱状图
      for (var _i = 0, _len = GROUP_NUM; _i < _len; _i++) {
        var heightSumUp = 0;
        var heightSumDown = 0;
        var _value = 0;
        var _gpData = {
          rects: []
        };

        var _groupAngle = (Math.PI * 2 - GROUP_NUM * groupGap) / GROUP_NUM; // 计算单根柱子


        for (var _j = 0, _lenj = data.length; _j < _lenj; _j++) {
          if (data[_j][_i].disabled !== true) {
            data[_j][_i].disabled = false;
          }

          var _startAngle = (_groupAngle + groupGap) * _i - Math.PI * 0.5;

          _value = data[_j][_i].__valueGetter__();

          var _barHeight = BAR_HEIGHT_FACTOR * _value;

          var _innerRadius = _value < 0 ? BAR_MAX_HEIGHT * (1 - POSITIVE_RATIO) - heightSumDown : BAR_MAX_HEIGHT * (1 - POSITIVE_RATIO) + heightSumUp;

          _innerRadius = _innerRadius + barInnerRadius * tableSize * 0.5;

          var _rect = _objectSpread({
            innerRadius: _innerRadius,
            outerRadius: _innerRadius + _barHeight - stackGap,
            startAngle: _startAngle,
            endAngle: _startAngle + _groupAngle
          }, data[_j][_i]);

          if (_rect.disabled) {
            _rect.opacity = 0;
          } else {
            _rect.opacity = 1;
            _value < 0 ? heightSumDown = heightSumDown - _barHeight : heightSumUp = heightSumUp + _barHeight;

            _gpData.rects.push(_rect);
          }

          barData.push(_rect);
        } // 柱子整体属性


        _gpData = Object.assign(_gpData, _objectSpread({
          innerRadius: barInnerRadius * 0.5 * tableSize,
          outerRadius: (barInnerRadius + radius) * 0.5 * tableSize,
          startAngle: (groupGap + _groupAngle) * _i - Math.PI * 0.5,
          endAngle: (groupGap + _groupAngle) * _i + _groupAngle - Math.PI * 0.5
        }, bgPillarAttr));
        groupData.push(_gpData);
      }
    }

    attachPadAngleOfArr(barData, padAngle);
    return {
      barData,
      groupData
    };
  }

  function computerLegend(data) {
    var flag = 0;

    for (var i = 0, len = data.length; i < len; i++) {
      if (data[i][0].disabled !== true) {
        flag++;
      }
    }

    if (flag === 0) {// console.warn('data invalid!')
    }

    return flag || 1;
  }

  return bar;
}