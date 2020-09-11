const {Severity} = require('../../dist');

test('.severity = BLOCKER', () => {
	allure.severity(Severity.BLOCKER);

	expect(1 + 1).toBe(2);
});

test('.severity = CRITICAL', () => {
	allure.severity(Severity.CRITICAL);

	expect(1 + 1).toBe(2);
});

test('.severity = MINOR', () => {
	allure.severity(Severity.MINOR);

	expect(1 + 1).toBe(2);
});

test('.severity = NORMAL', () => {
	allure.severity(Severity.NORMAL);

	expect(1 + 1).toBe(2);
});

test('.severity = TRIVIAL', () => {
	allure.severity(Severity.TRIVIAL);

	expect(1 + 1).toBe(2);
});

