const path = require('path')
const common = require('./webpack.common')
const merge = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

/*********************************
 * Output
 *********************************/
const output = {
    path: path.join(__dirname, '/build'),
    filename: '[name].[contentHash].bundle.js',
    publicPath: path.resolve(__dirname, 'build'),
}
/*********************************
 * Optimization
 *********************************/
const optimization = {
    minimizer: [
        new OptimizeCssAssetsPlugin(),
        new TerserPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            minify: {
                emoveAttributeQuotes: true,
                collapseWhitespace: true,
                removeComments: true,
            },
        }),
    ],
}
/*********************************
 * Plugins
 *********************************/
const plugins = [
    new MiniCssExtractPlugin({ filename: '[name].[contentHash].css' }),
    new CleanWebpackPlugin(),
]

module.exports = merge(common, {
    mode: 'production',
    plugins: plugins,
    optimization: optimization,
    output: output,
})
