import { Global } from '../core/Global';
export function axis(attr) {
  // 计算坐标轴刻度
  if (!Array.isArray(attr.dataSet) && !attr.hasOwnProperty('section')) {
    return [];
  }

  if (attr.section !== undefined) {
    return sectionAxis(attr.section);
  }

  var data = dataHandle(attr);
  var upZero = []; // 大于零的数

  var downZero = []; // 小于零的数

  for (var element of data) {
    if (element < 0) {
      downZero.push(Math.abs(element));
    } else {
      upZero.push(element);
    }
  }

  var length = 5; // 刻度数量

  var sortUpZero = upZero.sort((a, b) => {
    return a - b;
  });
  var sortDownZero = downZero.sort((a, b) => {
    return a - b;
  });
  var maxUpZero = sortUpZero.length && Math.ceil(sortUpZero.pop() / 0.95);
  var maxDownZero = sortDownZero.length && Math.ceil(sortDownZero.pop() / 0.95);
  var maxValue = maxUpZero - maxDownZero >= 0 ? maxUpZero : maxDownZero;
  var mixNum = 4;
  var maxNum = 7;

  if (maxDownZero && maxUpZero) {
    mixNum = 3;
    maxNum = 5;
  }

  if (attr.splitNumber) {
    mixNum = attr.splitNumber;
    maxNum = mixNum + 1;
  }

  var getMax = false;
  var len = maxValue.toString().length; // 最大值位数

  var max = len < 3 ? Math.ceil(maxValue / Math.pow(10, len - 1)) : Math.ceil(maxValue / Math.pow(10, len - 2));

  do {
    for (var i = mixNum; i < maxNum; i++) {
      if (max % i === 0) {
        length = i;
        maxValue = len < 3 ? max * Math.pow(10, len - 1) : max * Math.pow(10, len - 2);
        getMax = true;
        break;
      }
    }

    max++;
  } while (!getMax);

  var axisArray = new Array(length + 1);
  axisArray[0] = 0;

  for (var _i = 1; _i < length + 1; _i++) {
    axisArray[_i] = maxUpZero >= maxDownZero ? Math.round(maxValue / length * _i) : -1 * Math.round(maxValue / length * _i);
  } // 处理0-1之间的数据


  if (maxDownZero <= 1 && maxDownZero > 0 || maxUpZero <= 1 && maxUpZero > 0 || maxUpZero === 0 && maxDownZero === 0) {
    axisArray = new Array(6);
    axisArray[0] = 0;
    maxValue = 1;

    for (var _i2 = 1; _i2 < 6; _i2++) {
      axisArray[_i2] = maxUpZero >= maxDownZero ? 2 * maxValue * _i2 / 10 : -2 * maxValue * _i2 / 10;
    }
  }

  if (maxUpZero < maxDownZero) {
    axisArray.reverse();
  }

  if (maxDownZero.length === 0 || maxUpZero.length === 0) {
    return axisArray;
  }

  if (maxUpZero >= maxDownZero) {
    var unit = axisArray[1] * 10;

    for (var _i3 = 1, _len = Math.ceil((axisArray.length - 1) * maxDownZero / maxUpZero); _i3 < _len + 1; _i3++) {
      axisArray.unshift(-1 * unit * _i3 / 10);
    }
  } else {
    var _unit = axisArray[axisArray.length - 2] * 10;

    for (var _i4 = 1, _len2 = Math.ceil((axisArray.length - 1) * maxUpZero / maxDownZero); _i4 < _len2 + 1; _i4++) {
      axisArray.push(-1 * _unit * _i4 / 10);
    }
  }

  if (attr.needReverse) {
    axisArray = axisArray.map(value => {
      return Global.datasetReverse ? Math.round(Global.datasetReverse(value)) : value;
    });
  }

  return axisArray;
}

function dataHandle(attr) {
  var stack = attr.stack || false;
  var data = attr.dataSet || []; // const field = attr.field || '__valueGetter__'

  var field = '__valueGetter__';
  var arr = [];

  if (stack && data.length !== 0 && data[0].length) {
    for (var i = 0, len = data[0].length; i < len; i++) {
      var sum = 0;
      var sumDown = 0;

      for (var j = 0, leng = data.length; j < leng; j++) {
        if (data[j][i].disabled === true) {
          continue;
        } // const value =
        // attr && attr.field ? data[j][i][field] : data[j][i][field]()


        var value = data[j][i][field]();

        if (value < 0) {
          sumDown = sumDown + value;
        } else {
          sum = sum + value;
        }
      }

      sum && arr.push(sum);
      sumDown && arr.push(sumDown);
    }
  } else {
    for (var _i5 = 0, _len3 = data.length; _i5 < _len3; _i5++) {
      for (var _j = 0, lenj = data[_i5].length; _j < lenj; _j++) {
        if (data[_i5][_j].disabled === true) {
          continue;
        } // arr.push(attr && attr.field ? data[i][j][field] : data[i][j][field]())


        arr.push(data[_i5][_j][field]());
      }
    }
  }

  return arr;
}

function sectionAxis(section) {
  if (section && Array.isArray(section)) {
    var gap = section[1] - section[0];
    var arr = [];
    var divide = 4;
    arr.push(section[0]);

    for (var i = 4; i < 8; i++) {
      if (gap % i === 0) {
        divide = i;
        break;
      }
    }

    for (var j = 1; j <= divide; j++) {
      arr.push((section[0] + gap * j / divide).toFixed(2));
    }

    return arr;
  }

  return [];
}