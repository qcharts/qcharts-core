function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Label, Sprite, Path } from 'spritejs';
import { BasePlugin } from '../core/BasePlugin';
import { convertPercent2Number, isArray, isString, isNumber } from '../util';
export class Legend extends BasePlugin {
  constructor() {
    var _this;

    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(attrs);
    _this = this;

    _defineProperty(this, "changePage", type => {
      switch (type) {
        case 'prev':
          return () => {
            var page = this.state.page;
            if (page <= 1) return;
            page -= 1;
            this.setState({
              page
            });
          };

        default:
          return () => {
            var {
              page,
              totalPage
            } = this.state;
            if (page >= totalPage) return;
            page += 1;
            this.setState({
              page
            });
          };
      }
    });

    _defineProperty(this, "changeDataSetData", function (name) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'disabled';
      var value = arguments.length > 2 ? arguments[2] : undefined;

      var layoutBy = _this.attr('layoutBy');

      var enableClick = _this.attr('enableClick');

      if (!enableClick) return;

      var data = _this.dataset._selectDataByName(name, layoutBy);

      if (key === 'disabled') {
        _this.disableds[name] = !_this.disableds[name];
        data && data.forEach(node => node.disabled = !node.disabled);
      } else {
        data[key] = value;
        data && data.forEach(node => node[key] = value);
      }

      _this.dataset.notify();
    });

