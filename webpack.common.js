const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackPartialsPlugin = require('html-webpack-partials-plugin')

const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
    index: './src/index.js',
    main: './src/js/main.js',
    clock: './src/js/clock.js',
    manifests: './src/js/manifests.js',
    reflection: './src/js/reflection.js',
    select: './src/js/select.js',
    styleGuide: './src/js/styleGuide.js',
    aboutUs: './src/js/aboutUs.js',
    fluxus: './src/js/fluxus.js',
    filterTags: './src/js/filterTags.js',
    slider: './src/js/slider.js'
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'docs'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.scss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [['postcss-preset-env']]
              }
            }
          }
        ]
      },
      {
        test: /\.html$/i,
        loader: 'html-loader'
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source'
      },
      {
        test: /\.(jpg|png|gif|jpeg|webp|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      },
      {
        test: /\.(ttf|otf|woff2|woff|eot)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    }),

    // Index
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      chunks: ['index', 'main', 'clock']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests.html',
      filename: './manifests.html',
      chunks: ['index', 'main', 'clock']
    }),

    new HtmlWebpackPlugin({
      template: './src/reflection.html',
      filename: './reflection.html',
      chunks: ['reflection']
    }),

    new HtmlWebpackPlugin({
      template: './src/select.html',
      filename: './select.html',
      chunks: ['select', 'filterTags']
    }),

    new HtmlWebpackPlugin({
      template: './src/styleGuide.html',
      filename: './styleGuide.html',
      chunks: ['styleGuide']
    }),

    new HtmlWebpackPlugin({
      template: './src/aboutUs.html',
      filename: './aboutUs.html',
      chunks: ['aboutUs']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/fluxus.html',
      filename: './manifests/fluxus.html',
      chunks: ['index', 'manifests']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/crujok.html',
      filename: './manifests/crujok.html',
      chunks: ['index', 'manifests', 'filterTags', 'slider']
    }),


    
    // Article
    // new HtmlWebpackPlugin({
    //   template: './src/articles/superorganisms/S_Popup.html',
    //   filename: './superorganisms/S_Popup.html'
    // }),

    // Partials
    // new HtmlWebpackPartialsPlugin([
    //   {
    //     path: path.join(__dirname, './src/partials/analytics.html'),
    //     location: 'analytics',
    //     template_filename: '*',
    //     priority: 'replace'
    //   }
    // ])
  ],
  optimization: {
    minimizer: [new CssMinimizerPlugin()]
  }
}