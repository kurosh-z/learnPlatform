/*********************************
 * Environment and imports
 *********************************/
const environment = process.env.NODE_ENV || 'development';
// const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/*********************************
 * Entry
 *********************************/
const entry = {
  app: './src/index',
};

/*********************************
 * Module
 *********************************/
const _module = {
  rules: [
    {
      test: /\.(ts|js)x?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    },
    {
      test: /\.pug$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'pug-html-loader'],
    },

    {
      test: /\.css$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            hmr: process.env.NODE_ENV === 'development',
          },
        },
        // 'style-loader',
        'css-loader',
      ],
    },

    {
      test: /\.(jpg|png)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: './src/img/',
            publicPath: './src/img/',
          },
        },
      ],
    },
    {
      test: /\.(woff(2)?|ttf|eot|svg|blob)(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: './src/fonts/',
          },
        },
      ],
    },
  ],
};

/*********************************
 * Optimization
 *********************************/
const optimization = {
  splitChunks: {
    cacheGroups: {
      commons: {
        test: /[\\/]node_modules[\\/]/,
        name: 'common',
        chunks: 'all',
      },
    },
  },
};

/*********************************
 * Output
 *********************************/
const output = {
  filename: '[name].bundle.js',
  path: __dirname + '/wwwroot/js/',
  // path: path.resolve(__dirname, 'dist'),
  pathinfo: true,
  publicPath: '/',
};

if (environment === 'production') {
  output.filename = '[name].bundle.min.js';
  output.pathinfo = false;
} else if (environment === 'development') {
  output.publicPath = '/js/';
}

/*********************************
 * Plugins
 *********************************/
const plugins = [
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename:
      environment === 'development' ? '[name].css' : '[name].[hash].css',
    chunkFilename:
      environment === 'development' ? '[id].css' : '[id].[hash].css',
  }),
  // new webpack.LoaderOptionsPlugin({
  //   options: {
  //     postcss: [autoprefixer()],
  //   },
  // }),
  // new webpack.DefinePlugin({
  //   'process.env': {
  //     NODE_ENV: JSON.stringify(process.env.NODE_ENV),
  //   },
  // }),

  new HtmlWebpackPlugin({
    template: './src/index.html',
    cspPlugin: {
      enabled: true,
      policy: {
        'base-uri': "'self'",
        'object-src': "'none'",
        'script-src': ["'unsafe-inline'", "'self'", "'unsafe-eval'"],
        'style-src': ["'unsafe-inline'", "'self'", "'unsafe-eval'"],
      },
      hashEnabled: {
        'script-src': true,
        'style-src': true,
      },
      nonceEnabled: {
        'script-src': true,
        'style-src': true,
      },
    },
  }),

  new CspHtmlWebpackPlugin(
    {
      'base-uri': "'self'",
      'object-src': "'none'",
      'script-src': [
        "'unsafe-inline'",
        "'self'",
        "'unsafe-eval' ,'http://ajax.googleapis.com'",
      ],
      'style-src': ["'unsafe-inline'", "'unsafe-eval'", "'unsafe-eval'"],
    },
    {
      enabled: true,
      hashingMethod: 'sha256',
      hashEnabled: {
        'script-src': true,
        'style-src': true,
      },
      nonceEnabled: {
        'script-src': true,
        'style-src': true,
      },
    }
  ),
];

/*********************************
 * Resolve
 *********************************/
const resolve = {
  extensions: ['.ts', '.tsx', '.js'],
};

/*********************************
 * Exports
 *********************************/
module.exports = {
  entry: entry,
  output: output,
  resolve: resolve,
  mode: 'development',
  module: _module,
  optimization: optimization,
  plugins: plugins,
  devServer: {
    contentBase: __dirname + '/dist',
    // compress: true,
    port: 9090,
    historyApiFallback: true,
  },
};
