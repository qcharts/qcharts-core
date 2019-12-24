var toStr = obj => Object.prototype.toString.call(obj).slice(8, -1);

export var isArray = obj => toStr(obj) === 'Array';
export var isBoolean = obj => toStr(obj) === 'Boolean';
export var isObject = obj => toStr(obj) === 'Object';
export var isFunction = obj => toStr(obj) === 'Function';
export var isNumber = obj => toStr(obj) === 'Number';
export var isString = obj => toStr(obj) === 'String';
export var isPlainObject = obj => {
  if (typeof obj !== 'object' || obj === null) return false;
  var proto = obj;

  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
};