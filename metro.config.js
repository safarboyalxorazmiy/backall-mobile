const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'), // Add support for SVG files
  };

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg').concat('db'), // Include .db files and exclude .svg
    sourceExts: [...resolver.sourceExts, 'svg', 'mjs'], // Add .svg and .mjs support
  };

  return config;
})();