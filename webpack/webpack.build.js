const { merge } = require('webpack-merge');
const zlib = require('zlib');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin'); // Load module federation plugin
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const commonConfig = require('./webpack.common'); // obtain configuration from webpack.common config
const packageJson = require('../package.json'); // Obtain package json content

const buildConfig = {
	mode: 'production',
	// Content-hashed filename for cache busting js files
	output: {
		filename: '[name].[contenthash].js',
	},
	plugins: [
		new ModuleFederationPlugin({
			name: 'seacat_auth_webui',
			filename: 'remoteEntry.js',
			exposes: {
				'./main': './src/main.js',
			},
			shared: {
				// KEEP THIS ALIGNED WITH package.json
				'@babel/core': { singleton: true, requiredVersion: packageJson.dependencies['@babel/core'] },
				'@babel/runtime': { singleton: true, requiredVersion: packageJson.dependencies['@babel/runtime'] },
				'@babel/plugin-transform-runtime': { singleton: true, requiredVersion: packageJson.dependencies['@babel/plugin-transform-runtime'] },
				'@popperjs/core': { singleton: true, requiredVersion: packageJson.dependencies['@popperjs/core'] },
				'axios': { singleton: true, requiredVersion: packageJson.dependencies['axios'] },
				'bootstrap': { singleton: true, requiredVersion: packageJson.dependencies['bootstrap'] },
				'bootstrap-icons': { singleton: true, requiredVersion: packageJson.dependencies['bootstrap-icons'] },
				'date-fns': { singleton: true, requiredVersion: packageJson.dependencies['date-fns'] },
				'i18next': { singleton: true, requiredVersion: packageJson.dependencies['i18next'] },
				'react': { singleton: true, requiredVersion: packageJson.dependencies['react'] },
				'react-dom': { singleton: true, requiredVersion: packageJson.dependencies['react-dom'] },
				'react-i18next': { singleton: true, requiredVersion: packageJson.dependencies['react-i18next'] },
				'react-json-view': { singleton: true, requiredVersion: packageJson.dependencies['react-json-view'] },
				'react-redux': { singleton: true, requiredVersion: packageJson.dependencies['react-redux'] },
				'react-router': { singleton: true, requiredVersion: packageJson.dependencies['react-router'] },
				'react-router-dom': { singleton: true, requiredVersion: packageJson.dependencies['react-router-dom'] },
				'react-simple-tree-menu': { singleton: true, requiredVersion: packageJson.dependencies['react-simple-tree-menu'] },
				'reactstrap': { singleton: true, requiredVersion: packageJson.dependencies['reactstrap'] },
				'redux': { singleton: true, requiredVersion: packageJson.dependencies['redux'] },
				"asab_webui_components": {
					singleton: true,
					requiredVersion: packageJson.dependencies['asab_webui_components'],
				},
				"asab_webui_shell": {
					singleton: true,
					requiredVersion: packageJson.dependencies['asab_webui_shell'],
				},
			}
		}),
		new CopyWebpackPlugin({ // Copy files to build folder
			patterns: [
				{ from: 'public/media', to: 'media' },
				{ from: 'public/locales', to: 'locales' },
				{ from: 'CHANGELOG.md', to: 'CHANGELOG.md' },
			],
		}),
		new MiniCssExtractPlugin({ // MiniCssExtractPlugin for cache busting css files
			filename: '[name].[contenthash].css',
			chunkFilename: '[id].[contenthash].css',
		}),
		new CompressionPlugin({  // Pre-compress files so that the NGINX can serve them optimally
			algorithm: 'gzip',
			test: /\.(js|json|css|svg|ttf|eof)$/, // woff is already agressively compressed
		}),
		new CompressionPlugin({
			algorithm: 'brotliCompress',
			test: /\.(js|json|css|svg|ttf|eof)$/, // woff is already agressively compressed
			compressionOptions: {
				params: {
					[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
				},
			},
		})
	],
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin(), // Minimizes output javascript
			new CssMinimizerPlugin(),
		],
	}
}

module.exports = merge(commonConfig, buildConfig);
