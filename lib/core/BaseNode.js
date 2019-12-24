function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group } from 'spritejs';
import { convertPercent2Number, invariant, isArray, isString, isEqual, formatAnimationAttr, clone } from '../util';
import Dataset from './dataset';
import { Global } from './Global';
import { render, patch, diff } from './vnode';
import { initAttr, attrMixin } from './mixins/attr';
import { initEvents, eventsMixin } from './mixins/event';
import { initLifecycle } from './mixins/lifecycle';
var timer = null;
var commonAttrs = {
  animation: true,
  // 默认开启，可加入配置
  size: ['80%', '80%'],
  pos: ['10%', '10%'],
  opacity: 1,
  layoutBy: 'row' // 配合 dataset 使用的数据模式，可选值：rows | cols

};

class BaseNode {
  constructor() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _defineProperty(this, "resolveRef", ref => {
      return el => {
        this.$refs[ref] = el;
      };
    });

    initAttr(this);
    initEvents(this);
    initLifecycle(this);
    this.emit(this.lifecycle.beforeCreate, this);
    var defaultAttrs = this.getDefaultAttrs();
    this.attr(Object.assign({}, commonAttrs, defaultAttrs, attrs));
    this.data = null;
    this.state = Object.create(null);
    this.$group = null;
    this.__data__ = null;
    this.__vnode__ = null;
    this.__isRendered__ = false;
    this.emit(this.lifecycle.created, this);
    this._colors = [];
    this.$refs = Object.create(null);
  }

  /**
   * 动画处理
   * @param {*} animation
   */
  resolveAnimation(animation, subAnimation) {
    var _animation = formatAnimationAttr(this.attr('animation'));

    var res = Object.assign(animation, _animation, subAnimation);

    if (_animation.use === false && (typeof subAnimation === 'undefined' || JSON.stringify(subAnimation) === '{}' || subAnimation && subAnimation.use === false)) {
      res.duration = 0;
    }

    return res;
  }
  /**
   * 连接到图表（chart）主体
   *
   * @param {*} chart
   * @memberof BaseNode
   */


  connectedCallback(chart) {
    this.chart = chart;
  }
  /**
   * 组件配色方案
   * 1. 用户主动配色，如：legend.color(['red', 'blue', 'yellow'])
   * 3. 使用当前 Theme 为当前组件设置的配色方案
   * 4. 使用当前 Theme 配置的 chart 的配色方案
   * @param {*} i
   */


  color(i) {
    if (i != null && (isArray(i) || isString(i))) {
      // 用户主动配色
      if (isString(i)) {
        i = [i];
      }

      this._colors = i;
      return this;
    } else {
      // 当前组件需要取配色
      if (this._colors && !this._colors.length) {
        var name = this.name;
        var currentTheme = Global.CURRENT_THEME;
        var {
          colors
        } = currentTheme && currentTheme[name] || {};

        if (!colors) {
          colors = currentTheme.colors;
        }

        this._colors = colors || [];
      }
      /* eslint-disable eqeqeq */


      return i == undefined ? this._colors : this._colors[i] || this._colors[0] || '#ccc';
    }
  }
  /**
   * 设置数据源
   *
   * @param {*} data Array | Dataset
   * @returns
   * @memberof BaseNode
   */


  source(data) {
    var needUpdate = this.__isRendered__;

    if (data instanceof Dataset) {
      this.dataset = data;
    } else {
      this.data = data;
    }

    needUpdate && this.update();
    return this;
  }
  /**
   * 获取自身渲染所需数据
   *
   * @returns [data]
   * @memberof BaseNode
   */


  getData() {
    var data = null;

    if (!this.data) {
      var layoutBy = this.attr('layoutBy');
      var names = Object.keys(this.dataset[layoutBy]);
      data = this.dataset._selectDataByNames(names, layoutBy);
    } else {
      data = this.data;
    }

    this.__data__ = clone(data);
    return data;
  }

  shouldUpdate() {
    var prevData = this.__data__;
    var nextData = this.getData();
    return !isEqual(prevData, nextData);
  }
  /**
   * 更新 $group pos、size 属性并保存到 this.attr
   *
   * @memberof BaseNode
   */


  _recalculateLayout() {
    var chartSize = this.chart.getSize();

    var calc = prop => {
      var oldVal = this.attr("__".concat(prop, "__"));
      var newVal = this.attr(prop);

      if (!oldVal) {
        oldVal = newVal;
      }

      if (newVal.some((v, i) => typeof v === typeof oldVal[i] && typeof v !== 'number')) {
        oldVal = newVal;
      }

      var ret = null;

      if (oldVal) {
        this.attr("__".concat(prop, "__"), oldVal);
        ret = chartSize.map((v, i) => convertPercent2Number(oldVal[i], v));
      }

      if (ret) {
        this.attr(prop, ret);
        this.$group.attr(prop, ret);
      }
    };

    calc('pos');
    calc('size');
    this.$group.attr({
      boxSizing: 'border-box',
      padding: 0,
      zIndex: 2,
      clipOverflow: false,
      opacity: this.attr('opacity')
    });
  }
  /**
   * 组件状态更新，默认定时 16.7ms 更新
   *
   * @param {*} patch
   * @param {boolean} [immediate=false] 为 true 则立即更新
   * @memberof BaseNode
   */


  setState(patch) {
    var immediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    clearTimeout(timer);
    this.state = Object.assign({}, this.state, patch);

    if (immediate) {
      this.update();
    } else {
      timer = setTimeout(() => this.update(), 16.7);
    }
  }

  beforeRender() {
    this._recalculateLayout();
  }

  rendered() {}

  beforeUpdate() {
    this._recalculateLayout();
  }

  update() {
    invariant(this.__vnode__, ["This componnet doesn't use jsx to render", 'You should override the update method!'].join());
    var data = this.beforeUpdate();
    this.__willUpdate__ = true;
    var vnode = this.render(data);
    var patches = diff(this.__vnode__, vnode);
    patch(this.$group, patches, 0, true);
    this.$group.attr({
      opacity: this.attr('opacity')
    });
    this.__vnode__ = vnode;
    this.__willUpdate__ = false;
    this.updated();
  }

  updated() {}
  /**
   * 强制替换 $group 重新渲染
   *
   * @memberof BaseNode
   */


  forceUpdate() {
    invariant(this.chart && this.chart.$group, "This component hasn't connect to chart now!");
    var attr = JSON.parse(JSON.stringify(this.$group.attr()));
    var $group = new Group(attr);
    this.chart.$group.replaceChild($group, this.$group);
    this.$group = $group;
    var data = this.beforeUpdate && this.beforeUpdate();
    var vnode = this.render && this.render(data);
    $group.attr(_objectSpread({}, vnode.attrs));
    this.__vnode__ = vnode;
    render(vnode.children, $group);
    this.updated();
  }

}

attrMixin(BaseNode);
eventsMixin(BaseNode);
export default BaseNode;