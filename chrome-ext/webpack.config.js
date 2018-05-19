const HtmlWebpackPlugin = require('html-webpack-plugin')
const CssExtractWebpackPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: {
    options: './src/js/options.js',
    dashboard: './src/js/dashboard.js',
    timetracker: './src/js/timetracker.js'
  },
  output: {},
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: /src/,
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [CssExtractWebpackPlugin.loader, 'css-loader','postcss-loader', 'sass-loader']
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,           // 小于 8k 的图片自动转成 base64 格式，并且不会存在实体图片，否则调用 file-loader 处理
              outputPath: 'images/', // 图片打包后存放的目录
              name: '[name].[ext]',
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin('dist'),
    new HtmlWebpackPlugin({
      template: './src/html/template.html',
      filename: 'options.html',
      chunks: ['options']
    }),
    new HtmlWebpackPlugin({
      template: './src/html/template.html',
      filename: 'dashboard.html',
      chunks: ['dashboard']
    }),
    new HtmlWebpackPlugin({
      template: './src/html/template.html',
      filename: 'timetracker.html',
      chunks: ['timetracker']
    }),
    new CssExtractWebpackPlugin({
      filename: 'bundle.css',
    })
  ],
  devServer: {},
  mode: 'development'
}
