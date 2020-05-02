// const path = require('path');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

// module.exports = {
//   entry: {
//     app: './src/index',
//   },
//   plugins: [
//     // new CleanWebpackPlugin(['dist/*']) for < v2 versions of CleanWebpackPlugin
//     new CleanWebpackPlugin(),
//     new HtmlWebpackPlugin({
//       template: './src/index.html',
//     }),
//   ],
// output: {
//   filename: '[name].bundle.js',
//   path: path.resolve(__dirname, 'dist'),
//   publicPath: '/',
// },
// };

const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // entry: {
  //   main: './src/index.js',
  //   vendor: './src/vendor.js',
  // },
  entry: './src/index.js',

  resolve: { extensions: ['.ts', '.tsx', '.js'] },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(svg|png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]',
            outputPath: './src/imgs',
            publicPath: './src/img/',
          },
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg|blob)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
};
