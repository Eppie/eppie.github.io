const withTM = require('next-transpile-modules')(['react-syntax-highlighter']);
// const isProd = process.env.NODE_ENV === 'production';

module.exports = withTM({
  // basePath: isProd ? '/eppie.github.io' : '',
  trailingSlash: true,
  output: 'export',
});
