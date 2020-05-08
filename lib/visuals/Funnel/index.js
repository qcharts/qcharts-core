function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Polygon, Label } from 'spritejs';
import { clone, isBoolean } from '../../util';
import { BaseVisual } from '../../core';
import layout from './layout';
import { withGuide } from './guide';
export class Funnel extends BaseVisual {
  constructor() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(attrs);
    this.$polygons = [];
  }

  getDefaultAttrs() {
    return {
      formatter: k => k.__textGetter__() || k,
      type: 'Funnel',
      align: 'center',
      pyramid: false
    };
  }

  get name() {
    return this.attr('type');
  }

  transform(data) {
    var dataLength = data && data.length > 1 ? data.length : data[0].length;
    this.legendArr = Array.from({
      length: data.length
    }, () => {
      return 1;
    });
    var dataInfoObj = {
      data: data,
      size: this.attr('size'),
      align: this.attr('align'),
      pyramid: this.attr('pyramid')
    };
    var result = layout()(dataInfoObj);
    result.forEach((plg, i) => {
      plg.align = this.attr('align');
      plg.pyramid = this.attr('pyramid');
      plg.fillColor = plg.bgcolor || this.color(i % dataLength);
      plg.dataOrigin = data.length > 1 ? clone(data[i % dataLength][Math.floor(i / dataLength)]) : clone(data[Math.floor(i / dataLength)][i % dataLength]);
      plg.index = i;
      var normalState = this.style('polygon')(plg, plg.dataOrigin, plg.index);
      Object.assign(plg, normalState);
    });
    return result;
  }

  beforeRender() {
    super.beforeRender();
    var data = this.getData();
    var result = this.transform(data);
    this.polygons = result;
    this.fromTos = this.polygons.map((plg, i) => {
      return {
        from: {
          points: plg.points.length === 4 ? [plg.points[3], plg.points[2], plg.points[2], plg.points[3]] : [plg.points[2], plg.points[2], plg.points[2]]
        },
        to: {
          points: plg.points
        }
      };
    });
    return result;
  }

  beforeUpdate() {
    super.beforeUpdate();
    var data = this.getData();
    var polygons = this.polygons;
    var newRenderData = this.transform(data);
    this.fromTos = newRenderData.map((nextPolygon, i) => {
      var prev = polygons[i] ? polygons[i] : newRenderData[i - 1];

      if (!prev) {
        prev = {
          points: nextPolygon.points,
          labelAttrs: null
        };
      }

      return {
        from: {
          points: prev.points
        },
        to: {
          points: nextPolygon.points
        },
        textFrom: {
          pos: prev.labelAttrs && prev.labelAttrs.pos ? prev.labelAttrs.pos : nextPolygon.labelAttrs.pos
        },
        textTo: {
          pos: nextPolygon.labelAttrs.pos
        }
      };
    });
    this.polygons = newRenderData;
    return newRenderData;
  }

  showTooltip(evt, data) {
    evt.data = data;
    this.dataset.hoverData(_objectSpread({}, evt, {
      data: data
    }));
  }

  hideTooltip() {
    this.dataset.hoverData(null);
  }

  withText(attrs) {
    var {
      labelAttrs,
      dataOrigin,
      index
    } = attrs;

    if (attrs.disabled) {
      return;
    }

    var textStyle = this.style('text')(attrs, dataOrigin, index);

    if (textStyle === false) {
      return;
    }

    var {
      textFrom,
      textTo
    } = this.fromTos[index];
    return qcharts.h(Label, _extends({}, labelAttrs, isBoolean(textStyle) ? {} : textStyle, textFrom, {
      animation: this.resolveAnimation({
        from: textFrom,
        to: textTo,
        duration: 300,
        delay: 0,
        useTween: true
      }),
      onMousemove: (evt, el) => !this.attr('mouseDisable') && el.attr('state', 'hover'),
      onMouseleave: (evt, el) => !this.attr('mouseDisable') && el.attr('state', 'normal'),
      hoverState: this.style('text:hover')(attrs, attrs.dataOrigin, attrs.index)
    }));
  }

  render(data) {
    return qcharts.h(Group, null, data.map((polygon, i) => {
      var {
        from,
        to
      } = this.fromTos[i];
      return qcharts.h(Group, {
        clipOverflow: false
      }, qcharts.h(Polygon, _extends({}, polygon, from, {
        animation: this.resolveAnimation({
          from,
          to,
          duration: 300,
          delay: 0,
          useTween: true
        }),
        hoverState: Object.assign({}, this.style('polygon:hover')(polygon, polygon.dataOrigin, polygon.index)),
        onMouseenter: (_, el) => !this.attr('mouseDisable') && el.attr('state', 'hover'),
        onMousemove: (evt, el) => {
          !this.attr('mouseDisable') && this.showTooltip(evt, Object.assign({
            color: polygon.fillColor
          }, polygon.dataOrigin));
        },
        onMouseleave: (evt, el) => {
          if (!this.attr('mouseDisable')) {
            this.hideTooltip();
            el.attr('state', 'normal');
          }
        }
      })), this.withText(polygon), withGuide(this, polygon, this.attr('formatter')));
    }));
  }

}