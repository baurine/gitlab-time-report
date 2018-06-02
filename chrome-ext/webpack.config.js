const HtmlWebpackPlugin = require('html-webpack-plugin')
const CssExtractWebpackPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    report: './src/js/report.jsx',
    'issue-report': './src/js/issue-report.tsx',
  },
  output: {},
  resolve: {
    extensions: [ '.tsx', '.ts', '.jsx', '.js', '.json' ]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: /src/,
        exclude: /node_modules/
      },
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader", enforce: "pre" },
      {
        test: /\.scss$/,
        use: [CssExtractWebpackPlugin.loader, 'css-loader?sourceMap','postcss-loader?sourceMap', 'sass-loader?sourceMap']
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
      },
      {
        test: /\.(eot|ttf|woff|svg)$/,
        use: 'file-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin('dist'),
    new HtmlWebpackPlugin({
      template: './src/html/template.html',
      filename: 'report.html',
      chunks: ['report'],
      hash: true
    }),
    new CssExtractWebpackPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new CopyWebpackPlugin([
      { from: './public', to: '' }
    ])
  ],
  devServer: {},
  mode: 'development',
  devtool: 'source-map'
}
