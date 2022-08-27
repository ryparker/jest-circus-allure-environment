function sum(a, b) {
	return a + b;
}

/**
 * @my-custom-pragma above-test1
 */
describe('Docblock', () => {
	test('Ignore Docblock, when located above test', () => {
		expect(sum(1, 2)).toBe(3);
	});

	test('Read Docblock, when located under test', () => {
		/**
		 * @my-custom-pragma under-test1
		 */

		expect(sum(1, 2)).toBe(3);
	});
})