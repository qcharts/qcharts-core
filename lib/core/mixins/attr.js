import { isObject, isFunction } from '../../util';
export function initAttr(component) {
  component._attrs = Object.create(null);
}
export function attrMixin(Component) {
  Component.prototype.getDefaultAttrs = function getDefaultAttrs() {
    return {};
  };

  Component.prototype.attr = function attr(key, value) {
    var attrs = this._attrs;

    if (isObject(key)) {
      Object.keys(key).forEach(k => this.attr(k, key[k]));
    } else {
      if (arguments.length <= 1) {
        return key ? attrs[key] : attrs;
      } else {
        key && (attrs[key] = value);
      }
    }
  };

  Component.prototype.style = function style(type, style) {
    var _this = this;

    if (style === undefined) {
      var _style = this.attr('@' + type);

      return function () {
        if (isFunction(_style)) {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return _style.apply(_this, args);
        } else {
          return _style;
        }
      };
    } else {
      this.attr('@' + type, style);
      return this;
    }
  };

  Component.prototype.isStyleExist = function isStyleExist(name) {
    var style = this.attr('@' + name);
    return Boolean(style);
  };
}