    this.state = {
      page: 1,
      totalPage: 1,
      perPageWidthOrHeight: 0,
      // 每页长度（或宽度）
      paginationSize: [0, 0],
      // 分页控件大小
      groupSize: [0, 0] // legends 容器大小 $group.contentSize

    };
    this.disableds = {};
  }

  getDefaultAttrs() {
    return {
      size: ['100%', '100%'],
      orient: 'horizontal',
      // 布局方式， vertical | horizontal
      align: ['left', 'top'],
      // 水平方向布局，left | center | right, 垂直方向布局，top | center | bottom
      formatter: d => d.value || d,
      enableClick: true
    };
  }

  get isVertical() {
    /* eslint-disable eqeqeq */
    return this.attr('orient') == 'vertical';
  }

  get size() {
    var parentSize = this.chart.getSize();
    var size = this.attr('__size__');

    if (!size) {
      size = this.attr('size');
      this.attr('__size__', size);
    }

    size = size.map((v, i) => convertPercent2Number(v, parentSize[i]));
    this.attr('size', size);
    return size;
  }

  get pos() {
    var {
      align
    } = this.attr();
    var parentSize = this.chart.getSize();
    var [width, height] = this.$group.contentSize; // this.state.groupSize = [width, height] // 保存当前 group 的内容大小

    var isValidLayout = (value, type) => {
      if (type === 'horizontal') {
        // 水平布局
        return ['default', 'left', 'center', 'right'].indexOf(value) > -1;
      } else {
        // 垂直布局
        return ['default', 'top', 'center', 'bottom'].indexOf(value) > -1;
      }
    };

    var hLocation = {
      // 水平定位
      default: 0,
      left: 0,
      center: (parentSize[0] - width) / 2,
      right: parentSize[0] - width,

      numberOrPercent(num) {
        // 输入 数字或百分比
        if (typeof num === 'number') {
          return num;
        } else {
          var val = 0;

          try {
            val = parseFloat(num) / 100;
          } catch (e) {}

          return (parentSize[0] - width) * val;
        }
      }

    };
    var vLocation = {
      // 垂直定位
      default: 0,
      top: 0,
      center: parentSize[1] / 2 - height / 2,
      bottom: parentSize[1] - height,

      numberOrPercent(num) {
        // 输入 数字或百分比
        if (typeof num === 'number') {
          return num;
        } else {
          var val = 0;

          try {
            val = parseFloat(num) / 100;
          } catch (e) {}

          return (parentSize[1] - height) * val;
        }
      }

    };
    return {
      x: isValidLayout(align[0], 'horizontal') ? hLocation[align[0]] : hLocation.numberOrPercent(align[0]),
      y: isValidLayout(align[1], 'vertical') ? vLocation[align[1]] : vLocation.numberOrPercent(align[1])
    };
  }
  /**
   * Legend 配色。支持：
   * 1. 用户主动配色，如：legend.color(['red', 'blue', 'yellow'])
   * 2. 使用指定 target 的配色，如：legend.attr('target', pie ), 这时候 legend 就会读取 pie 的配色方案
   * 3. 使用当前 chart 的第一个 visual 的配色方案
   * 4. 使用当前 Theme 配置的 chart 的配色方案
   * @param {*} i
   */


  color(i) {
    var target = this.attr('target');

    if (target) {
      this._colors = target.color && target.color();
    }

    if (isArray(i) || isString(i)) {
      return super.color(i);
    } else {
      // if (!this._colors.length) {
      // 当前 legend 没有配色
      var colors;

      if (this.chart) {
        colors = this.chart.visuals[0] && this.chart.visuals[0].color && this.chart.visuals[0].color();
      }

      if (colors && colors.length) {
        this._colors = colors;
      } // }


      return super.color(i);
    }
  }

  shouldUpdate() {
    return true;
  }

  getPaginationSize() {
    var getContentSize = $group => {
      return $group && $group.clientSize || [0, 0];
    };

    var size0 = getContentSize(this.$refs['paginationPrev']);
    var size1 = getContentSize(this.$refs['paginationText']);
    var size2 = getContentSize(this.$refs['paginationNext']);
    return [size0[0] + size1[0] + size2[0], size0[1] + size1[1] + size2[1]];
  }

  ensurePaginationSize() {
    var {
      totalPage,
      paginationSize
    } = this.state;
    /* eslint-diable eqeqeq */

    if (totalPage > 1 && (!paginationSize || paginationSize.some(v => v <= 0))) {
      Promise.resolve().then(() => {
        this.paginatify();
      });
    }
  }

  paginatify() {
    this.chart.layer.prepareRender().then(() => {
      var vertical = this.isVertical;
      var rootSize = this.size;
      var legendSize = this.$refs['legends'] && this.$refs['legends'].contentSize || [0, 0];
      var paginationSize = this.getPaginationSize();

      var handle = () => {
        var perPageWidthOrHeight;
        var totalPage;
        var i = vertical ? 1 : 0;
        perPageWidthOrHeight = rootSize[i] - paginationSize[i];
        totalPage = Math.ceil(legendSize[i] / perPageWidthOrHeight);
        this.setState({
          page: this.state.page > totalPage ? totalPage : 1,
          totalPage: totalPage > 1 ? totalPage : 1,
          perPageWidthOrHeight,
          paginationSize
        }, true);
      };
      /* eslint-diable eqeqeq */


      if (paginationSize.some(v => v <= 0)) {
        // 无法正确获取分页高度
        // this.ensurePaginationSize()
        Promise.resolve().then(() => {
          paginationSize = this.getPaginationSize();
          handle();
        });
      }

      handle(); // 无论如何都要调一次，已方便后面可以获取到分页控件的大小
    });
  }

  handleData() {
    var ret = null;

    if (this.data) {
      ret = this.data;
    } else {
      var layoutBy = this.attr('layoutBy');

      if (layoutBy === 'col') {
        ret = this.dataset.getColNames();
      } else {
        ret = this.dataset.getRowNames();
      }

      ret.forEach(name => {
        var d = this.dataset._selectDataByName(name, layoutBy);

        if (d.some(t => t.disabled)) {
          this.disableds[name] = true;
        } else {
          this.disableds[name] = false;
        }
      });
    }

    return ret;
  }

  beforeRender() {
    return this.handleData();
  }

  beforeUpdate() {
    return this.handleData();
  }

  render(names) {
    var _this$chart$resolveTh = this.chart.resolveTheme('Legend'),
        {
      icon,
      text
    } = _this$chart$resolveTh,
        rootStyle = _objectWithoutProperties(_this$chart$resolveTh, ["icon", "text"]);

    var {
      formatter
    } = this.attr();
    var isVertical = this.isVertical;
    var {
      page,
      totalPage,
      perPageWidthOrHeight
    } = this.state;
    var {
      x,
      y
    } = this.pos;
    var size = this.size;
    var renderData = this.getData();
    var colData = [];
    renderData.forEach((arr, i) => {
      var curArr = [];
      arr.forEach(item => {
        curArr.push(item.dataOrigin);
      });
      colData.push(curArr);
    });
    this.ensurePaginationSize();
    return qcharts.h(Group, _extends({
      boxSizing: 'border-box'
    }, totalPage > 1 ? _objectSpread({
      display: 'flex',
      flexDirection: isVertical ? 'column' : 'row'
    }, isVertical ? {
      height: size[1]
    } : {}) : {}, {
      border: [1, 'transparent'],
      zIndex: 1000,
      bgcolor: 'transparent'
    }, isVertical ? {
      x,
      alignItems: 'center',
      clipOverflow: false
    } : {
      x
    }, isNumber(y) ? {
      y
    } : {
      justifyContent: y
    }, rootStyle, {
      clipOverflow: false,
      enableCache: false
    }), qcharts.h(Group, _extends({
      boxSizing: 'border-box',
      clipOverflow: totalPage > 1
    }, totalPage > 1 ? {
      flex: 1,
      [isVertical ? 'height' : 'width']: perPageWidthOrHeight
    } : {
      bgcolor: 'transparent' // display: 'inline-flex' // spritejs@2.27.3 存在问题，这样会不断重绘

    }, {
      enableCache: false
    }), qcharts.h(Group, {
      boxSizing: 'border-box',
      ref: this.resolveRef('legends'),
      display: "flex",
      justifyContent: 'space-around',
      flexDirection: isVertical ? 'column' : 'row',
      flexWrap: "no-wrap",
      enableCache: false
    }, names.map((name, i) => qcharts.h(Group, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'no-wrap',
      padding: [0, 5],
      clipOverflow: false,
      enableCache: false,
      onMouseenter: () => {
        this.chart.setCanvasCursor('pointer');
      },
      onClick: () => this.changeDataSetData(name),
      onMouseleave: () => {
        this.chart.setCanvasCursor('default');
      }
    }, qcharts.h(Sprite, _extends({}, icon, {
      bgcolor: this.color(i)
    }, this.style('icon')({}, name, i), this.disableds[name] ? {
      bgcolor: '#ccc'
    } : {}, {
      hoverState: this.style('icon:hover')({}, name, i),
      onMousemove: (_, el) => el.attr('state', 'hover'),
      onMouseleave: (_, el) => el.attr('state', 'normal')
    })), qcharts.h(Label, _extends({
      clipOverflow: false,
      bgcolor: 'transparent',
      text: formatter(name, colData[i], i)
    }, text, this.style('text')({}, name, i), {
      hoverState: this.style('text:hover')({}, name, i),
      onMouseenter: (_, el) => el.attr('state', 'hover'),
      onMouseleave: (_, el) => el.attr('state', 'normal')
    })))))), totalPage <= 1 ? null : [qcharts.h(Path, _extends({}, isVertical ? {
      marginLeft: 5
    } : {}, {
      ref: this.resolveRef('paginationPrev'),
      padding: [isVertical ? 2 : 1, 0, 0, 0],
      d: isVertical ? 'M 0 15 L 15 15 L7.5 0 Z' : 'M 0 7.5 L 13 0 L13 15 Z',
      fillColor: page <= 1 ? '#ccc' : '#324556',
      onClick: this.changePage('prev'),
      onMouseenter: () => this.chart.setCanvasCursor('pointer'),
      onMouseleave: () => this.chart.setCanvasCursor('default')
    })), qcharts.h(Label, {
      ref: this.resolveRef('paginationText'),
      font: "14px '\u5B8B\u4F53'",
      text: page + '/' + totalPage + '',
      lineBreak: "normal",
      padding: isVertical ? [0, 2] : [0, 2]
    }), qcharts.h(Path, _extends({}, isVertical ? {
      marginLeft: 5
    } : {}, {
      ref: this.resolveRef('paginationNext'),
      padding: [isVertical ? 2 : 1, 0, 0, 0],
      d: isVertical ? 'M 0 0 L 15 0 L7.5 13 Z' : 'M 13 7.5 L 0 0 L0 15 Z',
      fillColor: page >= totalPage ? '#ccc' : '#324556',
      onClick: this.changePage('next'),
      onMouseenter: () => this.chart.setCanvasCursor('pointer'),
      onMouseleave: () => this.chart.setCanvasCursor('default')
    }))]);
  }

  rendered() {
    this.on('resize', () => {
      this.paginatify();
    });
    this.paginatify();
  }

  checkAlign() {
    var {
      groupSize
    } = this.state;
    var align = this.attr('align'); // 因为数据的更新可能导致 group.contentSize 有改动，所以需要重新 align

    var [width, height] = this.$group.contentSize;

    if (align[0] !== 'left' || align[1] !== 'right') {
      if (width !== groupSize[0] || height !== groupSize[1]) {
        this.setState({
          groupSize: [width, height]
        }, true);
      }
    }
  }

  updated() {
    var {
      page,
      perPageWidthOrHeight
    } = this.state;
    page = page > 1 ? page : 1;
    var nextScroll = (page - 1) * perPageWidthOrHeight;
    var isVertical = this.isVertical;
    this.$refs['legends'].transition(0.3).attr(isVertical ? 'scrollTop' : 'scrollLeft', nextScroll);
    setTimeout(() => this.checkAlign());
  }

}