module.exports = {
	app: {
	},
	webpackDevServer: {
		port: 3000,
		server: 'https',
		proxy: {
			'/api/seacat_auth': {
				target: "http://localhost:8081",
				pathRewrite: {'^/api/seacat_auth' : ''}
			},
			'/api/openidconnect': {
				target: "http://127.0.0.1:8081",
				pathRewrite: {'^/api' : ''},
			}
		}
	}
}
