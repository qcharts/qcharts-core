import { scaleLinear } from '../../util/q-scale';
import { axis } from '../../util/axis';

function layout(obj) {
  var {
    size,
    orient,
    axisGap,
    data,
    type,
    stack,
    field,
    range,
    splitNumber,
    pos
  } = obj;
  var gap = axisGap;
  var scales = [];

  if (field !== undefined) {
    if (type === 'category') {
      // 如果按照分类进行展示全部罗列
      var category = Object.create(null); // category map

      data.forEach(list => {
        list.forEach(item => {
          if (category[item[field]] !== undefined) {
            category[item[field]].push(item);
          } else {
            category[item[field]] = [item];
            scales.push(item[field]);
          }
        });
      });
    } else {
      // 包含type为value 等
      data = data.map(item => item.filter(item => item[field] !== undefined));
      scales = axis({
        dataSet: data,
        stack,
        field,
        section: range,
        needReverse: true,
        splitNumber
      });
    }
  }

  var lengthPx = size[0];

  if (orient === 'left' || orient === 'right') {
    lengthPx = size[1];
  }

  var originalPoint = [0, 0];
  var axisAttrs = {
    points: [[0, 0], [size[0], 0]],
    strokeColor: '#bfbfbf'
  };
  var labelAttrs = {
    padding: [10, 10],
    color: '#67728C',
    fontSize: 12,
    clipOverflow: false
  };
  var scaleAttrs = {
    strokeColor: '#bfbfbf',
    points: [[0, 0]]
  };
  var gridAttrs = {
    strokeColor: 'rgba(0,0,0,0.2)',
    points: [],
    lineDash: [3, 4],
    translate: [0.5, 0.5]
  };
  var nameAttrs = {
    color: '#67728C',
    fontSize: 14,
    width: 2 * pos[0],
    padding: [4, 4],
    textAlign: 'center'
  };
  var sLength = scales.length - 1;

  if (sLength === 0) {
    // 如果长度维1，默认强制使用gap模式
    gap = true;
  }

  if (gap === true) {
    sLength = scales.length;
  }

  var scaleF = scaleLinear().domain([0, sLength]).range([0, lengthPx]);
  scales = scales.map((text, i) => {
    var pos = [];
    var offset = 0;

    if (orient === 'left') {
      if (gap === true) {
        offset = size[1] / scales.length;
        labelAttrs.translate = [0, offset / 2];
      }

      if (type === 'category') {
        pos = [0, scaleF(i)];
      } else {
        pos = [0, size[1] - scaleF(i) - offset];
      }
    } else if (orient === 'right') {
      if (gap === true) {
        offset = size[1] / scales.length;
        labelAttrs.translate = [0, offset / 2];
      }

      if (type === 'category') {
        pos = [size[0], scaleF(i)];
      } else {
        pos = [size[0], size[1] - scaleF(i) - offset];
      }
    } else if (orient === 'top') {
      if (gap === true) {
        offset = size[0] / scales.length;
        labelAttrs.translate = [-offset / 2, 0];
      }

      pos = [scaleF(i) + offset, 0];
    } else {
      if (gap === true) {
        offset = size[0] / scales.length;
        labelAttrs.translate = [-offset / 2, 0];
      }

      pos = [scaleF(i) + offset, size[1]];
    }

    return {
      text: String(text),
      pos,
      offset: scaleF(i),
      originalPoint
    };
  });

  if (orient === 'left') {
    axisAttrs.points = [[0, 0], [0, size[1]]];
    labelAttrs.anchor = [1, 0.5];
    scaleAttrs.points[1] = [-4, 0];
    gridAttrs.points = [[0, 0], [size[0], 0]];
    nameAttrs.pos = [-pos[0], -nameAttrs.fontSize * 2];
  } else if (orient === 'right') {
    originalPoint = [size[0], 0];
    axisAttrs.points = [[0, 0], [0, size[1]]];
    labelAttrs.anchor = [0, 0.5];
    scaleAttrs.points = [[0, 0], [4, 0]];
    gridAttrs.points = [[-size[0], 0], [0, 0]];
    nameAttrs.pos = [size[0] - pos[0], -nameAttrs.fontSize * 2];
  } else if (orient === 'top') {
    labelAttrs.anchor = [0.5, 1];
    scaleAttrs.points[1] = [0, -4];
    gridAttrs.points = [[0, 0], [0, size[1]]];
    nameAttrs.pos = [size[0], -nameAttrs.fontSize];
    nameAttrs.textAlign = 'left';
  } else {
    originalPoint = [0, size[1]];
    labelAttrs.anchor = [0.5, 0];
    scaleAttrs.points[1] = [0, 4];
    gridAttrs.points = [[0, -size[1]], [0, 0]];
    nameAttrs.pos = [size[0], size[1] - nameAttrs.fontSize];
    nameAttrs.textAlign = 'left';
  }

  return {
    scales,
    originalPoint,
    axisAttrs,
    gridAttrs,
    labelAttrs,
    scaleAttrs,
    nameAttrs,
    orient
  };
}

export { layout };