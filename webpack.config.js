const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  // ... other webpack config
  plugins: [new BundleAnalyzerPlugin()],
};
