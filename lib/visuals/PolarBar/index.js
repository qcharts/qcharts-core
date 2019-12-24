function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Ring } from 'spritejs';
import { clone } from '../../util';
import { BaseVisual } from '../../core';
import layout from './layout'; // import { withText } from './text'

export class PolarBar extends BaseVisual {
  constructor() {
    var _attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    super(_attrs);

    _defineProperty(this, "getRing", (ring, i, el) => {
      if (!el) {
        return;
      }

      this.$pillars[i] = el;

      if (el.isTranslatedByInitiativeClick) {
        // 主动点击导致扇形移动，将不会自动移回
        return;
      }

      if (ring.selected && ring.endAngle > ring.startAngle) {
        if (!el.parentNode) {
          el.on('append', () => this.toggleTranslate(ring, null, el));
        } else {
          var isTranslated = el.isTranslated;

          if (isTranslated) {
            el.isTranslated = false;
          }

          this.toggleTranslate(ring, null, el);
        }
      } else if (!ring.selected && el.isTranslated) {
        this.toggleTranslate(ring, null, el);
      }
    });

    _defineProperty(this, "toggleTranslate", (attrs, evt, el) => {
      var isTranslated = el.isTranslated;
      var offset = Math.max(20, attrs.maxRadius * 0.1);
      var {
        startAngle,
        endAngle
      } = attrs;
      var angle = (startAngle + endAngle) / 2;
      var translate = [offset * Math.cos(angle), offset * Math.sin(angle)]; // let target = el.parentNode

      var target = el; // if (target.attr('name') === 'pieRoot') {
      //   target = el
      // }

      if (isTranslated) {
        target.transition(0.3).attr('translate', [0, 0]);
        el.isTranslated = false;
      } else {
        target.transition(0.3).attr('translate', translate);
        el.isTranslated = true;
      }
    });

    this.$pillars = [];
    this.chartSize = [];
  }

  getDefaultAttrs() {
    return {
      groupPadAngle: 0,
      radius: 1,
      innerRadius: 0,
      // startAngle: Math.PI * -0.5,
      // endAngle: Math.PI * 1.5,
      padAngle: 0,
      type: 'PolarBar',
      stack: false,
      mouseDisabled: false,
      splitNumber: 0,
      stackGap: 0,
      translateOnClick: true
    };
  }

  get name() {
    return this.attr('type');
  }

  get center() {
    var {
      size
    } = this.attr();
    var [width, height] = size;
    var [x, y] = [width / 2, height / 2];
    return [x, y];
  }

  get maxOuterRadius() {
    var {
      radius,
      size
    } = this.attr();
    var [width, height] = size; // if (endAngle - startAngle === Math.PI / 2) {
    //   return Math.min(width, height) * radius
    // } else {

    return Math.min(width, height) / 2 * radius; // }
  }

  get pos() {
    var {
      size
    } = this.attr();
    var [width, height] = size;
    var maxRadius = this.maxOuterRadius;
    var [x, y] = [width / 2 - maxRadius, height / 2 - maxRadius];
    return [x, y];
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
    var pos = this.pos;
    var maxOuterRadius = this.maxOuterRadius; // const innerRadius = this.innerRadius

    var dataInfoObj = {
      radius: this.attr('radius'),
      innerRadius: this.attr('innerRadius'),
      data: data,
      barSize: this.attr('size'),
      stack: this.attr('stack'),
      groupGap: this.attr('groupPadAngle'),
      splitNumber: this.attr('splitNumber'),
      stackGap: this.attr('stackGap'),
      padAngle: this.attr('padAngle')
    };
    var result = layout()(dataInfoObj);
    result.barData.forEach((bar, i) => {
      bar.fillColor = bar.fillColor || this.color(i % dataLength);
      bar.maxRadius = maxOuterRadius;
      bar.lineWidth = 0;
      bar.pos = pos;
      bar.dataOrigin = data.length > 1 ? clone(data[i % dataLength][Math.floor(i / dataLength)].dataOrigin) : clone(data[Math.floor(i / dataLength)][i % dataLength].dataOrigin);
      bar.index = i;
      bar.color = bar.fillColor;
      var normalState = this.style('pillar')(bar, bar.dataOrigin, bar.index);
      Object.assign(bar, normalState);

      if (bar.disabled) {
        bar.lineWidth = 0;
      }

      if (bar.lineWidth && bar.lineWidth >= 1) {
        // 避免只展示一个扇形时出现边框
        var {
          startAngle,
          endAngle
        } = bar;
        var angle = (startAngle + endAngle) % (Math.PI * 1);
        var groupBarNumber = result.barData.length / result.groupData.length;

        if (angle <= 0 && result.barData.filter(ring => !ring.disabled).length / groupBarNumber <= 1) {
          bar.lineWidth = 0;
        }
      }
    });
    result.groupData.forEach((bar, i) => {
      bar.index = i;
      bar.pos = pos;
      bar.maxRadius = maxOuterRadius;
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
          endAngle: pillar.startAngle
        },
        to: {
          endAngle: pillar.endAngle
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
          startAngle: 0,
          endAngle: 0
        };
      }

      if (this.attr('stack')) {
        return {
          from: {
            innerRadius: prev.disabled ? nextPillar.innerRadius : prev.innerRadius,
            outerRadius: prev.disabled ? nextPillar.innerRadius : prev.outerRadius
          },
          to: {
            innerRadius: nextPillar.disabled ? prev.innerRadius : nextPillar.innerRadius,
            outerRadius: nextPillar.disabled ? prev.innerRadius : nextPillar.outerRadius
          }
        };
      } else {
        return {
          from: {
            startAngle: prev.startAngle,
            endAngle: prev.endAngle
          },
          to: {
            startAngle: nextPillar.startAngle,
            endAngle: nextPillar.endAngle
          }
        };
      }
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
    var translateOnClick = this.attr('translateOnClick');
    return qcharts.h(Group, {
      zIndex: 100,
      enableCache: false,
      clipOverflow: false
    }, qcharts.h(Group, {
      clipOverflow: false
    }, data.groupData.map((pillar, i) => {
      var normalState = this.style('backgroundPillar')(pillar, pillar.dataOrigin, pillar.index);

      if (normalState === false) {
        return;
      }

      return qcharts.h(Ring, _extends({}, pillar, normalState, {
        hoverState: Object.assign({}, this.style('backgroundpillar:hover')(pillar, pillar.dataOrigin, pillar.index)),
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
      }, qcharts.h(Ring, _extends({
        ref: el => this.getRing(pillar, i, el)
      }, pillar, {
        animation: this.resolveAnimation({
          from,
          to,
          duration: 500,
          delay: 0
        }),
        hoverState: this.style('pillar:hover')(pillar, pillar.dataOrigin, pillar.index),
        onMouseenter: (_, el) => !this.attr('mouseDisabled') && el.attr('state', 'hover'),
        onMouseleave: (evt, el) => {
          !this.attr('mouseDisabled') && el.attr('state', 'normal');
        },
        onClick: (evt, el) => {
          evt.stopDispatch();

          if (!this.attr('stack') && translateOnClick) {
            el.isTranslatedByInitiativeClick = true; // 主动点击

            this.toggleTranslate(pillar, evt, el);
          }
        }
      })));
    })));
  }

}