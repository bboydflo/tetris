const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env) => {
    console.log(env)
    return {
        mode: env.mode || 'development',
        entry: './src/index.js',
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        'style-loader',
                        'css-loader',
                    ],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.js$/,
                    loader: 'esbuild-loader',
                    options: {
                        loader: 'jsx',  // Remove this if you're not using JSX
                        target: 'es2020'  // Syntax to compile to (see options below for possible values)
                    }
                },
            ],
        },
        devtool: 'inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, 'dist')
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Tetris',
                template: './index.html'
            }),
        ],
        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true
        },
    }
}
