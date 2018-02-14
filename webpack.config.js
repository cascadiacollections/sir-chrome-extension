module.exports = {
    devtool: 'inline-source-map',
    entry: "./app/scripts/background.ts",
    output: {
        filename: "./app/dist/background.js"
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    }
}