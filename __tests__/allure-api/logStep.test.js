const {Status} = require('../../dist');
describe('logStep', () => {
	test('allure.logStep()', () => {
		allure.logStep('This is a PASSED logStep', Status.PASSED);
		allure.logStep('This is a FAILED logStep', Status.FAILED);
		allure.logStep('This is a BLOCKED logStep', Status.BROKEN);
		allure.logStep('This is a SKIPPED logStep', Status.SKIPPED);
		
		expect(5).toBe(5);
	});
})