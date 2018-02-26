const blockTags = require('../blockTags');
const expect = require('chai').expect;

describe('blockTags', () => {
	it('should return an array', () => {
		expect(blockTags.default).to.be.an('array');
	});
});
