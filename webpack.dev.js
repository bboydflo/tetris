
const { merge } = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common.config, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: common.dist,
        hot: true
    },
})
