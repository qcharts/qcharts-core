import * as spritejs from 'spritejs'
import shapes from '@spritejs/shapes'
import * as core from './index'

import { getGlobal } from '../util'

spritejs.use(shapes)

export const qcharts = {
  ...core
}

const global = getGlobal()
global.qcharts = qcharts

export default qcharts
