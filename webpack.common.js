/*********************************
 * Entry
 *********************************/
const entry = {
    app: './src/index',
    latex_parser: './src/math-components/parser/index',
}
/*********************************
 * Resolve
 *********************************/
const resolve = {
    extensions: ['.ts', '.tsx', '.js'],
}
/*********************************
 * Module
 *********************************/
const _module = {
    rules: [
        // we use babel-loader to load our jsx and tsx files
        {
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
            },
        },
        {
            test: /\.(jpg|png)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'imgs',
                    },
                },
            ],
        },
        {
            test: /\.pug$/,
            exclude: /node_modules/,
            use: ['raw-loader', 'pug-html-loader'],
        },
        {
            test: /\.(woff(2)?|ttf|eot|svg|blob)(\?v=\d+\.\d+\.\d+)?$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts',
                    },
                },
            ],
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
        },
    ],
}
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
        chunks: 'all',
    },
}
/*********************************
 * Exports
 *********************************/

module.exports = {
    entry: entry,
    resolve: resolve,
    module: _module,
    optimization: optimization,
}
