module.exports = {
	app: {
	},
	webpackDevServer: {
		port: 3000,
		https: true,
		proxy: {
			'/api/seacat_auth': {
				target: "http://localhost:8082",
				pathRewrite: {'^/api/seacat_auth' : ''}
			},
			'/api/openidconnect': {
				target: "http://127.0.0.1:8082",
				pathRewrite: {'^/api' : ''},
			}
		}
	}
}
