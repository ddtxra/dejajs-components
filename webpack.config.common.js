var webpack = require("webpack");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var path = require("path");

module.exports = {
    entry: {
        bundle: [
            "./src/polyfills.ts",
            "./src/demo-app/main.ts",
            "./send-action.js",
            "./send-action-test.js",
        ],
    },
    module: {
        loaders: [{
            loaders: [
                "awesome-typescript-loader",
                "angular2-template-loader",
                "angular2-router-loader",
            ],
            test: /\.ts$/,
        }, {
            loader: "html-loader",
            query: {
                minimize: false,
            },
            test: /\.html$/,
        }, {
            loader: "file-loader?name=assets/[name].[ext]",
            test: /\.(png|jpe?g|gif|ico)$/,
        }, {
            loaders: ["exports-loader?module.exports.toString()", "css-loader?sourceMap", "sass-loader?sourceMap"],
            test: /\.scss$/,
        }, {
            loader: "url-loader?name=assets/[name].[ext]&limit=10000&mimetype=application/font-woff",
            test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        }, {
            loader: "url-loader?name=assets/[name].[ext]&limit=10000&mimetype=application/font-woff",
            test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        }, {
            loader: "url-loader?name=assets/[name].[ext]&limit=10000&mimetype=application/octet-stream",
            test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        }, {
            loader: "file-loader?name=assets/[name].[ext]",
            test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        }, {
            loader: "url-loader?name=assets/[name].[ext]&limit=10000&mimetype=image/svg+xml",
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        }],
    },
    plugins: [
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            "./src", 
            {}),
        new CopyWebpackPlugin([{
            from: "node_modules/monaco-editor/min/vs",
            to: "vs",
        }]),
        new webpack.ProvidePlugin({ X2JS: "x2js" }),
    ],
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".css", ".html"],
        modules: [ path.join(__dirname, "node_modules") ],
    },
};
