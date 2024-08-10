const withTM = require('next-transpile-modules')(['react-syntax-highlighter']);

module.exports = withTM({
  trailingSlash: true,
  output: 'export',
});
