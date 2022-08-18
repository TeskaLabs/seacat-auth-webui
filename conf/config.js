module.exports = {
	app: {
	},
	webpackDevServer: {
		port: 3000,
		https: true,
		proxy: {
			'/api/seacat_auth': {
				target: "http://localhost:8083",
				pathRewrite: {'^/api/seacat_auth' : ''}
			},
			'/api': {
				target: "http://127.0.0.1:8083",
				pathRewrite: {'^/api' : ''},
			}
		}
	}
}
