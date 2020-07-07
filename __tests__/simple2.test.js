
/**
 * @my-custom-pragma above-test1
 */
test.skip('Expect to skip', () => {
	expect(1 + 2).toBe(3);
});

/**
 * @my-custom-pragma above-test2
 */
test('Expect to fail', () => {
	expect(2 + 2).toBe(6);
});

test('Expect to break', () => {
	/**
   * @my-custom-pragma under-test1
	*/

	expect(3 + 2).toBe(5);
	foo.bar;
});
