const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // Enable the use of react-native-svg-transformer for handling SVG files
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  // Modify resolver settings to handle .svg files correctly
  config.resolver = {
    ...resolver,
    // Exclude .svg files from assetExts (so they are not treated as static assets)
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg').concat('db'), // Add .db to asset extensions
    // Ensure that .svg files and .mjs files are handled by the bundler
    sourceExts: [...resolver.sourceExts, 'svg', 'mjs'], 
  };

  return config;
})();