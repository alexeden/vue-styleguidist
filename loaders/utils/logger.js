module.exports = {
	direction: 'down',
	log() {
		const args = [].slice.apply(arguments);
		console.log(...args);
	},
	space() {
		this.log('\n');
		this.log('\n');
		this.log('\n');
		this.log('\n');
		this.log('\n');
	},
	json(json) {
		return JSON.stringify(json, null, 5);
	},
	chainLog(array) {
		const args = [].slice.apply(arguments);
		const listLog = [];
		args.forEach(arg => {
			if (Array.isArray(arg)) {
				listLog.push(...arg);
			} else {
				listLog.push(arg);
			}
		});
		listLog.forEach(arg => {
			this.log(arg);
		});
	},
	arrow(name) {
		try {
			const listArrow = [
				'<--///////////////////////////////////////////////-->',
				'<--///////////////////////////////////////-->',
				'<--///////////////////////////-->',
				'<--/////////////////-->',
				'<--//////////-->',
			];
			if (name) {
				const large = listArrow[0].split('');
				large.splice(large.length / 2 - 1, 0, `    ${name.toUpperCase()}    `);
				listArrow[0] = large.join('');
			}
			if (this.direction === 'down') {
				this.chainLog(listArrow.reverse());
				this.direction = 'up';
			} else {
				this.chainLog(listArrow);
				this.direction = 'down';
			}
		} catch (e) {
			console.log('error', e);
		}
	},
	wrapperLog(name, log) {
		try {
			this.space();
			this.arrow(name);
			this.log(log);
			this.arrow(name);
			this.space();
		} catch (e) {
			console.log('error', e);
		}
	},
};
