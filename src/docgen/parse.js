import fs from 'fs';
import chalk from 'chalk';
import * as utils from './utils';
import stateDoc from './utils/stateDoc';

export const parse = function(file) {
	const source = fs.readFileSync(file, { encoding: 'utf-8' });
	if (source === '') {
		throw new Error('The document is empty');
	}
	stateDoc.file = file;
	stateDoc.saveComponent(source, file);
	const component = utils.getSandbox(stateDoc.jscodeReqest, file).default;
	console.log(chalk.blue(`vue-docgen-api got the sandbox for: ${file}`));
	const vueDoc = utils.getVueDoc(stateDoc, component);
	console.log(chalk.blue('got the vue doc'));
	return vueDoc;
};

export const parseSource = function(source, path) {
	if (source === '') {
		throw new Error('The document is empty');
	}

	stateDoc.file = path;
	stateDoc.saveComponent(source, path);
	const component = utils.getSandbox(stateDoc.jscodeReqest, path).default;
	const vueDoc = utils.getVueDoc(stateDoc, component);
	return vueDoc;
};
