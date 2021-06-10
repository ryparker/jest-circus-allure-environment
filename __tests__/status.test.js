describe('Status', () => {
	test('Expect to pass', () => {
		expect(1 + 2).toBe(3);
	});
	
	test.skip('Expect to skip', () => {
		expect(1 + 2).toBe(3);
	});
	
	test('Expect to fail', () => {
		expect(2 + 2).toBe(6);
	});
	
	test('Expect to break', () => {
		expect(3 + 2).toBe(5);
		foo.bar;
	});
})