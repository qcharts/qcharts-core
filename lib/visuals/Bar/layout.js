function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { axis } from '../../util';
export default function barLayout() {
  function bar(dataInfo) {
    // 输入
    var data = dataInfo.data;
    var barSize = dataInfo.barSize;
    var transpose = dataInfo.transpose;
    var stack = dataInfo.stack;
    var groupGap = dataInfo.groupGap;
    var stackGap = dataInfo.stackGap;
    var barWidth = dataInfo.barWidth;
    var splitNumber = dataInfo.splitNumber; // 输出

    var barData = [];
    var groupData = [];
    var bgPillarAttr = {
      opacity: 0.00001,
      bgcolor: '#000'
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

    var tableSize = transpose ? {
      label: barSize[1],
      value: barSize[0]
    } : {
      label: barSize[0],
      value: barSize[1]
    };
    var axisValueMax = Math.max.apply(this, valueAxis);
    var axisValueMin = Math.min.apply(this, valueAxis);
    var POSITIVE_RATIO = axisValueMax / (axisValueMax - axisValueMin); // 正负柱子高度比例

    var GROUP_BAR_NUM = computerLegend(data); // 图例显示个数

    var GROUP_NUM = data[0].length;
    var gap = 0; // 柱子宽度，根据数据绘制类型计算，是否分组，是否旋转

    if (barWidth === 0) {
      barWidth = stack ? tableSize.label * 0.5 / GROUP_NUM : tableSize.label * 0.5 / (GROUP_NUM * GROUP_BAR_NUM);
      gap = stack ? barWidth : barWidth * GROUP_BAR_NUM;
    } else {
      gap = stack ? (tableSize.label - barWidth * GROUP_NUM) / GROUP_NUM : (tableSize.label - barWidth * GROUP_BAR_NUM * GROUP_NUM - groupGap * (GROUP_BAR_NUM - 1) * GROUP_NUM) / GROUP_NUM;
    }

    var BAR_HEIGHT_FACTOR = tableSize.value / (axisValueMax - axisValueMin);

    if (!stack) {
      // 分组柱状图
      for (var i = 0, len = GROUP_NUM; i < len; i++) {
        var flag = 0; // 计算当前柱子前面有几根被隐藏

        var value = 0;
        var gpData = {
          rects: []
        }; // 计算单根柱子

        for (var j = 0, lenj = data.length; j < lenj; j++) {
          if (data[j][i].disabled !== true) {
            data[j][i].disabled = false;
          }

          value = data[j][i].__valueGetter__();
          var barHeight = BAR_HEIGHT_FACTOR * Math.abs(value);

          var rect = _objectSpread({
            anchor: [transpose && value < 0 ? 1 : 0, transpose || value < 0 ? 0 : 1],
            size: transpose ? [barHeight, barWidth - 1] : [barWidth - 1, barHeight],
            pos: transpose ? [tableSize.value * (1 - POSITIVE_RATIO), gap / 2 + (barWidth + groupGap) * (j - flag) + (barWidth * GROUP_BAR_NUM + groupGap * (GROUP_BAR_NUM - 1) + gap) * i] : [gap / 2 + (barWidth + groupGap) * (j - flag) + (barWidth * GROUP_BAR_NUM + groupGap * (GROUP_BAR_NUM - 1) + gap) * i, tableSize.value * POSITIVE_RATIO],
            labelAttrs: {
              opacity: !data[j][i].disabled ? 1 : 0,
              text: value,
              anchor: [transpose && value < 0 ? 1 : 0, 0.5],
              pos: transpose ? [tableSize.value * (1 - POSITIVE_RATIO), gap / 2 + (barWidth + groupGap) * (j - flag) + (barWidth * GROUP_BAR_NUM + groupGap * (GROUP_BAR_NUM - 1) + gap) * i + barWidth * 0.5] : [gap / 2 + (barWidth + groupGap) * (j - flag) + (barWidth * GROUP_BAR_NUM + groupGap * (GROUP_BAR_NUM - 1) + gap) * i + barWidth * 0.5, tableSize.value * POSITIVE_RATIO],
              rotate: transpose ? 0 : value < 0 ? 90 : 270
            }
          }, data[j][i]);

          if (rect.disabled) {
            rect.size = transpose ? [0, rect.size[1]] : [rect.size[0], 0];
            flag++;
          } else {
            gpData.rects.push(rect);
          }

          barData.push(rect);
        } // 柱子整体属性


        gpData = Object.assign(gpData, _objectSpread({
          // title: data[0][i]['_x'],
          pos: transpose ? [0, (gap + barWidth * GROUP_BAR_NUM + groupGap * (GROUP_BAR_NUM - 1)) * i] : [(gap + barWidth * GROUP_BAR_NUM + groupGap * (GROUP_BAR_NUM - 1)) * i, 0],
          size: transpose ? [tableSize.value, barWidth * GROUP_BAR_NUM + groupGap * (GROUP_BAR_NUM - 1) + gap] : [barWidth * GROUP_BAR_NUM + groupGap * (GROUP_BAR_NUM - 1) + gap, tableSize.value]
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
        }; // 计算单根柱子

        for (var _j = 0, _lenj = data.length; _j < _lenj; _j++) {
          var stackGapTemp = stackGap;

          if (data[_j][_i].disabled !== true) {
            data[_j][_i].disabled = false;
          }

          _value = data[_j][_i].__valueGetter__();

          var _barHeight = BAR_HEIGHT_FACTOR * Math.abs(_value);

          if (_barHeight === 0) {
            stackGapTemp = 0;
          }

          var posY = _value < 0 ? tableSize.value * POSITIVE_RATIO + heightSumDown : tableSize.value * POSITIVE_RATIO - heightSumUp;
          var posX = _value < 0 ? tableSize.value * (1 - POSITIVE_RATIO) - heightSumDown : tableSize.value * (1 - POSITIVE_RATIO) + heightSumUp;
          var posLabelY = _value < 0 ? tableSize.value * POSITIVE_RATIO + heightSumDown + _barHeight : tableSize.value * POSITIVE_RATIO - heightSumUp;

          var _rect = _objectSpread({
            anchor: [transpose && _value < 0 ? 1 : 0, transpose || _value < 0 ? 0 : 1],
            size: transpose ? [_barHeight - stackGapTemp, barWidth] : [barWidth, _barHeight - stackGapTemp],
            pos: transpose ? [posX, gap / 2 + (barWidth + gap) * _i] : [gap / 2 + (barWidth + gap) * _i, posY],
            index: _j,
            labelAttrs: {
              opacity: !data[_j][_i].disabled ? 1 : 0,
              text: _value,
              anchor: transpose ? _value < 0 ? [1, 0.5] : [0, 0.5] : [0.5, 1],
              pos: transpose ? [posX, +(gap + barWidth) / 2 + (barWidth + gap) * _i] : [(gap + barWidth) / 2 + (barWidth + gap) * _i, posLabelY]
            }
          }, data[_j][_i]);

          if (_rect.disabled) {
            _rect.size = transpose ? [0, _rect.size[1]] : [_rect.size[0], 0];
          } else {
            _value < 0 ? heightSumDown = heightSumDown + _barHeight : heightSumUp = heightSumUp + _barHeight;

            _gpData.rects.push(_rect);
          }

          barData.push(_rect);
        } // 柱子整体属性


        _gpData = Object.assign(_gpData, _objectSpread({
          pos: transpose ? [0, (gap + barWidth) * _i] : [(gap + barWidth) * _i, 0],
          size: transpose ? [tableSize.value, barWidth + gap] : [barWidth + gap, tableSize.value]
        }, bgPillarAttr));
        groupData.push(_gpData);
      }
    }

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