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
    slider: './src/js/slider.js',
    filter: './src/js/filter.js',
    saveNote: './src/js/saveNote.js',
    currentT: './src/js/currentTime.js',
    search: './src/js/search.js',
    articles: './src/js/articles.js',
    searchData: './src/js/search-data.js',
    searchVanilla: './src/js/search-vanilla.js',
    react_basics: './src/js/react-basics.jsx',
    searchReact: './src/js/search.jsx',
    menubar: './src/js/menubar.js'
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
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
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
        test: /\.(css | scss)/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false
            }
          },
          'extract-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false
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
    // new MiniCssExtractPlugin({
    //   filename: '[name].[contenthash].css',
    //   chunkFilename: '[id].[contenthash].css'
    // }),

    // Index
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      filename: './index.html',
      chunks: ['index', 'main', 'clock', 'filter']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests.html',
      filename: './manifests.html',
      chunks: ['index', 'clock', 'search']
    }),

    new HtmlWebpackPlugin({
      template: './src/articles.html',
      filename: './articles.html',
      chunks: ['articles']
    }),

    new HtmlWebpackPlugin({
      template: './src/reflection.html',
      filename: './reflection.html',
      chunks: ['reflection', 'index']
    }),

    new HtmlWebpackPlugin({
      template: './src/select.html',
      filename: './select.html',
      chunks: ['select', 'filterTags', 'clock']
    }),

    new HtmlWebpackPlugin({
      template: './src/aboutUs.html',
      filename: './aboutUs.html',
      chunks: ['aboutUs', 'currentT']
    }),

    // ванильный сёрч
    // new HtmlWebpackPlugin({
    //   template: './src/search.html',
    //   filename: './search.html',
    //   chunks: ['searchData', 'searchVanilla']
    // }),

    // реакт сёрч
    new HtmlWebpackPlugin({
      template: './src/search.html',
      filename: './search.html',
      chunks: ['searchData', 'searchVanilla']
    }),

    new HtmlWebpackPlugin({
      template: './src/react-basics.html',
      filename: './react-basics.html',
      chunks: ['react_basics']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/fluxus.html',
      filename: './manifests/fluxus.html',
      chunks: ['index', 'manifests', 'saveNote']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/dadaism.html',
      filename: './manifests/dadaism.html',
      chunks: ['index', 'manifests', 'saveNote']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/oppoyaz.html',
      filename: './manifests/oppoyaz.html',
      chunks: ['index', 'manifests', 'saveNote']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/crujok.html',
      filename: './manifests/crujok.html',
      chunks: ['index', 'manifests', 'slider']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/dogma.html',
      filename: './manifests/dogma.html',
      chunks: ['index', 'manifests', 'saveNote']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/luchi.html',
      filename: './manifests/luchi.html',
      chunks: ['index', 'manifests', 'saveNote']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/surreal.html',
      filename: './manifests/surreal.html',
      chunks: ['index', 'manifests', 'saveNote']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/GB.html',
      filename: './manifests/GB.html',
      chunks: ['index', 'manifests', 'slider']
    }),

    new HtmlWebpackPlugin({
      template: './src/manifests/LightFormMoveSound.html',
      filename: './manifests/LightFormMoveSound.html',
      chunks: ['index', 'manifests', 'saveNote']
    }),

    // Article
    // new HtmlWebpackPlugin({
    //   template: './src/articles/superorganisms/S_Popup.html',
    //   filename: './superorganisms/S_Popup.html'
    // }),

    // Partials
    new HtmlWebpackPartialsPlugin([
      {
        path: path.join(__dirname, './src/partials/analytics.html'),
        location: 'analytics',
        template_filename: '*',
        priority: 'replace'
      }
    ])
  ],
  optimization: {
    minimizer: [new CssMinimizerPlugin()]
  }
}
