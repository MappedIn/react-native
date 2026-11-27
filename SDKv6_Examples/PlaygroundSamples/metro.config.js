const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Mappedin 3D assets and MVF map files ship as bundle assets.
config.resolver.assetExts.push('glb', 'gltf', 'zip');

module.exports = config;
