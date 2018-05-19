const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    options: './src/js/options.js',
    dashboard: './src/js/dashboard.js',
    timetracker: './src/js/timetracker.js'
  },
  output: {},
  module: {},
  plugins: [
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
    })
  ],
  devServer: {},
  mode: 'development'
}
