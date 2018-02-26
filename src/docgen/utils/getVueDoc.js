import { IGNORE_DEFAULT, getDescription, getComment, EMPTY } from './variables';
import processTags from './processTags';
import processProps from './processProps';
import processMethods from './processMethods';
import processEvents from './processEvents';

export default function getVueDoc(stateDoc, component) {
	let docJsFile = stateDoc.getDocJs();
	const displayName = component.name;
	let docComponent;
	if (!component.name || component.name === '') {
		throw new Error("The component has no name, add 'name' property on the Vue component");
	}

	if (docJsFile) {
		docJsFile = docJsFile.filter(comment => comment.kind !== 'package');
		docComponent = docJsFile.filter(comment => comment.longname === 'module.exports')[0];
	} else {
		docJsFile = [];
		docComponent = false;
	}
	let description = EMPTY;
	let comment = EMPTY;
	let tags = {};
	if (docComponent) {
		description = getDescription(docComponent);
		comment = getComment(docComponent);
		tags = processTags(docComponent, IGNORE_DEFAULT);
	}
	const props = processProps(docJsFile, component);
	console.log('got the props: ', props);
	const methods = processMethods(docJsFile, component);
	console.log('got the methods: ', methods);
	const events = processEvents(docJsFile, component);
	console.log('got the events: ', events);

	return {
		description,
		methods,
		displayName,
		props,
		comment,
		tags,
		events,
		slots: stateDoc.slots,
	};
}
