// babel编译配置，导出es module
const babelDev = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true // 使用es 模块
        },
        modules: false // 不将 es 模块转为其他模块, 保留 export import
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties', // jsx 中需要，删除报错
    [
      '@babel/plugin-transform-react-jsx',
      {
        pragma: 'qcharts.h'
      }
    ],
    'inline-package-json'
  ]
}

// 调试，打包配置
const chartProd = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
        }
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-export-default-from',
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: false
      }
    ],
    [
      '@babel/plugin-transform-react-jsx',
      {
        pragma: 'qcharts.h'
      }
    ],
    'inline-package-json'
  ]
}

module.exports = function(api) {
  const setting = api.env(['babel']) ? babelDev : chartProd
  return {
    sourceType: 'unambiguous', // 自动推断编译的模块类型(cjs,es6)
    ignore: [/@babel[/\\]runtime/], // 忽略 @babel/runtime
    ...setting
  }
}
