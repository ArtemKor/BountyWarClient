const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {

  devServer: {
    historyApiFallback: true,
    port: 3000,
    // proxy: {
    //   '^/api/*': {
    //     target: 'http://localhost:8080/api/',
    //     secure: false
    //   }
    // }
  },

  entry: ['./src/app/app.ts'],
  mode: "development", // "production" | "development" | "none"  // Chosen mode tells webpack to use its built-in optimizations accordingly.

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },

  // Currently we need to add '.ts' to the resolve.extensions array.
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    moduleExtensions: ['node_modules'],
  },

  // Source maps support ('inline-source-map' also works)
  devtool: 'source-map',

  // Add the loader for .ts files.
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'awesome-typescript-loader',
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin('dist', {} ),
    new CopyWebpackPlugin([
      { from: 'src/assets', to: 'assets' }
    ]),
    new HtmlWebpackPlugin({
      title: 'PX_ts',
      template: './src/index.html',
    }),
  ],

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      maxInitialRequests: Infinity,
      minSize: 0,
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
        },
        modules: {
          test: /\.module.ts?$/,
          name(module) {
            let packageName = module.context.substr(module.context.search(/[\\/][a-z0-9.\-_]+.js/) + 1, module.context.length - 1);
            return `module.${packageName}`;
          },
        }
      },
    },
  },

  serve: { //object
    port: 1339,
    content: './dist',
    // ...
  },

};
