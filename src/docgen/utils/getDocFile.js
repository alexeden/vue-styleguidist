const jsdoc = require('jsdoc-api');
const getParseBabel = require('./getParseBabel');

export default function getDocFile(jscodeReqest, file) {
	try {
		const babelifycode = getParseBabel(jscodeReqest, '2017', true);
		const docReturn = jsdoc
			.explainSync({
				source: babelifycode.code,
				// configure: path.join(__dirname, '..', '..', 'jsdoc-config.json'),
			})
			.filter(obj => obj.undocumented !== true)
			.map(obj => {
				if (obj.meta) {
					obj.meta.filename = file;
					obj.meta.path = file;
				} else {
					obj.files[0] = file;
				}
				return obj;
			});
		return docReturn;
	} catch (err) {
		const errorMessage = err.toString();
		console.log(`\n${errorMessage}\n`);
		throw new Error(err);
	}
}
