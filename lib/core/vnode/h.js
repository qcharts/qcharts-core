var VNode = function VNode() {};

var flattern = arr => [].concat.apply([], arr);

export default function h(tagName, attrs) {
  var node = new VNode();
  node.tagName = tagName;
  node.attrs = attrs || {};

  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  node.children = flattern(children).filter(Boolean);
  return node;
}