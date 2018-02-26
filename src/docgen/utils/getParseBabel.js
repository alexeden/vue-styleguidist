const babel = require('@babel/core');

module.exports = function getParseBabel(code, preset = '2015', comments = false) { // eslint-disable-line
	// let presets;
	//
	// if (preset === '2017') {
	// 	presets = ['babel-preset-es2017', 'babel-preset-stage-3'];
	// } else {
	// 	presets = ['babel-preset-es2015', 'babel-preset-stage-2'];
	// }

	// const options = {
	// 	ast: false,
	// 	babelrc: false,
	// 	comments,
	// 	presets,
	// };
	// '@babel/preset-typescript',
	// 	'@babel/preset-env'
	const result = babel.transform(code, {
		ast: false,
		babelrc: false,
		sourceType: 'module',
		presets: ['@babel/preset-typescript', '@babel/preset-env'],
	});

	// console.log(`result: `, result);
	return result;
};
