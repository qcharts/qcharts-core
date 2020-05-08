function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Ellipse, Triangle, Rect, Star, Sprite, Path } from 'spritejs';
import { isArray, isNumber } from './is';

var convert2Array = num => {
  return isArray(num) ? num : [num, num];
};

var getTriangleStyle = size => {
  return {
    angle: 60,
    sides: size.map(s => s * 2),
    anchor: [1, 1],
    rotate: 180,
    translate: size
  };
};

var getRectStyle = size => {
  return {
    angle: 90,
    sides: size.map(s => s * 2),
    anchor: [0.5, 0.5]
  };
};

var getStarStyle = size => {
  var [sizeX, sizeY] = size;
  var style = {
    radius: sizeX * 1.1,
    angle: 5,
    anchor: [0.5, 0.5]
  };

  if (sizeX !== sizeY) {
    style.innerRadius = sizeY * 1.1;
  }

  return style;
};

var getEllipseStyle = size => {
  var [radiusX, radiusY] = size;
  return {
    radiusX,
    radiusY,
    anchor: [0.5, 0.5]
  };
};

var getSpriteStyle = (pointType, size) => {
  return size ? {
    textures: pointType,
    size
  } : {
    textures: pointType
  };
};

var getPathStyle = (pointType, scale) => {
  var scaleArray = scale && convert2Array(scale);
  var style = {
    d: pointType,
    anchor: [0.5, 0.5]
  };
  return scaleArray ? _objectSpread({}, style, {
    scale: scaleArray
  }) : _objectSpread({}, style);
};
/**
 * 根据用户给的style，计算出各个图形真实的样式
 * @param {Object} style normal style
 * @param {Object} hStyle hover style
 * @returns {Object} {PointSymbol, normalStyle, hoverStyle}
 */


export function getSymbolAndStyle(style, hStyle) {
  var normalStyle;
  var hoverStyle;
  var PointSymbol = Ellipse; // normal

  var pointType = 'circle';

  if (style && style.pointType) {
    pointType = style.pointType;
  }

  var sizeArray = null;

  if (style && (isNumber(style.size) || isArray(style.size))) {
    sizeArray = convert2Array(style.size);
  } // hover


  var hSizeArray = null;

  if (hStyle && (isNumber(hStyle.size) || isArray(hStyle.size))) {
    hSizeArray = convert2Array(hStyle.size);
  } // url or base64 img


  if (pointType.startsWith('http') || pointType.startsWith('data:image')) {
    PointSymbol = Sprite;
    normalStyle = getSpriteStyle(pointType, sizeArray);
    hoverStyle = getSpriteStyle(pointType, hSizeArray);
  } else if (pointType.startsWith('M')) {
    PointSymbol = Path;
    normalStyle = getPathStyle(pointType, style && style.scale);
    hoverStyle = getPathStyle(pointType, hStyle && hStyle.scale);
  } else {
    sizeArray = sizeArray || [3, 3];
    hSizeArray = hSizeArray || sizeArray;

    switch (pointType) {
      case 'triangle':
        normalStyle = getTriangleStyle(sizeArray);
        hoverStyle = getTriangleStyle(hSizeArray);
        PointSymbol = Triangle;
        break;

      case 'rect':
        normalStyle = getRectStyle(sizeArray);
        hoverStyle = getRectStyle(hSizeArray);
        PointSymbol = Rect;
        break;

      case 'star':
        normalStyle = getStarStyle(sizeArray);
        hoverStyle = getStarStyle(hSizeArray);
        PointSymbol = Star;
        break;

      default:
        normalStyle = getEllipseStyle(sizeArray);
        hoverStyle = getEllipseStyle(hSizeArray);
        PointSymbol = Ellipse;
    }
  }

  var mergeNormalStyle = _objectSpread({}, style, {}, normalStyle);

  var mergeHoverStyle = _objectSpread({}, hStyle, {}, hoverStyle); // 非图片样式的删除 size属性，避免bug


  if (PointSymbol !== Sprite) {
    if (mergeNormalStyle) {
      delete mergeNormalStyle.size;
    }

    if (mergeHoverStyle) {
      delete mergeHoverStyle.size;
    }
  }

  return {
    PointSymbol,
    normalStyle: mergeNormalStyle,
    hoverStyle: mergeHoverStyle
  };
}