export default function funnelLayout() {
  function funnel(dataInfo) {
    // 输入
    var data = dataInfo.data;
    var size = dataInfo.size;
    var align = dataInfo.align;
    var pyramid = dataInfo.pyramid; // 输出

    var polygons = [];

    var max = data[0][0].__valueGetter__();

    var widthFactory = size[0] / max;
    var POLYGON_NUM = computerLegend(data); // 图例显示个数

    var flag = 0; // 计算当前polygon前面有几个被隐藏

    for (var i = 0, len = data.length; i < len; i++) {
      var polygon = {
        strokeColor: 'transparent',
        points: []
      };

      var value = data[i][0].__valueGetter__();

      var offset = 0;
      var textAnchor = [0, 0.5];

      if (align === 'center') {
        textAnchor = [0.5, 0.5];
        offset = 0.5;
      } else if (align === 'right') {
        offset = 1;
        textAnchor = [1, 0.5];
      }

      polygon.points.push([(max - value) * offset * widthFactory, size[1] * (i - flag) / POLYGON_NUM]);
      polygon.points.push([(max * offset + value * (1 - offset)) * widthFactory, size[1] * (i - flag) / POLYGON_NUM]);

      if (i - flag + 1 < POLYGON_NUM) {
        var counter = 1;

        while (data[i + counter][0].disabled === true) {
          counter++;
        }

        var nextValue = data[i + counter][0].__valueGetter__();

        polygon.points.push([(max * offset + nextValue * (1 - offset)) * widthFactory, size[1] * (i - flag + 1) / POLYGON_NUM]);
        polygon.points.push([(max - nextValue) * offset * widthFactory, size[1] * (i - flag + 1) / POLYGON_NUM]);
      } else {
        if (pyramid) {
          polygon.points.push([offset * size[0], size[1]]);
        } else {
          polygon.points.push([(max * offset + value * (1 - offset)) * widthFactory, size[1] * (i - flag + 1) / POLYGON_NUM]);
          polygon.points.push([(max - value) * offset * widthFactory, size[1] * (i - flag + 1) / POLYGON_NUM]);
        }
      }

      polygon.opacity = 1;

      if (data[i][0].disabled === true) {
        polygon.points[3] = polygon.points[0];
        polygon.points[2] = polygon.points[1];
        polygon.opacity = 0;
        flag++;
      }

      polygon.labelAttrs = {
        opacity: !data[i][0].disabled ? 1 : 0,
        text: Math.round(100 * value / max) + '%',
        anchor: textAnchor,
        pos: [size[0] * offset + (0.5 - offset) * 10, (i - flag + 0.5) * size[1] / POLYGON_NUM],
        fillColor: '#FFF',
        fontSize: '12px'
      };
      polygons.push(polygon);
    }

    return polygons;
  }

  function computerLegend(data) {
    var flag = 0;

    for (var i = 0, len = data.length; i < len; i++) {
      if (data[i][0].disabled !== true) {
        flag++;
      }
    }

    if (flag === 0) {
      console.warn('data invalid!');
    }

    return flag || 1;
  }

  return funnel;
}