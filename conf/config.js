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
			}
		}
	}
}
