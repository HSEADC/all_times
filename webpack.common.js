const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackPartialsPlugin = require('html-webpack-partials-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'docs'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
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
        test: /\.(sa|sc|c)ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [['postcss-preset-env']]
              }
            }
          },
          'sass-loader'
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
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      },
      {
        test: /\.(ttf|otf|woff|woff2)$/i,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),

    // Главная страница
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html'
    }),

    // Страницы разделов
    new HtmlWebpackPlugin({
      template: './src/manifests.html',
      filename: './manifests.html'
    }),

    new HtmlWebpackPlugin({
      template: './src/aboutUs.html',
      filename: './aboutUs.html'
    }),

    new HtmlWebpackPlugin({
      template: './src/reflection.html',
      filename: './reflection.html'
    }),

    new HtmlWebpackPlugin({
      template: './src/styleGuide.html',
      filename: './styleGuide.html'
    }),

    // Страницы манифестов по дизайну
    new HtmlWebpackPlugin({
      template: './src/design_manifests/ManifesKebudayaan.html',
      filename: './design_manifests/ManifesKebudayaan.html'
    }),

    // Страницы манифестов по культуре
    new HtmlWebpackPlugin({
      template: './src/culture_manifests/fluxusManifest.html',
      filename: './culture_manifests/fluxusManifest.html'
    }),
    
    // Страницы манифестов по архитектуре
    new HtmlWebpackPlugin({
      template: './src/architecture_manifests/futureArchitectMilan.html',
      filename: './architecture_manifests/futureArchitectMilan.html'
    }),

    // Страницы манифестов по живописи
    new HtmlWebpackPlugin({
      template: './src/arts_manifests/obosnovanieIManifestFuturizma.html',
      filename: './arts_manifests/obosnovanieIManifestFuturizma.html'
    }),


    // Internal pages
    // new HtmlWebpackPlugin({
    //   hash: true,
    //   scriptLoading: 'blocking',
    //   template: './src/pages/page.html',
    //   filename: './pages/page.html',
    //   chunks: ['page']
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
