import fs from 'fs';
import * as utils from './utils';
import stateDoc from './utils/stateDoc';

export const parse = function(file) {
	const source = fs.readFileSync(file, { encoding: 'utf-8' });
	if (source === '') {
		throw new Error('The document is empty');
	}
	stateDoc.file = file;
	stateDoc.saveComponent(source, file);
	const sandbox = utils.getSandbox(stateDoc.jscodeReqest, file);
	const defaultExport = sandbox.exports.default;
	const component = typeof defaultExport === 'function' ? defaultExport.options : defaultExport;
	const vueDoc = utils.getVueDoc(stateDoc, component);
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
