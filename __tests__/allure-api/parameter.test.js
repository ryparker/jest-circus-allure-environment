describe('Parameter', () => {
	test('allure.parameter()', () => {
		allure.parameter('Argument 1', 'exampleValue');
		
		expect(5).toBe(5);
	});
})
