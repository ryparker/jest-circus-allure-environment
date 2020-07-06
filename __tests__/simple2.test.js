
/**
 * @my-custom-pragma above-test1
 */
test.skip('adds 1 + 2 to equal 3', () => {
	expect(1 + 2).toBe(3);
});

/**
 * @my-custom-pragma above-test2
 */
test('adds 2 + 2 to equal 4', () => {
	expect(2 + 2).toBe(6);
});

test('adds 3 + 2 to equal 5', () => {
	/**
   * @my-custom-pragma under-test1
	*/
	this.goob.taco;
	expect(3 + 2).toBe(5);
});
