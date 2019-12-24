import { isObject, isBoolean } from './is';
export function formatAnimationAttr(attrs) {
  if (isBoolean(attrs)) {
    var obj = {
      use: false
    };

    if (attrs === true) {
      obj.use = true;
    }

    return obj;
  } else if (isObject(attrs)) {
    return attrs;
  } else {
    return {};
  }
}