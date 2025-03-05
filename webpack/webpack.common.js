const path = require('path');
const CWD = process.cwd();

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	plugins: [
		new HtmlWebpackPlugin({
			template: './public/index.html'
		}),
		new MiniCssExtractPlugin(),
	],
	module: {
		rules: [
			// Tell webpack what to import to project
			{
				test: /\.m?jsx?$/, // .js and .jsx files processed by babel
				exclude: /node_modules/, // exclusion
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-react', '@babel/preset-env'],
						plugins: ['@babel/plugin-transform-runtime'] // enable different features as async/await syntaxes, etc
					}
				}
			},

			// This is to handle CSS and SCSS files
			{
				test: /\.(s[ac]|c)ss$/i,
				use: [
					MiniCssExtractPlugin.loader, //extracs CSS into files
					{
						loader: 'css-loader',
						options: { sourceMap: true }
					},
					{
						loader: 'postcss-loader',
						options: { sourceMap: true }
					},
					{
						loader: 'sass-loader',
						options: {
							implementation: require('sass'),
							sourceMap: true
						}
					}
				],
			}
		]
	},

	resolve: {
		modules: [path.resolve(CWD, 'node_modules'), 'node_modules'],
	}
};
