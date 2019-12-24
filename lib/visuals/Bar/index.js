function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Sprite, RectSprite } from 'spritejs';
import { clone } from '../../util';
import { BaseVisual } from '../../core';
import layout from './layout';
import { withText } from './text';
export class Bar extends BaseVisual {
  constructor() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(attrs);
    this.$pillars = [];
    this.chartSize = [];
  }

  getDefaultAttrs() {
    return {
      type: 'Bar',
      stack: false,
      transpose: false,
      barWidth: 0,
      mouseDisabled: false,
      barGap: 0,
      splitNumber: 0,
      stackGap: 0
    };
  }

  get name() {
    return this.attr('type');
  }

  transform(data) {
    if (!data || data.length === 0) {
      return {
        barData: [],
        groupData: []
      };
    }

    var dataLength = data.length > 1 ? data.length : data[0].length;
    this.legendArr = Array.from({
      length: data.length
    }, () => {
      return 1;
    });
    var dataInfoObj = {
      data: data,
      barSize: this.attr('size'),
      barWidth: this.attr('barWidth'),
      stack: this.attr('stack'),
      transpose: this.attr('transpose'),
      groupGap: this.attr('barGap'),
      splitNumber: this.attr('splitNumber'),
      stackGap: this.attr('stackGap')
    };
    var result = layout()(dataInfoObj);
    result.barData.forEach((bar, i) => {
      bar.fillColor = bar.fillColor || this.color(i % dataLength);
      bar.dataOrigin = data.length > 1 ? clone(data[i % dataLength][Math.floor(i / dataLength)].dataOrigin) : clone(data[Math.floor(i / dataLength)][i % dataLength].dataOrigin);
      bar.index = i;
      bar.color = bar.fillColor;
      var normalState = this.style('pillar')(bar, bar.dataOrigin, bar.index);
      Object.assign(bar, normalState); // bar.strokeColor = bar.fillColor
    });
    result.groupData.forEach((bar, i) => {
      bar.index = i;
    });
    return result;
  }

  beforeRender() {
    this.$group.attr({
      clipOverflow: false
    });
    super.beforeRender();
    var data = this.getData();
    var result = this.transform(data);
    this.pillars = result.barData;
    this.fromTos = this.pillars.map((pillar, i) => {
      return {
        from: {
          size: this.attr('transpose') ? [0, pillar.size[1]] : [pillar.size[0], 0]
        },
        to: {
          size: pillar.size
        }
      };
    });
    return result;
  }

  beforeUpdate() {
    super.beforeUpdate();
    var data = this.getData();
    var pillars = this.pillars;
    var newRenderData = this.transform(data);
    this.fromTos = newRenderData.barData.map((nextPillar, i) => {
      var prev = pillars[i] ? pillars[i] : newRenderData.barData[i - 1];

      if (!prev) {
        prev = {
          size: [0, 0],
          pos: nextPillar.pos,
          labelAttrs: null
        };
      }

      return {
        from: {
          size: prev.disable ? this.attr('transpose') ? [0, prev.size[1]] : [prev.size[0], 0] : prev.size,
          pos: prev.pos
        },
        to: {
          size: nextPillar.size,
          pos: nextPillar.pos
        },
        textFrom: {
          pos: prev.labelAttrs && prev.labelAttrs.pos ? prev.labelAttrs.pos : nextPillar.labelAttrs.pos
        },
        textTo: {
          pos: nextPillar.labelAttrs.pos
        }
      };
    });
    this.pillars = newRenderData.barData;
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

  render(data) {
    return qcharts.h(Group, {
      zIndex: 100,
      enableCache: false,
      clipOverflow: false
    }, qcharts.h(Group, null, data.groupData.map((pillar, i) => {
      var normalState = this.style('backgroundPillar')(pillar, pillar.dataOrigin, pillar.index);

      if (normalState === false) {
        return;
      }

      return qcharts.h(Sprite, _extends({}, pillar, normalState, {
        hoverState: Object.assign({
          opacity: 0.05
        }, this.style('backgroundpillar:hover')(pillar, pillar.dataOrigin, pillar.index)),
        onMouseenter: (_, el) => !this.attr('mouseDisabled') && el.attr('state', 'hover'),
        onMousemove: (evt, el) => {
          !this.attr('mouseDisabled') && this.showTooltip(evt, pillar.rects);
        },
        onMouseleave: (evt, el) => {
          if (!this.attr('mouseDisabled')) {
            this.hideTooltip();
            el.attr('state', 'normal');
          }
        }
      }));
    })), qcharts.h(Group, {
      clipOverflow: false
    }, data.barData.map((pillar, i) => {
      var {
        from,
        to
      } = this.fromTos[i];
      return qcharts.h(Group, {
        enableCache: false,
        clipOverflow: false
      }, qcharts.h(RectSprite, _extends({}, pillar, from, {
        animation: this.resolveAnimation({
          from,
          to,
          duration: 300,
          delay: 0,
          attrFormatter: attr => {
            return Object.assign(attr, {
              size: [Math.round(attr.size[0]), Math.round(attr.size[1])]
            });
          },
          useTween: true
        }),
        hoverState: this.style('pillar:hover')(pillar, pillar.dataOrigin, pillar.index),
        onMouseenter: (_, el) => !this.attr('mouseDisabled') && el.attr('state', 'hover'),
        onMouseleave: (evt, el) => {
          !this.attr('mouseDisabled') && el.attr('state', 'normal');
        }
      })), withText(this, pillar));
    })));
  }

}