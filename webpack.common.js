const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const dist = path.resolve(__dirname, 'dist')

module.exports = {
    config: {
        entry: './src/index.tsx',
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
                    test: /\.tsx?$/,
                    loader: 'esbuild-loader',
                    options: {
                        loader: 'tsx',  // Remove this if you're not using JSX
                        target: 'es2020'  // Syntax to compile to (see options below for possible values)
                    }
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            alias: {
                'react': 'preact/compat',
                'react-dom/test-utils': 'preact/test-utils',
                'react-dom': 'preact/compat',
                // Must be below test-utils
            },
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: 'src/assets/favicons', to: 'favicons' }
                ],
            }),
            new HtmlWebpackPlugin({
                title: 'Tetris',
                template: './index.html'
            }),
        ],
        output: {
            filename: 'main.js',
            path: dist,
            clean: true
        }
    },
    dist
}
