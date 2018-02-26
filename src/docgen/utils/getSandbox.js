import vm from 'vm';
import Vue from 'vue';
import Vuex from 'vuex';

import stateDoc from './stateDoc';

const fs = require('fs');
const path = require('path');
const getRequires = require('./getRequires');
const getParseBabel = require('./getParseBabel');

function clone(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	const copy = obj.constructor();
	for (const attr in obj) {
		if (obj.hasOwnProperty(attr)) { // eslint-disable-line
			copy[attr] = obj[attr];
		}
	}
	return copy;
}

function getMixins(code, file) { // eslint-disable-line
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
		const script = new vm.Script(code, {});

		const requireSanbox = element => {
			console.log(`requireSanbox element: ${element}`);
			if (element === 'vuex') {
				return Vuex;
				// return {
				// 	mapState: function(){},
				// 	mapMutations: function(){},
				// 	mapGetters: function(){},
				// 	mapActions: function(){}
				// }
			}
			if (element === 'vue') {
				return Vue;
				// {
				//   use: function use() {},
				//   component: function component() {},
				//   extended: function extended() {},
				// };
			}
			return () => {};
		};

		requireSanbox.context = () => () => {};

		const sandbox = {
			exports: {},
			module: {
				exports: {},
			},
			require: requireSanbox,
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
		};
		const context = new vm.createContext(sandbox); // eslint-disable-line
		script.runInContext(context);
		const output = sandbox;
		return clone(output);
	} catch (err) {
		throw err;
	}
};

module.exports = function getSandbox(jscodeReqest, file) { // eslint-disable-line
	const babelifycode = getParseBabel(jscodeReqest);
	// console.log(`babelifycode for ${file}: `, babelifycode);
	const component = evalComponentCode(babelifycode.code).exports;
	// const mixins = getMixins(babelifycode.code, file).reverse();
	// component.default.mixins = mixins;
	return component;
};
