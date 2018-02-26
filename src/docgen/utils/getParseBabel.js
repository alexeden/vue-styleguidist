const babel = require('@babel/core');

module.exports = function getParseBabel(code, transformConfig = {}) { // eslint-disable-line
	return babel.transform(code, {
		ast: false,
		babelrc: false,
		sourceType: 'module',
		presets: ['@babel/preset-typescript', '@babel/preset-env'],
		...transformConfig,
	});
};
