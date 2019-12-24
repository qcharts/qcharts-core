/**
 * 读取数组索引
 * @param {*} arr
 * @param {*} keyGetter
 * @returns
 */
function getIndexMap(arr, keyGetter) {
  var map = {};
  var keys = [];

  for (var i in arr) {
    var key = '_diff_' + keyGetter(i);
    keys.push(key);
    map[key] = i;
  }

  return {
    map,
    keys
  };
}

var noop = () => {};
/**
 * DataDiffer
 * 比对新旧数组数据做：add、update、remove 操作
 * 首先分别读取新旧数组索引存入map
 * 然后循环旧数组索引，如果新数组索引中无旧数组中的索引，就做 remove 操作，其他都做 update 操作，再把新数组中该索引置为 null
 * 最后循环新数组索引，索引存在则对该项做 add 操作
 */


export function diff(oldData, newData) {
  var oldArr = oldData;
  var newArr = newData;
  var add = noop;
  var update = noop;
  var remove = noop;

  var keyGetter = k => k;

  function diff() {}

  diff.add = fn => {
    add = fn;
    return diff;
  };

  diff.update = fn => {
    update = fn;
    return diff;
  };

  diff.remove = fn => {
    remove = fn;
    return diff;
  };

  diff.keyGetter = fn => {
    keyGetter = fn;
    return diff;
  };

  diff.execute = () => {
    /* eslint-disable no-unused-vars */
    var {
      map: olaDataIndexMap,
      keys: oldDataKeys
    } = getIndexMap(oldArr, keyGetter);
    var {
      map: newDataIndexMap,
      keys: newDataKeys
    } = getIndexMap(newArr, keyGetter); // 循环旧数据判断是否有数据更新、移除

    for (var i = 0, len = oldArr.length; i < len; i++) {
      var key = oldDataKeys[i];
      var idx = newDataIndexMap[key];

      if (!idx) {
        remove(i);
      } else {
        // 更新数据
        newDataIndexMap[key] = null;
        update(i);
      }
    } // 循环新数据判断是否有新增数据


    for (var _i = 0, _len = newArr.length; _i < _len; _i++) {
      var _key = newDataKeys[_i];
      var _idx = newDataIndexMap[_key];

      if (!_idx) {
        continue; // 已经更新或者删除
      } else {
        add(_i);
      }
    }
  };

  return diff;
}