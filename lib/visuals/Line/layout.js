/**
 * 折线图的布局算法
 */
import { scaleLinear } from '../../util/q-scale';
import { axis } from '../../util/axis';
var layoutKeys = ['_x', '_y']; // 表示x,y轴数据

export function layout(obj) {
  var {
    size,
    stack,
    data,
    axisGap,
    fields,
    splitNumber
  } = obj;
  data.forEach(lines => {
    lines.forEach(point => {
      point._x = point.__textGetter__();
      point._y = point.__valueGetter__();
    });
  });
  var arrObject = [];
  data.forEach(line => {
    var lineDisabled = true;
    line.forEach(point => {
      if (!point.disabled) {
        lineDisabled = false;
      }
    });

    if (lineDisabled === true) {
      line.disabled = true;
    }

    arrObject.push(line);
  });
  var resArr = [];
  var baseValues = {}; // 如果stack为true

  arrObject.forEach(line => {
    var currentLine = layoutLine(line, arrObject, stack, splitNumber);
    currentLine.data = line;

    if (line.disabled === true) {
      currentLine.disabled = line.disabled;
      delete line.disabled;
    }

    resArr.push(currentLine);
  });
  return resArr;

  function layoutLine(oData, arrObject, stack, splitNumber) {
    var res = Object.create(null);
    var data = oData.filter(item => item.disabled !== true); // 过滤disabled的数据

    layoutKeys.forEach(key => {
      var scales = data.map(item => {
        return item[key];
      });
      baseValues[key] = baseValues[key] || [];
      var baseArr = baseValues[key];
      var type = 'category'; // 默认按照category分类进行

      var lengthPx = key === '_x' ? size[0] : size[1];
      var scaleF = scaleLinear().domain([0, data.length - 1]).range([0, lengthPx]);

      if (axisGap !== false) {
        scaleF = scaleLinear().domain([0, data.length]).range([0, lengthPx]);
      }

      if (key === '_y') {
        type = 'value';
      }

      if (type === 'value') {
        arrObject = arrObject.map(item => item.filter(item => item[fields[type]] !== undefined));
        scales = axis({
          dataSet: arrObject,
          stack,
          splitNumber
        });

        if (stack === true) {
          // 如果为堆叠，处理对应key叠加
          data.forEach((item, ind) => {
            item[key] = item[key] + (baseArr[ind] || 0);
            baseArr[ind] = item[key];
          });
        }

        var maxValue = Math.max.apply(this, scales);
        var minValue = Math.min.apply(this, scales);
        scaleF = scaleLinear().domain([minValue, maxValue]).range([0, lengthPx]);
      }

      var resData = data.map((item, index) => {
        var targetPx = scaleF(type === 'value' ? item[key] : index);

        if (axisGap !== false) {
          if (type === 'category') {
            var pDx;

            if (key === '_x') {
              pDx = size[0] / data.length;
            } else if (key === '_y') {
              pDx = size[1] / data.length;
            }

            targetPx = targetPx + pDx / 2;
          }
        }

        if (key === '_x') {} else if (key === '_y') {
          targetPx = size[1] - targetPx;
        }

        return {
          item: item,
          text: String(item[key]),
          offset: targetPx
        };
      });
      res[key] = {
        data: resData,
        scales,
        scaleF,
        type
      };
    });
    var {
      _x: objX,
      _y: ObjY
    } = res;
    res.points = [];
    objX.data.forEach((item, index) => {
      var tarY = ObjY.data[index].offset;

      if (!isNaN(tarY) && item.item._y !== undefined) {
        res.points.push({
          point: [objX.data[index].offset, tarY]
        });
      }
    });
    delete res['_x'];
    delete res['_y'];
    return res;
  }
}