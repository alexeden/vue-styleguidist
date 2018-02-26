import parser from './parser';
import getComponentModuleJSCode from './getComponentModuleJSCode';
import getSlots from './getSlots';
import getDocFile from './getDocFile';

class StateDoc {
	constructor() {
		this.file = '';
		this.docComponent = {};
		this.sourceComponent = '';
		this.docMixins = [];
		this.jscodeReqest = '';
		this.docTemp = '';
		this.slots = [];
	}

	isMainComponent(file) {
		return file === this.file;
	}

	saveComponent(source, file) {
		if (this.isMainComponent(file) && this.sourceComponent !== source) {
			const parts = parser(source, 'name');
			this.slots = getSlots(parts);
			this.jscodeReqest = getComponentModuleJSCode(parts, source, file);
			const doc = this.getDocFile(this.jscodeReqest, file);
			this.docComponent = doc;
		}
	}

	getDocFile(source, file) {
		this.docTemp = getDocFile(source, file);
		return this.docTemp;
	}

	isMixin(doc) {
		doc = doc || this.docTemp;
		return doc.some(docPart => {
			return docPart.kind === 'mixin';
		});
	}

	getDocJs() {
		const docMixins = [...this.docMixins].filter(function(docPart) {
			return docPart.kind !== 'package';
		});
		return this.docComponent.concat(docMixins);
	}

	saveMixin(source, file) {
		let doc = this.getDocFile(source, file);
		if (this.isMixin(doc)) {
			doc = doc
				.map(docPart => {
					const longnameSplit = docPart.longname.split('.');
					if (longnameSplit[0] === 'default') {
						longnameSplit[0] = 'module.exports';
					}
					docPart.longname = longnameSplit.join('.');
					return docPart;
				})
				.filter(docPart => {
					return docPart.longname !== 'module.exports';
				});
			let index;
			this.docMixins.forEach((docMixin, id) => {
				const packages = docMixin.filter(function(docPart) {
					return docPart.kind === 'package';
				})[0];
				if (packages && packages.files[0] === file) {
					index = id;
				}
			});
			if (index) {
				this.docMixins[index] = doc;
			} else {
				this.docMixins.push(doc);
			}
		}
	}
}

export default new StateDoc();
