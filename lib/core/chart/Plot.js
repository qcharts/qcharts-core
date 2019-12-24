function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Scene } from 'spritejs';
import { isObject, debounce, convertPercent2Number, isWeixinApp } from '../../util';
import ResizeObserver from './ResizeObserver';
var isDev = process.env.NODE_ENV !== 'production';
export class Plot {
  constructor(container, opts) {
    if (isObject(container)) {
      opts = container;
      container = opts.container;
    }

    this.domElement = container;
    this.initScene(this.domElement, opts);
    this.plots = [];
    this.charts = [];
  }

  initScene(container, opts) {
    if (!isWeixinApp() && opts.forceFit) {
      opts.viewport = 'auto';
    } else {
      opts.viewport = opts.size ? opts.size : [opts.width, opts.height];
    }
    /**
      {
        vwr: 1,
        layer: 'fglayer',
      }
     */


    if (isWeixinApp()) {
      var [width, height] = opts.viewport;
      var pixelRatio = opts.pixelRatio || 'px';
      this.scene = new Scene(Number(width) || null, Number(height) || null, pixelRatio);
    } else {
      this.scene = new Scene(container, _objectSpread({
        displayRatio: 'auto'
      }, opts));
    }

    var layerID = opts.layer || 'default';

    if (isWeixinApp()) {
      this.layer = this.scene.layer(layerID, opts.component);
    } else {
      this.layer = this.scene.layer(layerID);
    }

    if (isDev) {
      this.layer.on('update', debounce(() => {
        console.info("%c\u5982\u679C\u6301\u7EED\u6253\u5370\u8BE5\u4FE1\u606F\uFF0C\u8BF4\u660E layer \u5728\u4E0D\u65AD\u91CD\u7ED8\uFF0C\u9700\u8981\u627E\u51FA\u95EE\u9898\uFF01", 'color: red');
      }, 1000));
    }

    this.canvas = this.layer.canvas;

    if (opts.forceFit) {
      this.forceFit();
    }
  }

  forceFit() {
    if (isWeixinApp()) return; // ignored

    var onResize = (w, h) => {
      this.scene.setViewport(w, h);
      this.scene.setResolution(w, h);
      this.plots.forEach((_ref) => {
        var {
          $group,
          pos,
          size
        } = _ref;
        $group.attr(this.recalculateLayout(pos, size));
      });
      this.charts.forEach(chart => {
        chart.emit('resize');
        chart.update && chart.update();
      });
    };

    var dom = this.domElement;
    var observer = ResizeObserver(debounce(element => {
      var {
        width,
        height
      } = getComputedStyle(element);
      onResize(parseInt(width), parseInt(height));
    }, 300));
    observer.observe(dom);
  }

  recalculateLayout(_ref2, _ref3) {
    var [x, y] = _ref2;
    var [width, height] = _ref3;
    var viewport = this.scene.resolution;
    var pos = [x, y].map((n, i) => convertPercent2Number(n, viewport[i]));
    var size = [width, height].map((n, i) => convertPercent2Number(n, viewport[i]));
    return {
      pos,
      size
    };
  }

  subPlot(pos, size) {
    var $group = new Group(_objectSpread({
      boxSizing: 'border-box'
    }, this.recalculateLayout(pos, size)));
    this.layer.appendChild($group);
    this.plots.push({
      $group,
      pos,
      size
    });
    return $group;
  }

  addChart(chart) {
    chart.id = this.plots.length + 1; // 设置 chart 的 ID

    Object.defineProperty(chart, 'id', {
      writable: false,
      configurable: true
    });
    chart.layer = this.layer;
    this.charts.push(chart);
  }

}