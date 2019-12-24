import { isFunction } from '../../util';
export function initEvents(instance) {
  instance._events = Object.create(null);
}
export function eventsMixin(Component) {
  Component.prototype.on = function on(type, callback) {
    this._events[type] = this._events[type] || [];

    this._events[type].push(callback);

    return this;
  };

  Component.prototype.once = function once(type, fn) {
    var self = this;

    var listener = function listener() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      fn.apply(this, args);
      self.off(type, listener);
    };

    return this.on(type, listener);
  };

  Component.prototype.off = function off(type, fn) {
    if (isFunction(fn)) {
      var listeners = this.getListeners(type);
      var idx = listeners.indexOf(fn);
      listeners.splice(idx, 1);
    } else {
      if (this._events[type]) {
        this._events[type] = [];
      } else {
        this._events = Object.create(null);
      }
    }

    return this;
  };

  Component.prototype.getListeners = function getListeners(type) {
    if (!type) {
      return [];
    } else {
      return this._events[type] || [];
    }
  };

  Component.prototype.emit = function emit() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var type = args[0];
    var payloads = args.slice(1);

    var components = (() => {
      if (this.chart) {
        return [this.chart].concat(this.chart.getChildren());
      } else {
        return [this].concat(this.getChildren && this.getChildren() || []);
      }
    })();

    if (!components || !components.length) {
      return this;
    }

    var dispatchEvent = shape => {
      if (!shape || !shape.getListeners) {
        return;
      }

      var handlers = shape.getListeners(type);
      handlers.map(handler => handler.apply(shape, payloads));
    };

    components.forEach(dispatchEvent);
    return this;
  };
}