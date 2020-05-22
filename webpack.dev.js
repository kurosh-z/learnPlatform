const path = require('path')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.common')

/*********************************
 * Plugins
 *********************************/
const plugins = [
    new HtmlWebpackPlugin({
        template: './src/index.html',
    }),
]
/*********************************
 * Output
 *********************************/
const output = {
    path: path.join(__dirname, '/build'),
    filename: '[name].bundle.js',
    pathinfo: true,
    publicPath: '/',

    //   publicPath: path.resolve(__dirname, 'dist'),
}
/*********************************
 * devServer
 *********************************/
const devServer = {
    contentBase: path.join(__dirname, 'dist'),
    // compress: true,
    port: 9090,
    historyApiFallback: true,
}

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    output: output,

    plugins: plugins,
    devServer: devServer,
})
