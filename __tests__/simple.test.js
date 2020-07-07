function sum(a, b) {
	return a + b;
}

/**
 * @my-custom-pragma above-test1
 */
test('adds 1 + 2 to equal 3', () => {
	expect(sum(1, 2)).toBe(3);
});

/**
 * @my-custom-pragma above-test2
 */
test('Expect an Allure step', () => {
	allure.logStep('step', 'PASSED');
	expect(sum(2, 2)).toBe(4);
});

test('adds 3 + 2 to equal 5', () => {
	/**
   * @my-custom-pragma under-test1
   */
	expect(sum(3, 2)).toBe(5);
});
