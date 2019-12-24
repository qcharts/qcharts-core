function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Tween } from '../../tween';
/**
 * 为 spritejs 元素添加动画
 * @param {*} el
 * @param {*} attrs
 */

export function animate(el, attrs) {
  if (!el || !attrs.animation) {
    return;
  }

  var animation = _objectSpread({
    delay: 0,
    duration: 300,
    useTween: false
  }, attrs.animation);

  var {
    from,
    middle,
    to,
    delay,
    duration,
    useTween,
    attrFormatter = d => d
  } = animation;

  if (!from || !to) {
    return;
  }

  delete animation.from;
  delete animation.to;
  delete animation.attrFormatter;

  var setAnimation = () => {
    if (!useTween) {
      var keys = null;

      if (middle) {
        keys = [from, middle, to];
      } else {
        keys = [from, to];
      }

      el.animate(keys, _objectSpread({
        easing: 'ease-in-out',
        fill: 'both'
      }, animation)).finished.then(() => {
        delete to.offset;
        el.attr(to);
      });
    } else {
      new Tween().from(from).to(to).delay(delay).duration(duration).onUpdate(attr => {
        el.attr(attrFormatter(attr));
      }).start();
    }
  };

  if (!el.parent) {
    el.on('append', () => {
      setAnimation();
    });
  } else {
    setAnimation();
  }
}
/**
 * 为 spritejs 元素设置 诸如`normal` 、`hover`  style
 * 通过将 `style` 转换为 `states`
 * 使得开发可以直接通过 `el.attr('state', 'hover')` 来切换样式
 * @param {*} el
 * @param {*} attrs
 */

export function resolveStyle(el, attrs) {
  var normal = Object.create(null);
  var cloneNode = null;

  var initialStates = _objectSpread({
    normal
  }, attrs.states || {});

  delete attrs.states;
  var states = Object.keys(attrs).reduce((a, key) => {
    if (!/\S+state$/i.test(key)) {
      return a;
    }

    var inputState = attrs[key];

    if (!inputState || typeof inputState !== 'object') {
      return a;
    }

    var stateName = key.slice(0, -5);

    if (!cloneNode) {
      cloneNode = el.cloneNode();
    }

    cloneNode.attr(inputState);
    var currentAttrs = cloneNode.attr();
    Object.keys(inputState).forEach(k => {
      inputState[k] = currentAttrs[k];
    });
    var originAttrs = Object.assign({}, el.attr(), attrs);
    Object.keys(inputState).forEach(key => {
      if (!(key in originAttrs)) {
        console.warn("Set invalid attribute '".concat(key, "' to ").concat(el.nodeName, "."));
        normal[key] = inputState[key];
      } else {
        normal[key] = originAttrs[key];
      }
    });
    a[stateName] = inputState;
    delete attrs[key];
    return a;
  }, initialStates);
  el.attr({
    state: 'normal',
    states
  });
}
/**
 * ref 回调函数
 * @param {*} el
 * @param {*} attrs
 */

export function applyRef(el, attrs) {
  var ref = attrs.ref;
  delete attrs.ref;

  if (ref) {}

  if (ref && el) {
    try {
      ref(el, attrs);
    } catch (e) {
      console.error(e);
    }
  }
}
/**
 * 为 spritejs 元素添加事件
 * @param {*} el
 * @param {*} attrs
 */

export function delegateEvent(el) {
  var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  Object.keys(attrs).forEach(key => {
    if (!/^on/.test(key)) {
      return;
    }

    var type = key.split('on')[1].toLowerCase();

    var cb = attrs[key] || (() => {});

    el.off(type);
    el.on(type, evt => cb(evt, el));
    delete attrs[key];
  });
}