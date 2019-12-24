function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Group, Ring, Label } from 'spritejs';
import { BaseVisual } from '../../core';
import layout from './layout';
import { withGuide } from './guide';
import { withText } from './text';
import { flattern, axis, scaleLinear, formatAnimationAttr } from '../../util';
export class Pie extends BaseVisual {
  constructor() {
    var _attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    super(_attrs);

    _defineProperty(this, "getRing", (ring, i, el) => {
      if (!el) {
        return;
      }

      this.$rings[i] = el;

      if (el.isTranslatedByInitiativeClick) {
        // 主动点击导致扇形移动，将不会自动移回
        return;
      }

      if (ring.selected && ring.endAngle > ring.startAngle) {
        if (!el.parentNode) {
          el.on('append', () => this.clickToggle(ring, el));
        } else {
          var isTranslated = el.isTranslated;

          if (isTranslated) {
            el.isTranslated = false;
          }

          this.clickToggle(ring, el);
        }
      } else if (!ring.selected && el.isTranslated) {
        this.clickToggle(ring, el);
      }
    });

    _defineProperty(this, "toggleTranslate", (attrs, evt, el) => {
      var duration = attrs.animation && attrs.animation.duration ? attrs.animation.duration * 0.001 : this.animateDuration * 0.001;
      var globalAnimation = this.attr('animation');
      var isTranslated = el.isTranslated;
      var offset = Math.max(10, attrs.maxRadius * 0.1);
      var {
        startAngle,
        endAngle
      } = attrs;
      var angle = (startAngle + endAngle) / 2;
      var translate = [offset * Math.cos(angle), offset * Math.sin(angle)];
      var target = el.parentNode;

      if (target.attr('name') === 'pieRoot') {
        target = el;
      }

      if (isTranslated) {
        target.transition(duration).attr('translate', [0, 0]);
        el.isTranslated = false;
      } else {
        target.transition(duration).attr('translate', attrs.animation === false || !attrs.animation && globalAnimation === false ? [0, 0] : translate);
        el.isTranslated = true;

        for (var i = 0, len = this.$rings.length; i < len; i++) {
          if (el.id !== this.$rings[i].id && this.$rings[i].isTranslated === true) {
            if (this.$rings[i].parentNode.attr('name') === 'pieRoot') {
              this.$rings[i].transition(duration).attr('translate', [0, 0]);
            } else {
              this.$rings[i].parentNode.transition(duration).attr('translate', [0, 0]);
            }

            this.$rings[i].isTranslated = false;
          }
        }
      }
    });

    _defineProperty(this, "toggleAnimate", (attrs, evt, el) => {
      var duration = attrs.animation && attrs.animation.duration ? attrs.animation.duration * 0.001 : this.animateDuration * 0.001;
      var isTranslated = el.isTranslated;
      var globalAnimation = this.attr('animation');
      var offset = attrs.animation === false || !attrs.animation && globalAnimation === false ? 0 : Math.max(this.attr('radiusOffset'), attrs.maxRadius * 0.1);
      var target = el.parentNode;

      if (target.attr('name') === 'pieRoot') {
        target = el;
      }

      if (isTranslated) {
        el.transition(duration).attr({
          innerRadius: this.innerRadius,
          outerRadius: this.maxOuterRadius
        });
        el.isTranslated = false;
      } else {
        el.transition(duration).attr({
          innerRadius: this.innerRadius + offset,
          outerRadius: this.maxOuterRadius + offset
        });
        el.isTranslated = true;

        for (var i = 0, len = this.$rings.length; i < len; i++) {
          if (el.id !== this.$rings[i].id && this.$rings[i].isTranslated === true) {
            this.$rings[i].transition(duration).attr({
              innerRadius: this.innerRadius,
              outerRadius: this.maxOuterRadius
            });
            this.$rings[i].isTranslated = false;
          }
        }
      }
    });

    this.$rings = [];
    this.sectors = [];
  }

  get name() {
    var isRose = this.attr('rose');
    return isRose ? 'Rose' : 'Pie';
  }

  getDefaultAttrs() {
    return {
      radius: 0.8,
      innerRadius: 0,
      startAngle: Math.PI * -0.5,
      endAngle: Math.PI * 1.5,
      padAngle: 0,
      rose: false,
      translateOnClick: true,
      radiusOffset: 10,
      formatter: function formatter(str) {
        return str;
      }
    };
  }

  get maxOuterRadius() {
    var {
      startAngle,
      endAngle,
      radius,
      size
    } = this.attr();
    var [width, height] = size;

    if (endAngle - startAngle === Math.PI / 2) {
      return Math.min(width, height) * radius;
    } else {
      return Math.min(width, height) / 2 * radius;
    }
  }

