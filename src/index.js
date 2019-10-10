import * as spritejs from 'spritejs'
import shapes from '@spritejs/shapes'
import { getGlobal } from './util'
// core
import { h, Chart, BasePlugin, BaseVisual, Global, Dataset } from './core'

// visual
import {
  Pie,
  ArcPie,
  Area,
  Line,
  Radar,
  Bar,
  Funnel,
  Scatter,
  Gauge,
  RadialBar
} from './visuals'

// plugin
import { Legend, Text, Tooltip, Axis } from './plugins'

spritejs.use(shapes)

// 提前设置JSX语法解析函数到全局变量上
const global = getGlobal()
global.qcharts = { h }

// version
const version = require('../package.json').version

export {
  version,
  h,
  Chart,
  BasePlugin,
  BaseVisual,
  Global,
  Dataset,
  Pie,
  ArcPie,
  Area,
  Line,
  Radar,
  Bar,
  Funnel,
  Scatter,
  Gauge,
  RadialBar,
  Legend,
  Text,
  Tooltip,
  Axis
}

export default {
  version,
  h,
  Chart,
  BasePlugin,
  BaseVisual,
  Global,
  Dataset,
  Pie,
  ArcPie,
  Area,
  Line,
  Radar,
  Bar,
  Funnel,
  Scatter,
  Gauge,
  RadialBar,
  Legend,
  Text,
  Tooltip,
  Axis
}
