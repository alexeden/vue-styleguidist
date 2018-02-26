import vm from 'vm';
import Vue from 'vue';
import Vuex from 'vuex';
import stateDoc from './stateDoc';

const fs = require('fs');
const path = require('path');
const getRequires = require('./getRequires');
const getParseBabel = require('./getParseBabel');

function getMixins(code, file) {
	try {
		const requiresFromComponent = getRequires(code);
		const output = [];
		Object.keys(requiresFromComponent).forEach(reqFromComponent => {
			const tempRequire = reqFromComponent.split('/');
			if (tempRequire[0] === '.' || tempRequire[0] === '..') {
				const folderFile = path.dirname(file);
				const pathRequire = path.join(path.normalize(folderFile), reqFromComponent) + '.js';
				if (fs.existsSync(pathRequire)) {
					const source = fs.readFileSync(pathRequire, { encoding: 'utf-8' });
					stateDoc.saveMixin(source, pathRequire);
					if (stateDoc.isMixin()) {
						const babelifycode = getParseBabel(source);
						const mixin = evalComponentCode(babelifycode.code);
						if (Object.keys(mixin.exports).length === 0) {
							mixin.exports.default = mixin.module.exports;
						}
						if (mixin.exports.default) {
							output.push(mixin.exports.default);
						}
					}
				}
			}
		});
		return output;
	} catch (err) {
		throw err;
	}
}

const evalComponentCode = code => {
	try {
		const requireSandbox = element => {
			if (element === 'vuex') {
				return Vuex;
			}
			if (element === 'vue') {
				return Vue;
			}
			return () => {};
		};

		requireSandbox.context = () => () => {};

		const context = vm.createContext({
			exports: {},
			module: {
				exports: {},
			},
			require: requireSandbox,
			document: {},
			window: {
				location: {},
			},
			alert() {},
			confirm() {},
			console: {
				log() {},
				debug() {},
			},
			sessionStorage: {
				getItem() {},
				setItem() {},
				removeItem() {},
			},
			localStorage: {
				getItem() {},
				setItem() {},
				removeItem() {},
			},
		});
		vm.runInContext(code, context);
		return context;
	} catch (err) {
		throw err;
	}
};

module.exports = function getSandbox(jscodeReqest, file) {
	const babelifycode = getParseBabel(jscodeReqest);
	const mixins = getMixins(babelifycode.code, file).reverse();
	const component = evalComponentCode(babelifycode.code);
	component.exports.default.mixins = mixins;
	return component;
};
