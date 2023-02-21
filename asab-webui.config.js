/**
 * Uncomment BundleAnalyzerPlugin and add it to extraPlugins in case
 * you need to measure bundle size but don't push it to master.
 * This plugin is used only in locale dev server or for locale builds.
 *
 * example:
 * 		...
 *
 * 		extraPlugins: [ new BundleAnalyzerPlugin() ],
 *
 * 		...
 * */
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
	extraEntries: { /* add more entries here */ },
	extraOutputs: { /* add more outputs here */ },
	extraPlugins: [ /* add more plugins here */ ],
	extraOptimization: { /* add more optimizations rules here */ },
	extraModule: {
		extraRules: [ /* add more module rules here */ ]
	}
};
