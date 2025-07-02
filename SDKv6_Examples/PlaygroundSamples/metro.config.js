const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add .glb files to the asset extensions
config.resolver.assetExts.push("glb");

module.exports = config;
