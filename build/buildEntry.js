const fs = require('fs')
const path = require('path')
const dirs = fs.readdirSync(path.join(__dirname, '../src/visuals'))

const entry = {
  qcharts: path.join(__dirname, '../src/core/qcharts.js'),
  Legend: path.join(__dirname, '../src/plugins/Legend.js'),
  Axis: path.join(__dirname, '../src/plugins/Axis/index.js'),
  Tooltip: path.join(__dirname, '../src/plugins/Tooltip.js'),
  Text: path.join(__dirname, '../src/plugins/Text.js')
}

// visuals
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, `../src/visuals/${dir}`)
  if (fs.statSync(dirPath).isDirectory()) {
    entry[dir] = dirPath
  }
})

module.exports = entry
