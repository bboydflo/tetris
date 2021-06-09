const { ESBuildMinifyPlugin } = require('esbuild-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { merge } = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common.config, {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    plugins: [new MiniCssExtractPlugin()],
    optimization: {
        minimizer: [
            new ESBuildMinifyPlugin({
                target: 'es2020'  // Syntax to compile to (see options below for possible values)
            })
        ]
    },
})
