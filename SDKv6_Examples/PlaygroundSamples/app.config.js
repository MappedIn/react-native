// Identity is driven from package.json so this file stays identical in intent
// between the SDK repo and the public repo. Only the dependency spec differs.
const pkg = require('./package.json');

module.exports = {
	expo: {
		name: 'Mappedin Samples',
		slug: 'mappedin-playground-samples',
		version: pkg.version,
		orientation: 'portrait',
		scheme: 'mappedinsamples',
		userInterfaceStyle: 'automatic',
		newArchEnabled: true,
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.mappedin.playgroundsamples',
		},
		android: {
			edgeToEdgeEnabled: true,
			package: 'com.mappedin.playgroundsamples',
		},
		web: {
			bundler: 'metro',
			output: 'single',
		},
		plugins: ['expo-router', 'expo-splash-screen'],
		experiments: {
			typedRoutes: true,
		},
	},
};
