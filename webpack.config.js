const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: './src/minidecaf.ts',
    output: {
        filename: 'dist/minidecaf.bundle.js',
        library: 'MiniDecaf',
        path: path.resolve(__dirname, 'web')
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: "ts-loader"
        }]
    },
    resolve: {
        extensions: [
            '.ts'
        ]
    }
};
