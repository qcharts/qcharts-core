function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group } from 'spritejs';
import { isArray, getGlobal, invariant } from '../../util';
import BaseNode from '../BaseNode';
import { BaseVisual } from '../BaseVisual';
import { render } from '../vnode';
import Dataset from '../dataset';
import { Plot } from './Plot';
import { Global } from '../Global';
var global = getGlobal();
var defaultTheme = 'default';

var _plot = Symbol('plot');

var _initPlot = Symbol('initPlot');

var _mountToPlot = Symbol('mountToPlot');

var _addChild = Symbol('addChild');

var _renderChild = Symbol('renderChild');

export class Chart extends BaseNode {
  constructor() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(attrs);
    this.emit(this.lifecycle.beforeCreate);
    this[_plot] = null;

    this[_initPlot](this.attr());

    this[_mountToPlot]();

    this.setTheme(defaultTheme); // defaultTheme

    this.dataset = null;
    this.visuals = [];
    this.plugins = [];
    this.children = [];
    this.Global = Global;
    delete this.state;
    delete this.__vnode__;
    this.emit(this.lifecycle.created);
  }

  getDefaultAttrs() {
    return {
      pos: [0, 0],
      size: ['100%', '100%'],
      forceFit: true,
      zoomable: false
    };
  }

  [_initPlot](attrs) {
    var $ = node => typeof node === 'string' ? global.document && global.document.querySelector ? global.document.querySelector(node) : {
      id: node
    } // use reference for WeakMap
    : node;

    this.domElement = $(attrs.container);
    invariant(this.domElement, "Need a domNode to render chart!");
    var plot = Global.PLOT_INSTANCES.get(this.domElement);

    if (!plot) {
      plot = new Plot(_objectSpread({}, attrs, {
        container: this.domElement
      }));
      Global.PLOT_INSTANCES.set(this.domElement, plot);
    }

    this[_plot] = plot;

    this[_plot].addChart(this);

    this.scene = plot.scene;
    this.canvas = plot.canvas;
  }

  [_mountToPlot]() {
    var pos = this.attr('pos');
    var size = this.attr('size');

    var group = this[_plot].subPlot(pos, size);

    this.$group = group;
    this.attr('size', this.$group.attr('size'));
    this.attr('pos', this.$group.attr('pos'));
  }

  setTheme(name) {
    var target = Global.THEMES.get(name);
    invariant(target, "Unknown theme type! Register it first!"); // Object.keys(target).forEach(key => this.style(key, target[key]))

    Global.useTheme(name);
    this.__isRendered__ && this.emit('theme:change', target);

    if (this.$group) {
      this.$group.attr(this.style('Chart')() || {});
    }
  }

  resolveTheme(name) {
    return Global.CURRENT_THEME[name] || this.style(name)();
  }

  setCanvasCursor() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
    if (this.canvas) this.canvas.style.cursor = type;
  }

  getSize() {
    return this.$group.attr('size');
  }

  getPos() {
    return this.$group.attr('pos');
  }

  source(data) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (this.dataset) {
      this.dataset.source(data, options);
      this.update();
    } else {
      var dataset = null;

      if (!(data instanceof Dataset)) {
        dataset = new Dataset();
        dataset.source(data, options);
      } else {
        dataset = data;
      }

      this.dataset = dataset;
    }

    return this;
  }

  [_addChild](instance) {
    if (!instance) {
      return;
    }

    instance.connectedCallback && instance.connectedCallback(this);

    if (instance instanceof BaseVisual) {
      this.visuals.push(instance);
    } else {
      this.plugins.push(instance);
    }

    this.children.push(instance);
    return this;
  }

  add(instance) {
    if (isArray(instance)) {
      instance.map(this[_addChild].bind(this));
    } else {
      this[_addChild](instance);
    }

    return this;
  }

  getChildren() {
    return [].concat(this.plugins, this.visuals);
  }

  [_renderChild](child) {
    invariant(child.render, "Chart need a instance which has render method!");
    invariant(this.dataset, "The chart can't render because havn't source data!");

    if (!child.dataset) {
      child.dataset = this.dataset;
    }

    this.dataset.addDep(child);
    var $group = new Group();
    this.$group.appendChild($group);
    child.$group = $group;
    var data = child.beforeRender && child.beforeRender();
    var vnode = child.render && child.render(data);
    $group.attr(_objectSpread({}, vnode.attrs));
    child.__vnode__ = vnode;
    render(vnode.children, $group);
    child.__isRendered__ = true;
    child.rendered();
  }

  render() {
    invariant(!this.__isRendered__, "The chart is rendered! Do not invoke chart.render many a time!");
    this.emit(this.lifecycle.beforeRender, this);
    this.children.map(this[_renderChild].bind(this));
    this.emit(this.lifecycle.rendered, this);
    this.__isRendered__ = true;
  }

  update() {
    this.attr('size', this.$group.attr('size'));
    this.attr('pos', this.$group.attr('pos'));
    this.emit(this.lifecycle.beforeUpdate, this);
    this.children.map(child => child.update());
    this.emit(this.lifecycle.updated, this);
  }

  destroy() {
    this.emit(this.lifecycle.beforeDestroy, this);

    this[_plot].plots.pop();

    this.$group.parentNode.removeChild(this.$group);
    this.emit(this.lifecycle.destroyed, this);
  }

  save() {
    var fileName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'qcharts';
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'image/png';
    invariant(!!global.document, "In current platform, the chart can't save to a image!");
    var dataURL = this.canvas.toDataURL(type).replace(type, 'image/octet-stream');
    var aLink = document.createElement('a');
    aLink.style.position = 'fixed';
    aLink.style.zIndex = -9999;
    document.body.appendChild(aLink);
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('click', false, false);
    aLink.download = /\.\w+/.test(fileName) ? fileName : fileName + '.' + type.split('/')[1];
    aLink.href = dataURL;
    aLink.dispatchEvent(evt);
    aLink.click();
    document.body.removeChild(aLink);
  }

}