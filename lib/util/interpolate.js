import { isArray, isObject } from './is';

var constant = x => () => x;

var number = (a, b) => t => a + (b - a) * t;

var array = (a, b) => {
  var bl = b ? b.length : 0;
  var al = a ? Math.min(bl, a.length) : 0;
  var x = new Array(al);
  var c = new Array(bl);
  var i;

  for (i = 0; i < al; ++i) {
    x[i] = interpolate(a[i], b[i]);
  }

  for (; i < bl; ++i) {
    c[i] = b[i];
  }

  return t => {
    for (i = 0; i < al; ++i) {
      c[i] = x[i](t);
    }

    return c;
  };
};

var object = (a, b) => {
  var i = {};
  var c = {};
  var k;

  if (!a || !isObject(a)) {
    a = {};
  }

  if (!b || !isObject(b)) {
    b = {};
  }

  for (k in b) {
    if (k in a) {
      i[k] = interpolate(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return t => {
    for (k in i) {
      c[k] = i[k](t);
    }

    return c;
  };
};

export function interpolate(a, b) {
  var type = typeof b;
  return b === null || type === 'string' || type === 'boolean' ? constant(b) : (type === 'number' ? number : isArray(b) ? array : object)(a, b);
}