  get innerRadius() {
    var {
      radius,
      innerRadius
    } = this.attr();
    return innerRadius <= 0 ? 0 : this.maxOuterRadius / radius * innerRadius;
  }

  get animateDuration() {
    var {
      animation
    } = this.attr();

    if (animation && animation.duration) {
      return animation.duration;
    }

    return 300;
  }

  get center() {
    var {
      size
    } = this.attr();
    var [width, height] = size;
    var [x, y] = [width / 2, height / 2];
    return [x, y];
  }

  get pos() {
    var {
      startAngle,
      endAngle,
      radius,
      size
    } = this.attr();
    var angle = (endAngle + startAngle) / 2;
    var [width, height] = size;
    var maxRadius = this.maxOuterRadius;
    var [x, y] = [width / 2 - maxRadius, height / 2 - maxRadius];

    if (endAngle - startAngle === Math.PI / 2) {
      // 区分象限
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      var maxWidth = radius * width;
      var maxHeight = radius * height;
      x += cos < 0 ? maxWidth / 2 : -(maxWidth / 2);
      y += sin < 0 ? maxHeight / 2 : -(maxHeight / 2);
    }

    return [x, y];
  }

  transform(data, nestData) {
    var {
      startAngle,
      endAngle,
      padAngle,
      rose
    } = this.attr();
    var rings = this.sectors = layout().startAngle(startAngle).endAngle(endAngle).padAngle(padAngle).value(d => rose ? 1 : +d.__valueGetter__())(data); // 如果是rose等分圆形

    var pos = this.pos;
    var maxOuterRadius = this.maxOuterRadius;
    var innerRadius = this.innerRadius;
    var isRose = this.attr('rose');
    var outerRadiuses = []; // 分配给各个扇形的外半径

    if (isRose) {
      var ticks = axis({
        dataSet: nestData
      });
      var scale = scaleLinear().domain([0, ticks[ticks.length - 1]]).range([innerRadius, maxOuterRadius]);
      outerRadiuses = data.map(d => {
        return scale(d.disabled ? 0 : +d.__valueGetter__());
      });
    } else {
      outerRadiuses = rings.map(() => maxOuterRadius);
    }

    rings.forEach((ring, i) => {
      ring.index = i;
      ring.maxRadius = maxOuterRadius;
      ring.outerRadius = outerRadiuses[i];
      ring.innerRadius = innerRadius;
      ring.pos = pos;
      ring.fillColor = this.color(i);
      ring.lineWidth = 0;
      ring.center = this.center; // ring.__patchParent__({ visual: 'pie', color: ring.fillColor })

      var normalState = this.style('sector')(ring, ring.dataOrigin, ring.index);
      Object.assign(ring, normalState);

      if (ring.disabled) {
        ring.lineWidth = 0;
      }

      if (ring.lineWidth && ring.lineWidth >= 1) {
        // 避免只展示一个扇形时出现边框
        var {
          startAngle: _startAngle,
          endAngle: _endAngle
        } = ring;
        var angle = (_startAngle + _endAngle) % (Math.PI * 1);

        if (angle <= 0 && rings.filter(ring => !ring.disabled).length <= 1) {
          ring.lineWidth = 0;
        }
      }
    });
    return rings;
  }

  beforeRender() {
    super.beforeRender();
    var nestData = this.getData();
    var data = flattern(nestData);
    var rings = this.rings = this.transform(data, nestData);
    this.fromTos = rings.map((ring, i) => {
      return {
        from: {
          startAngle: ring.startAngle,
          endAngle: ring.startAngle
        },
        to: {
          startAngle: ring.startAngle,
          endAngle: ring.endAngle
        }
      };
    });
    return rings;
  }

  beforeUpdate() {
    super.beforeUpdate();
    var nestData = this.getData();
    var data = flattern(nestData);
    var rings = this.rings;
    var nextRings = this.transform(data, nestData);
    this.fromTos = nextRings.map((nextRing, i) => {
      var prev = rings[i] ? rings[i] : nextRings[i - 1];

      if (!prev) {
        prev = {
          startAngle: this.attr('startAngle'),
          endAngle: this.attr('startAngle')
        };
      }

      return {
        from: {
          startAngle: prev.disabled ? prev.endAngle : prev.startAngle,
          endAngle: prev.endAngle
        },
        to: {
          startAngle: nextRing.startAngle,
          endAngle: nextRing.endAngle
        }
      };
    });
    this.rings = nextRings;
    return nextRings;
  }

