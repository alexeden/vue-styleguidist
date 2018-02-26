import getProp from './getProp';

export default function processProps(docFile, component) {
	docFile = docFile.slice();
	let props = component.props;
	const mixins = component.mixins;
	if (mixins) {
		mixins.forEach(mixin => {
			const pMixin = mixin.props;
			if (pMixin) {
				props = Object.assign({}, pMixin, props);
			}
		});
	}
	if (props) {
		const listDocProps = {};
		if (Array.isArray(props)) {
			props.forEach(propName => {
				listDocProps[propName] = getProp();
			});
		} else {
			const listDocParts = [];
			Object.keys(props).forEach(key => {
				let propName = key;
				const docPart = docFile.reverse().filter(comment => {
					const propNameDoc = comment.longname.split('props.')[1];
					return propNameDoc === propName && listDocParts.indexOf(propNameDoc) === -1;
				})[0];
				if (docPart) {
					listDocParts.push(docPart.longname);
				}
				const prop = props[propName];
				const docProp = getProp(prop, docPart);
				if (docProp.tags.model) {
					propName = 'v-model';
				}
				listDocProps[propName] = docProp;
			});
		}
		return listDocProps;
	}
	return [];
}
