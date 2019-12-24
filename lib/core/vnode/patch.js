import { CREATE, REPLACE, UPDATE, REMOVE } from './consts';
import { createElement } from './render';
import { delegateEvent, resolveStyle, animate, applyRef } from './nodeHelper';

var patchAttrs = (el, patches) => {
  if (!el) {
    return;
  }

  if (!Object.keys(patches).length) {
    return;
  }

  applyRef(el, patches);
  resolveStyle(el, patches);
  delegateEvent(el, patches);
  el.attr(patches);
  animate(el, patches);
};

var count = 0;
/**
 * @param {*} parent
 * @param {*} patches
 * @param {*} index
 */

export default function patch(parent, patches) {
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var isRoot = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (!patches || !parent || !parent.childNodes) {
    return;
  }

  var el = isRoot ? parent : parent.childNodes[index - count] || parent.childNodes[0];
  /* eslint-disable indent */

  switch (patches.type) {
    case CREATE:
      {
        var {
          newVNode
        } = patches; // if (newVNode) {

        var newEl = createElement(newVNode);
        newEl && parent.appendChild(newEl); // } else {

        count++; // }

        break;
      }

    case REPLACE:
      {
        var {
          newVNode: _newVNode
        } = patches;

        var _newEl = createElement(_newVNode);

        parent.replaceChild(_newEl, el);
        count--;
        break;
      }

    case REMOVE:
      {
        el.parent.removeChild(el);
        count++;
        break;
      }

    case UPDATE:
      {
        var {
          attrs,
          children
        } = patches;
        patchAttrs(el, attrs);

        for (var i = 0, len = children.length; i < len; i++) {
          patch(el, children[i], i);
        }

        count = 0;
        break;
      }
  }
}