  clickToggle(ring, el) {
    if (ring.animation === false) {
      this.toggleTranslate(ring, null, el, false);
      return;
    }

    if (ring.animation && ring.animation.type === 'slide') {
      this.toggleAnimate(ring, null, el);
    } else {
      this.toggleTranslate(ring, null, el);
    }
  }

  render() {
    var rings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var {
      formatter
    } = this.attr();
    var translateOnClick = this.attr('translateOnClick');
    var needChildren = this.isStyleExist('guideline') || this.isStyleExist('guideText') || this.isStyleExist('text');

    var renderRing = (ring, i, from, to) => {
      return qcharts.h(Ring, _extends({
        ref: el => this.getRing(ring, i, el)
      }, ring, {
        animation: this.resolveAnimation({
          from,
          to,
          duration: 300,
          delay: 0
        }),
        actions: [{
          both: ['normal', 'hover'],
          action: {
            duration: this.animateDuration
          }
        }],
        hoverState: this.style('sector:hover')(ring, ring.dataOrigin, ring.index),
        onMouseenter: (evt, el) => {
          evt.stopDispatch();
          el.attr('state', 'hover');
        },
        onMousemove: (evt, el) => {
          evt.stopDispatch();
          this.chart.setCanvasCursor('pointer');
          this.dataset.hoverData(_objectSpread({
            data: _objectSpread({
              color: ring.fillColor
            }, ring.dataOrigin)
          }, evt));
        },
        onMouseleave: (evt, el) => {
          evt.stopDispatch();
          this.dataset.hoverData(null);
          el.attr('state', 'normal');
          this.chart.setCanvasCursor('default');
        },
        onClick: (evt, el) => {
          evt.stopDispatch();

          if (translateOnClick) {
            el.isTranslatedByInitiativeClick = true; // 主动点击

            this.clickToggle(ring, el);
          }
        }
      }));
    };

    var rendingLabel = (self, rings) => {
      var animateTextStyle = this.style('title')(rings);
      var rotateTextStyle = this.style('subtitle')(rings);

      if (!animateTextStyle && !rotateTextStyle) {
        return;
      }

      var lastAnimateText = '';
      var lastRotateText = '';
      var titleAnimation = {};
      var subTitleAnimation = {};

      if (animateTextStyle) {
        titleAnimation = formatAnimationAttr(animateTextStyle.animation);
        lastAnimateText = self.lastAnimateText || {
          text: animateTextStyle.text
        };
        self.lastAnimateText = {
          text: animateTextStyle.text
        };
      }

      if (rotateTextStyle) {
        subTitleAnimation = formatAnimationAttr(rotateTextStyle.animation);
        lastRotateText = self.lastRotateText || {
          text: rotateTextStyle.text
        };
        self.lastRotateText = {
          text: rotateTextStyle.text
        };
      }

      return qcharts.h(Group, {
        clipOverflow: false,
        enableCache: false
      }, animateTextStyle ? qcharts.h(Label, _extends({}, animateTextStyle, {
        text: formatter(lastAnimateText.text),
        animation: self.resolveAnimation({
          from: animateTextStyle.animation === false ? self.lastAnimateText : lastAnimateText,
          to: self.lastAnimateText,
          duration: 300,
          delay: 0,
          useTween: true,
          attrFormatter: attr => {
            if (typeof attr.text === 'number') {
              var text = formatter(Math.round(attr.text));
              return {
                text: text
              };
            } else {
              return {
                text: formatter(attr.text)
              };
            }
          }
        }, titleAnimation)
      })) : null, rotateTextStyle ? qcharts.h(Label, _extends({}, rotateTextStyle, {
        text: lastRotateText.text,
        animation: self.resolveAnimation({
          from: {
            text: rotateTextStyle.animation === false ? self.lastRotateText.text : lastRotateText.text,
            last: [1, 1]
          },
          middle: {
            text: self.lastRotateText.text,
            scale: rotateTextStyle.animation === false ? [1, 1] : [0, 1]
          },
          to: {
            text: self.lastRotateText.text,
            scale: [1, 1]
          },
          duration: 300,
          delay: 0,
          useTween: false
        }, subTitleAnimation)
      })) : null);
    };

    return qcharts.h(Group, {
      zIndex: 100,
      enableCache: false,
      name: "pieRoot"
    }, rings.map((ring, i) => {
      var {
        from,
        to
      } = this.fromTos[i];
      return needChildren ? qcharts.h(Group, {
        enableCache: false,
        clipOverflow: false,
        size: [1, 1]
      }, renderRing(ring, i, from, to), withText(this, ring), withGuide(this, ring)) : renderRing(ring, i, from, to);
    }), rendingLabel(this, rings));
  }

}