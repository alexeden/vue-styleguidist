import blockTags from './blockTags';
import getTag from './getTag';

export default function processTags(docPart, ignoreTags = []) {
	const obj = {};
	if (docPart) {
		blockTags
			.filter(tagName => {
				return ignoreTags.indexOf(tagName) === -1;
			})
			.forEach(tagName => {
				const tag = getTag(tagName, docPart);
				if (tag) {
					obj[tagName] = tag;
				}
			});
	}
	return obj;
}
