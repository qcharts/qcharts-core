import { clone, groupToMap, isObject, isArray, invariant } from '../../util';
import { initAttr, attrMixin } from '../mixins/attr';
import { Global } from '../Global';

class Dataset {
  constructor() {
    initAttr(this);
    this.data = null;
    this.dataOrigin = null;
    this._deps = [];
    this._events = {};
  }
  /**
   * 添加依赖
   * @param {*} dep
   */


  addDep(dep) {
    var len = this._deps.length;
    this._deps[len] = dep;
  }
  /**
   * 通知更新
   */


  notify() {
    this._deps.forEach(dep => {
      if (!dep.update) {
        return;
      }

      if (dep.shouldUpdate) {
        if (dep.shouldUpdate()) {
          dep.update();
        }
      } else {
        // 未实现 dep.shouldUpdate 接口，默认更新，可能会导致抖动问题
        dep.update();
      }
    });
  }

  _prepareSource(data, options) {
    // dataset 内部使用克隆数据
    if (data instanceof Dataset) {
      // 从另一个 dataset 读取数据
      this.dataOrigin = data.dataOrigin;
      this.data = clone(data.dataOrigin);
    } else if (isArray(data)) {
      var {
        value
      } = this.attr();

      for (var i = 0, len = data.length; i < len; i++) {
        if (typeof data[i][value || 'value'] !== 'undefined' && isNaN(data[i][value || 'value'])) {
          invariant(false, "Invalid source data, value must be a number!");
        }
      }

      this.dataOrigin = data;
      this.data = clone(data);
    } else {
      invariant(false, "Invalid source data, must be an array or a instance of Dataset!");
    }
  }
  /**
   * 设置源数据
   * @param {*} data
   * @param {*} options
   */


  source(data, options) {
    this.attr(options);

    this._prepareSource(data);

    this._executeTransform();
  }
  /**
   * 设置响应式数据
   * @param {*} obj
   */


  _defineReactive(obj) {
    var self = this;

    var defineReactive = (obj, key) => {
      var val = obj[key];
      Object.defineProperty(obj, key, {
        get: function reactiveGetter() {
          return val;
        },
        set: function reactiveSetter(newVal) {
          val = newVal;
          var {
            row,
            col,
            value
          } = self.attr();

          if (obj.dataOrigin) {
            if (isObject(obj.dataOrigin)) {
              obj.dataOrigin[key] = newVal;
            } else {
              obj.dataOrigin = newVal;
            }
          }

          if ([row, col, value].indexOf(key) > -1) {
            self.notify();
          }
        }
      });
    };

    var {
      row,
      col,
      text,
      value
    } = this.attr();
    var keys = [row, col, text, value, 'dataOrigin'].filter(Boolean);

    for (var key of keys) {
      defineReactive(obj, key);
    } // Object.keys(obj).forEach(key => defineReactive(obj, key))

  }

  _executeTransform() {
    var {
      row,
      col,
      value,
      text,
      sort,
      filter,
      layoutScale
    } = this.attr();

    var layoutScaleRes = this._handleLayoutScale(layoutScale);

    var data = this.data;

    if (row === '*') {
      row = '__dataset_row__';
      data.forEach(d => d.__dataset_row__ = 1);
    }

    if (col === '*') {
      col = '__dataset_col__';
      data.forEach(d => d.__dataset_col__ = 1);
    }

    invariant(data, "There are no data to transform for now!"); // step 0: 过滤、排序

    filter && (data = data.filter(filter));
    sort && data.sort(sort); // step 1: 二维数组扁平化，拦截属性

    var handleData = (d, i) => {
      var dataOrigin = isObject(d) ? clone(d) : {
        value: d
      }; // 保存原始数据

      if (!isObject(d)) {
        value = 'value';
        text = 'value';
        row = null;
        col = null;
        d = {
          value: d,
          __index__: d
        };
      } else {
        d.__index__ = i;
      } // this._defineReactive(d)


      d.dataOrigin = dataOrigin; // 保持原始数据

      d.__textGetter__ = () => d[text] || d[col] || d[row]; // 获取数据文字标记


      d.__valueGetter__ = () => typeof layoutScaleRes === 'function' ? layoutScaleRes(d[value]) : d[value]; // 获取数据数值


      d.__valueSetter__ = v => v && (d[value] = v); // 修改数据数值


      d.__originValueGetter__ = () => d[value];

      return d;
    };

    for (var i = 0, len = data.length; i < len; i++) {
      var d = data[i];

      if (isArray(d)) {
        var isUsed = false;

        for (var j = 0, len2 = d.length; j < len2; j++) {
          var t = d[j];
          var ret = handleData(t, i);

          if (isUsed) {
            data.push(ret);
          } else {
            data[i] = ret;
            isUsed = true;
          }
        }
      } else {
        data[i] = handleData(d, i);
      }
    }

    this.attr({
      row,
      col,
      value
    }); // 更新关键属性
    // step 2: 分别从行、列角度聚合数据（分组）

    var rowGroupCondition = row ? d => d[row] : d => d.__index__;
    var colGroupCondition = col ? d => d[col] : d => d.__index__;

    var generateIndex = condition => {
      return data.map(condition).reduce((a, c, i) => {
        a[c] = i;
        return a;
      }, Object.create(null));
    }; // 行列索引


    var rowData = data;
    var colData = clone(data);

    var defineReactive = data => {
      for (var _d of data) {
        this._defineReactive(_d);
      }
    };

    defineReactive(rowData);
    defineReactive(colData);
    this.rowIndexes = generateIndex(rowGroupCondition);
    this.colIndexes = generateIndex(colGroupCondition);
    this.row = groupToMap(rowData, rowGroupCondition);
    this.col = groupToMap(colData, colGroupCondition);
  }

