'use strict';

const fs = require('fs');
const path = require('path');
const generate = require('escodegen').generate;
const toAst = require('to-ast');
const getExamples = require('./utils/getExamples');
const requireIt = require('./utils/requireIt');
const getComponentVueDoc = require('./utils/getComponentVueDoc');
const vueDocs = require('../lib/docgen/main');

const examplesLoader = path.resolve(__dirname, './examples-loader.js');

/* eslint-disable no-console */
module.exports = function(source) {
	const file = this.request.split('!').pop();
	const config = this._styleguidist;
	let componentInfo = {};

	// Setup Webpack context dependencies to enable hot reload when adding new files or updating any of component dependencies
	if (config.contextDependencies) {
		config.contextDependencies.forEach(dir => this.addContextDependency(dir));
	}

	const propsParser = config.propsParser || (file => vueDocs.parse(file));

	try {
		componentInfo = propsParser(file, source);
	} catch (err) {
		/* istanbul ignore next */
		const componentPath = path.relative(process.cwd(), file);
		const message =
			`Cannot parse ${componentPath}: ${err}\n\n` +
			'It usually means that vue-docgen-api does not understand your source code or when using third-party libraries, try to file an issue here:\n' +
			'https://github.com/vue-styleguidist/vue-docgen-api/issues';
		console.log(`\n${message}\n`);
	}

	if (componentInfo.methods) {
		componentInfo.methods.map(method => {
			method.tags.public = [
				{
					title: 'public',
					description: null,
					type: null,
				},
			];
			const params = method.tags.params;
			if (params) {
				method.tags.param = params;
				delete method.tags.params;
			}
			return method;
		});
	}
	const componentVueDoc = getComponentVueDoc(source, file);
	if (componentVueDoc) {
		componentInfo.example = requireIt(`!!${examplesLoader}!${file}`);
	} else if (componentInfo.tags) {
		const examples = componentInfo.tags.examples;
		if (examples) {
			const examplePath = examples[examples.length - 1].description;
			componentInfo.example = requireIt(`!!${examplesLoader}!${examplePath}`);
		}
	}
	if (componentInfo.props) {
		const props = componentInfo.props;
		Object.keys(props).forEach(key => {
			if (props[key].tags && props[key].tags.ignore) {
				delete props[key];
			}
		});
	}
	const examplesFile = config.getExampleFilename(file);
	componentInfo.examples = getExamples(
		examplesFile,
		componentInfo.displayName,
		config.defaultExample
	);

	fs.writeFileSync('component-info.json', JSON.stringify(componentInfo, null, 2));
	const ast = toAst(componentInfo);
	fs.writeFileSync('component-info-ast.json', JSON.stringify(ast, null, 2));
	const generated = generate(ast);
	fs.writeFileSync('component-info-generated.js', generated);

	console.log('vueDoc-loader is returning');
	return `
		if (module.hot) {
			module.hot.accept([])
		}

		module.exports = ${generated}
	`;
};
