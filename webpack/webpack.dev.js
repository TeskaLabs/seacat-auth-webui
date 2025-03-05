var webpack = require('webpack');
const path = require('path');
const CWD = process.cwd();
const { merge } = require('webpack-merge'); // used to merge 2 different webpack configs into 1
const os = require('os'); // for obtaining the IP address

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin'); // Load module federation plugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const commonConfig = require('./webpack.common'); // obtain configuration from webpack.common config
const packageJson = require('../package.json');

/*
	TODO: not sure if increasing number of listeners is necessary - this
	is very controversial so handle with care, leaving this commented in
*/
// Increase the maximum number of listeners for EventEmitter
// require('events').EventEmitter.defaultMaxListeners = 25;

// Dev method for getting local IP address of the computer
// It helps with testing on remote localhost (e.g. on different computer)
function getLocalIpAddress() {
	const networkInterfaces = os.networkInterfaces();
	for (const key of Object.keys(networkInterfaces)) {
		for (const interfaceInfo of networkInterfaces[key]) {
			if ((interfaceInfo.family === 'IPv4') && !interfaceInfo.internal) {
				return interfaceInfo.address;
			}
		}
	}
	return 'localhost'; // Default to localhost if no suitable IP address is found
}

const localIpAddress = getLocalIpAddress();

const devConfig = {
	mode: 'development',

	devServer: {
		port: 3031,
		client: {
			overlay: false // Disable full screen overlay in dev mode (errors will be printer only in console)
		},
		proxy: {
			'/api/seacat-auth': {
				target: "http://localhost:3081",
				pathRewrite: {'^/api/seacat-auth' : ''}
			},
		}
	},

	plugins: [
		new ModuleFederationPlugin({
			name: 'seacat_auth_webui',
			shared: {
				// KEEP THIS ALIGNED WITH package.json
				"@babel/core": { singleton: true, requiredVersion: packageJson.dependencies['@babel/core'] },
				"@babel/runtime": { singleton: true, requiredVersion: packageJson.dependencies['@babel/runtime'] },
				"@babel/plugin-transform-runtime": { singleton: true, requiredVersion: packageJson.dependencies['@babel/plugin-transform-runtime'] },
				"@popperjs/core": { singleton: true, requiredVersion: packageJson.dependencies['@popperjs/core'] },
				"axios": { singleton: true, requiredVersion: packageJson.dependencies['axios'] },
				"bootstrap": { singleton: true, requiredVersion: packageJson.dependencies['bootstrap'] },
				"bootstrap-icons": { singleton: true, requiredVersion: packageJson.dependencies['bootstrap-icons'] },
				"date-fns": { singleton: true, requiredVersion: packageJson.dependencies['date-fns'] },
				"i18next": { singleton: true, requiredVersion: packageJson.dependencies['i18next'] },
				"react": { singleton: true, requiredVersion: packageJson.dependencies['react'] },
				"react-dom": { singleton: true, requiredVersion: packageJson.dependencies['react-dom'] },
				"react-i18next": { singleton: true, requiredVersion: packageJson.dependencies['react-i18next'] },
				"react-json-view": { singleton: true, requiredVersion: packageJson.dependencies['react-json-view'] },
				"react-redux": { singleton: true, requiredVersion: packageJson.dependencies['react-redux'] },
				"react-router": { singleton: true, requiredVersion: packageJson.dependencies['react-router'] },
				"react-router-dom": { singleton: true, requiredVersion: packageJson.dependencies['react-router-dom'] },
				"react-simple-tree-menu": { singleton: true, requiredVersion: packageJson.dependencies['react-simple-tree-menu'] },
				"reactstrap": { singleton: true, requiredVersion: packageJson.dependencies['reactstrap'] },
				"redux": { singleton: true, requiredVersion: packageJson.dependencies['redux'] },
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

		new webpack.DefinePlugin({
			'LOCAL_CONFIG': JSON.stringify({  // Inject the local configuration into the ConfigurationService
				"foo": "bar",
			}),
			'disabledMOCK_USERINFO': JSON.stringify({  // Inject mocked UserInfo object, this means the application will NOT require user authorization (remove 'disabled' to enable)
				"username": "johndev",
				"email": "dev@dev.de",
				"phone": "123456789",
				"resources": ["authz:superuser"],
				"roles": ["default/Admin"],
				"sub": "devdb:dev:1abc2def3456",
				"tenants": ["default"]
			})
		}),
	],
}

// Merge common and dev configs
module.exports = merge(commonConfig, devConfig);