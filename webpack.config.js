const path = require('path');
const webpack = require('webpack')

module.exports = {
    entry: './src/cli.js',
    target: 'node',
    mode: 'production',
    output: {
        filename: 'coverage-inspector.js',
        path: path.resolve(__dirname, 'bin'),
    },
    plugins: [
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    ]
};
