
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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

const config = {
	extraEntries: { /* add more entries here */ },
	extraOutputs: { /* add more outputs here */ },
	extraPlugins: [ /* add more plugins here */ ],
	extraOptimization: { /* add more optimizations rules here */ },
	extraModule: {
		extraRules: [ /* add more module rules here */ ]
	}
};


const configWithTimeMeasures = new SpeedMeasurePlugin().wrap(config);
configWithTimeMeasures.plugins.push(new MiniCssExtractPlugin({}));

module.exports = configWithTimeMeasures;
