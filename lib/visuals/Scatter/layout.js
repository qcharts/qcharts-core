import { scaleLinear } from '../../util/q-scale';
import { isNumber, isString } from '../../util/is';

var getDataRange = data => {
  if (data.length === 0) {
    return [0, 1];
  }

  var min = Math.min(...data);
  var max = Math.max(...data);
  return [min, max];
};

var getBigRange = data => {
  if (data.length === 0) {
    return [0, 1];
  }

  var [min, max] = getDataRange(data);
  var n = Math.round(min / 10) - 1;
  var m = Math.round(max / 10) + 1;
  return [n * 10, m * 10];
};

var updateDomainVal = (section, newSection) => {
  var {
    min,
    max
  } = newSection;

  if (isNumber(min)) {
    section[0] = min;
  }

  if (isNumber(max)) {
    section[1] = max;
  }
};

export default function layout(data, dataAttr, size, layoutWay) {
  var [width, height] = size;
  var {
    text: textField,
    value: valueField
  } = dataAttr;
  var allData = data.reduce((pre, cur) => {
    return pre.concat(cur.filter(d => !d.disabled));
  }, []); // 如果X轴是文本框，则进行均分

  var maxLen = getDataRange(data.map(d => d.length))[1];
  var xDomain = [0, maxLen - 1];
  var xIsTextData = allData.some(d => isString(d.__textGetter__()));

  if (!xIsTextData) {
    xDomain = getBigRange(allData.map(d => d.__textGetter__()));
  }

  var yIsTextData = allData.some(d => isString(d.__valueGetter__()));

  if (yIsTextData) {
    throw new Error("Scatter's value category data type should be Number!");
  }

  var yDomain = getBigRange(allData.map(d => d.__valueGetter__()));

  if (layoutWay) {
    if (layoutWay[textField]) {
      updateDomainVal(xDomain, layoutWay[textField]);
    }

    if (layoutWay[valueField] && !yIsTextData) {
      updateDomainVal(yDomain, layoutWay[valueField]);
    }
  }

  var newLayoutWay = {};
  newLayoutWay[textField] = {
    min: xDomain[0],
    max: xDomain[1]
  };
  newLayoutWay[valueField] = {
    min: yDomain[0],
    max: yDomain[1]
  };
  var xLinear = scaleLinear().domain(xDomain).range([0, width]);
  var yLinear = scaleLinear().domain(yDomain).range([0, height]);
  var attrs = data.map(dArry => {
    return dArry.map((d, i) => {
      var x = xIsTextData ? i : d.__textGetter__();

      var y = d.__valueGetter__();

      var pos = [xLinear(x), height - yLinear(y)];
      return {
        pos,
        radius: 4,
        dataOrigin: d.dataOrigin,
        disabled: d.disabled
      };
    });
  });
  return {
    data: attrs,
    layoutWay: newLayoutWay
  };
}