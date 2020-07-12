import JestAllureInterface from './jest-allure-interface';
import type * as jest from '@jest/types';
import stripAnsi = require('strip-ansi');
import _ = require('lodash');
import prettier = require('prettier/standalone');
import parser = require('prettier/parser-typescript');
import {
	AllureGroup,
	AllureRuntime,
	AllureStep,
	AllureTest,
	ContentType,
	ExecutableItemWrapper,
	LabelName,
	Stage,
	Status,
	StatusDetails
} from 'allure-js-commons';
import {createHash} from 'crypto';
// Import AnsiUp from 'ansi_up';
// const ansiUp = new AnsiUp();

export default class AllureReporter {
	public currentExecutable: ExecutableItemWrapper | null = null;
	private readonly suites: AllureGroup[] = [];
	private readonly steps: AllureStep[] = [];
	private runningTest: AllureTest | null = null;
	private readonly jiraUrl: string | undefined;

	constructor(
		private readonly allureRuntime: AllureRuntime,
		jiraUrl?: string,
		environmentInfo?: Record<string, string>) {
		this.jiraUrl = jiraUrl;

		if (environmentInfo) {
			this.allureRuntime.writeEnvironmentInfo(environmentInfo);
		}

		this.allureRuntime.writeCategoriesDefinitions([
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
				name: 'Snapshot failures',
				description: 'Snapshot does not match the expected snapshot.',
				messageRegex: '.*toMatchSnapshot.*',
				matchedStatuses: [
					Status.FAILED
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
		]);
	}

	public getImplementation(): JestAllureInterface {
		return new JestAllureInterface(this, this.allureRuntime, this.jiraUrl);
	}

	get currentSuite(): AllureGroup | null {
		return this.suites.length > 0 ? this.suites[this.suites.length - 1] : null;
	}

	get currentStep(): AllureStep | null {
		return this.steps.length > 0 ? this.steps[this.steps.length - 1] : null;
	}

	get currentTest(): AllureTest | null {
		return this.runningTest;
	}

	set currentTest(test: AllureTest | null) {
		this.runningTest = test;
	}

	public environmentInfo(info?: Record<string, string>) {
		return this.allureRuntime.writeEnvironmentInfo(info);
	}

	public startSuite(suiteName: string): void {
		const scope: AllureGroup | AllureRuntime =
      this.currentSuite ?? this.allureRuntime;
		const suite: AllureGroup = scope.startGroup(suiteName || 'Global');
		this.pushSuite(suite);
	}

	public endSuite(): void {
		if (this.currentSuite !== null) {
			if (this.currentStep !== null) {
				this.currentStep.endStep();
			}

			this.currentSuite.endGroup();
			this.popSuite();
		}
	}

	public startHook(type: jest.Circus.HookType): void {
		const suite: AllureGroup | null = this.currentSuite;

		if (suite && type && type.includes('before')) {
			this.currentExecutable = suite.addBefore();
		} else if (suite && type && type.includes('after')) {
			this.currentExecutable = suite.addAfter();
		}
	}

	public endHook(error?: Error): void {
		if (this.currentExecutable) {
			this.currentExecutable.stage = Stage.FINISHED;

			if (error) {
				// Console.log('endHook -> handleError');
				const {status, message, trace} = this.handleError(error);

				this.currentExecutable.status = status;

				this.currentExecutable.statusDetails = {message, trace};
			} else {
				this.currentExecutable.status = Status.PASSED;
			}
		}
	}

	public startCase(test: jest.Circus.TestEntry, state: jest.Circus.State, testPath: string): void {
		if (this.currentSuite === null) {
			throw new Error('No active suite');
		}

		this.currentTest = this.currentSuite.startTest(test.name);
		this.currentTest.fullName = test.name;
		this.currentTest.historyId = createHash('md5')
			.update(testPath + '.' + test.name)
			.digest('hex');
		this.currentTest.stage = Stage.RUNNING;

		const testFunc = test.fn ? prettier.format(test.fn.toString(), {parser: 'typescript', plugins: [parser]}) : 'Error parsing function';

		this.currentTest.description = `### Test\n\`\`\`typescript\n${testFunc}\n\`\`\`\n`;

		if (state.parentProcess?.env?.JEST_WORKER_ID) {
			this.currentTest.addLabel(LabelName.THREAD, state.parentProcess.env.JEST_WORKER_ID);
		}

		const pathsArray = testPath.split('/');

		const [parentSuite, suite, ...subSuites] = pathsArray;

		if (parentSuite) {
			this.currentTest.addLabel(LabelName.PARENT_SUITE, parentSuite);
			this.currentTest.addLabel(LabelName.PACKAGE, parentSuite);
		}

		if (suite) {
			this.currentTest.addLabel(LabelName.SUITE, suite);
		}

		if (subSuites.length > 0) {
			this.currentTest.addLabel(LabelName.SUB_SUITE, subSuites.join(' > '));
		}
	}

	public passTestCase(test: jest.Circus.TestEntry, state: jest.Circus.State, testPath: string): void {
		if (this.currentTest === null) {
			this.startCase(test, state, testPath);
		}

		this.endTest(Status.PASSED);
	}

	public pendingTestCase(test: jest.Circus.TestEntry, state: jest.Circus.State, testPath: string): void {
		this.startCase(test, state, testPath);
		this.endTest(Status.SKIPPED, {message: `Test is marked: "${test.mode as string}"`});
	}

	public failTestCase(
		test: jest.Circus.TestEntry,
		state: jest.Circus.State,
		testPath: string,
		error: Error | any
	): void {
		if (this.currentTest === null) {
			this.startCase(test, state, testPath);
		} else {
			const latestStatus = this.currentTest.status;

			// If test already has a failed state, we should not overwrite it
			if (latestStatus === Status.FAILED || latestStatus === Status.BROKEN) {
				return;
			}
		}

		const {status, message, trace} = this.handleError(error);

		this.endTest(status, {message, trace});
	}

	public writeAttachment(content: Buffer | string, type: ContentType): string {
		return this.allureRuntime.writeAttachment(content, type);
	}

	public pushStep(step: AllureStep): void {
		this.steps.push(step);
	}

	public popStep(): void {
		this.steps.pop();
	}

	public pushSuite(suite: AllureGroup): void {
		this.suites.push(suite);
	}

	public popSuite(): void {
		this.suites.pop();
	}

	private endTest(status: Status, details?: StatusDetails): void {
		if (this.currentTest === null) {
			throw new Error('endTest while no test is running');
		}

		if (details) {
			this.currentTest.statusDetails = details;
		}

		this.currentTest.status = status;
		this.currentTest.stage = Stage.FINISHED;
		this.currentTest.endTest();
		this.currentTest = null;
	}

	private handleError(error: Error | any) {
		if (Array.isArray(error)) {
			// Test_done event (consistently?) sends an array of error arrays.
			error = _.flattenDeep(error)[0];
		}

		let status = Status.BROKEN;
		let message = error.name;
		let trace = error.message;

		if (error.matcherResult) {
			status = Status.FAILED;
			const matcherMessage = error.matcherResult.message();

			const [line1, line2, ...restOfMessage] = matcherMessage.split('\n');

			message = [line1, line2].join('\n');
			trace = restOfMessage.join('\n');
		}

		if (!trace) {
			trace = error.stack;
		}

		if (!message && trace) {
			message = trace;
			trace = error.stack?.replace(message, 'No stack trace provided');
		}

		if (trace?.includes(message)) {
			trace = trace?.replace(message, '');
		}

		if (!message) {
			message = 'Unformatted error. Expand for more details.';
			trace = error;
		}

		return {
			status,
			message: stripAnsi(message),
			trace: stripAnsi(trace)
		};
	}

	private collectTestParentNames(
		parent: jest.Circus.TestEntry | jest.Circus.DescribeBlock | undefined
	) {
		const testPath = [];
		do {
			testPath.unshift(parent?.name);
		} while ((parent = parent?.parent));

		return testPath;
	}
}
