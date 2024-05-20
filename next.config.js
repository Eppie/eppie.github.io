const withTM = require('next-transpile-modules')(['react-syntax-highlighter']); // Add the package you need to transpile
const isProd = process.env.NODE_ENV === 'production';

module.exports = withTM({
  basePath: isProd ? '/eppie.github.io' : '',
  assetPrefix: isProd ? 'https://eppie.github.io/eppie.github.io' : '',
  trailingSlash: true,
  output: 'export',
});
