import {Status} from 'allure-js-commons';

const categories = [
	{
		name: 'Response status failures',
		description: 'Unexpected API response status code.',
		messageRegex: '.*toHaveStatusCode.*',
		matchedStatuses: [
			Status.FAILED
		]
	},
	{
		name: 'Response time failures',
		description: 'API responses that took longer than expected.',
		messageRegex: '.*toHaveResponseTimeBelow.*',
		matchedStatuses: [
			Status.FAILED
		]
	},
	{
		name: 'JSON schema failures',
		description: 'An object did not validate against an expected JSON schema.',
		messageRegex: '.*toMatchSchema.*',
		matchedStatuses: [
			Status.FAILED
		]
	},
	{
		name: 'Property name failures',
		description: 'An object had keys that were not camelCase.',
		messageRegex: '.*toHaveCamelCase.*',
		matchedStatuses: [
			Status.FAILED
		]
	},
	{
		name: 'Snapshot failures',
		description: 'Snapshot does not match the expected snapshot.',
		messageRegex: '.*toMatchSnapshot.*',
		matchedStatuses: [
			Status.FAILED
		]
	},
	{
		name: 'Test timed out',
		description: 'The test exceeded the test threshold.',
		traceRegex: '.*Exceeded timeout.*',
		matchedStatuses: [
			Status.BROKEN
		]
	},
	{
		name: 'Updated JSON schemas',
		description: 'Tests that have updated a JSON schema.',
		messageRegex: '.*updated.*schema.*updated.*',
		matchedStatuses: [
			Status.PASSED
		]
	},
	{
		name: 'Updated snapshots',
		description: 'Tests that have updated a snapshot.',
		messageRegex: '.*updated.*snapshots.*updated.*',
		matchedStatuses: [
			Status.PASSED
		]
	},
	{
		name: 'Skipped tests',
		description: 'Tests that were skipped in this run.',
		matchedStatuses: [
			Status.SKIPPED
		]
	}
];

export default categories;