  _handleLayoutScale(layoutScale) {
    if (typeof layoutScale === 'string') {
      var method = layoutScale.replace(/\d+$/, '');
      var NUM = 2;

      if (method !== 'sqrt' && method !== 'pow' && method !== 'log') {
        console.warn('layoutScale type error');
        return function (value) {
          return value;
        };
      }

      var number = layoutScale.replace(/^[a-z]+/, '');

      if (number) {
        var isNumber = /^[-+]?\d*$/.test(number);

        if (!isNumber) {
          console.warn('layoutScale type error');
          return function (value) {
            return value;
          };
        } else {
          NUM = Number(number);
        }
      }

      switch (method) {
        case 'sqrt':
          Global.datasetReverse = function (value) {
            return Math.pow(value, NUM);
          };

          return function (value) {
            return Math.pow(value, 1 / NUM);
          };

        case 'pow':
          Global.datasetReverse = function (value) {
            return Math.pow(value, 1 / NUM);
          };

          return function (value) {
            return Math.pow(value, NUM);
          };

        case 'log':
          if (NUM !== 2 && NUM !== 10) {
            console.warn('layoutScale type error');
            return function (value) {
              return value;
            };
          }

          Global.datasetReverse = function (value) {
            return Math.pow(NUM, value);
          };

          return function (value) {
            return Math['log' + NUM](value);
          };

        default:
          console.warn('layoutScale type error');
          return function (value) {
            return value;
          };
      }
    }

    return layoutScale;
  }

  _selectDataByName(name, type) {
    var data = this[type];
    invariant(data, 'No data now, check if you has source the data!');
    var ret = data[name];

    if (isArray(ret)) {
      ret.sort((a, b) => a.__index__ - b.__index__);
    }

    return ret;
  }

  _selectDataByNames(names, type) {
    var data = null;
    var indexMap = null;

    if (type === 'row') {
      data = this.row;
      indexMap = this.rowIndexes;
    } else {
      data = this.col;
      indexMap = this.colIndexes;
    }

    if (names === '*') {
      names = Object.keys(data);
    } else if (!isArray(names)) {
      names = [names];
    }

    return names.sort((a, b) => indexMap[a] - indexMap[b]).reduce((a, c) => {
      if (typeof this._selectDataByName(c, type) !== 'undefined') {
        a.push(this._selectDataByName(c, type));
      }

      return a;
    }, []);
  }

  getRowNames() {
    var data = this.row;
    var indexMap = this.rowIndexes;
    return Object.keys(data).sort((a, b) => indexMap[a] - indexMap[b]);
  }

  getColNames() {
    var data = this.col;
    var indexMap = this.colIndexes;
    return Object.keys(data).sort((a, b) => indexMap[a] - indexMap[b]);
  }

  selectRow(rowName) {
    if (!rowName) {
      return null;
    }

    var ret = this._selectDataByName(rowName, 'row');

    return ret;
  }

  selectRows(rowNames) {
    var ret = this._selectDataByNames(rowNames, 'row');

    return ret;
  }

  selectCol(colName) {
    if (!colName) {
      return null;
    }

    var ret = this._selectDataByName(colName, 'col');

    return ret;
  }

  selectCols(colNames) {
    var ret = this._selectDataByNames(colNames, 'col');

    return ret;
  }

  hoverData(data) {
    this._hoverData = data;
    this.dispatch('hover:data', data);
  }

  on(type, handler) {
    this._events[type] = this._events[type] || [];

    this._events[type].push(handler);
  }

  dispatch(type, data) {
    var handlers = this._events[type] || [];
    handlers.forEach(handler => handler(data));
  }

}

attrMixin(Dataset);
export default Dataset;