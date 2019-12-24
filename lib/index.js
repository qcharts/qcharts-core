import * as spritejs from 'spritejs';
import shapes from '@spritejs/shapes';
import * as RectSprite from './extend/RectSprite.js';
import { getGlobal } from './util'; // core

import { h, Chart, BasePlugin, BaseVisual, Global, Dataset } from './core'; // visual

import { Pie, ArcPie, Area, Line, Radar, Progress, Bar, Funnel, Scatter, Gauge, RadialBar, PolarBar } from './visuals'; // plugin

import { Legend, Text, Tooltip, Axis } from './plugins'; // Theme

import * as Theme from './themes';
spritejs.use(shapes);
spritejs.use(RectSprite); // 注册样式

Global.registerTheme('default', Theme.light);
Global.registerTheme('dark', Theme.dark);
var version = "0.2.23"; // 开发环境全局挂载，发布环境只挂载JSX解析函数

var qcharts = {
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
  PolarBar,
  Legend,
  Text,
  Tooltip,
  Progress,
  Axis
};
var global = getGlobal();

if (process.env.NODE_ENV === 'development') {
  global.qcharts = qcharts;
} else {
  global.qcharts = {
    h
  };
}

export { version, h, Chart, BasePlugin, BaseVisual, Global, Dataset, Pie, ArcPie, Area, Line, Radar, Bar, Funnel, Scatter, Gauge, RadialBar, Legend, Text, Tooltip, Progress, Axis };
export default qcharts;