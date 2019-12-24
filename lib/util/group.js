var {
  isArray,
  isFunction
} = require('./is');

export var groupBy = function groupBy(data, condition) {
  if (!condition || !Array.isArray(data)) {
    return data;
  }

  var result = Object.create(null);
  var key = null;
  data.forEach((item, i, arr) => {
    key = condition(item, i, arr);

    if (key == null) {
      return;
    }

    if (result[key]) {
      result[key].push(item);
    } else {
      result[key] = [item];
    }
  });
  return result;
};
export var groupToMap = (data, condition) => {
  if (!condition) {
    return {
      0: data
    };
  }

  if (!isFunction(condition)) {
    var params = isArray(condition) ? condition : condition.replace(/\s+/g, '').split('*');

    condition = function condition(row) {
      return params.reduce((a, c) => a += row[c] && row[c].toString() + '_', '_');
    };
  }

  return groupBy(data, condition);
};