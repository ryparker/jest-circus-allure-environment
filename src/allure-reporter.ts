import type * as jest from '@jest/types';

import {
	AllureGroup,
	AllureRuntime,
	AllureStep,
	AllureTest,
	Category,
	ContentType,
	ExecutableItemWrapper,
	LabelName,
	LinkType,
	Stage,
	Status,
	StatusDetails
} from 'allure-js-commons';

import JestAllureInterface from './jest-allure-interface';
import {createHash} from 'crypto';
import defaultCategoryDefinitions from './category-definitions';
import {parseWithComments} from 'jest-docblock';

import stripAnsi = require('strip-ansi');
import _ = require('lodash');
import prettier = require('prettier/standalone');
import parser = require('prettier/parser-typescript');

export default class AllureReporter {
	public currentExecutable: ExecutableItemWrapper | null = null;
	private runningTest: AllureTest | null = null;
	private readonly allureRuntime: AllureRuntime;
	private readonly suites: AllureGroup[] = [];
	private readonly steps: AllureStep[] = [];
	private readonly jiraUrl: string;
	private readonly tmsUrl: string;
	private readonly categoryDefinitions: Category[] = defaultCategoryDefinitions;

	constructor(options: {
		allureRuntime: AllureRuntime;
		jiraUrl?: string;
		tmsUrl?: string;
		environmentInfo?: Record<string, string>;
		categoryDefinitions?: Category[];
	}) {
		this.allureRuntime = options.allureRuntime;

		this.jiraUrl = options.jiraUrl ?? 'https://github.com/ryparker/jest-circus-allure-environment/blob/master/README.md';

		this.tmsUrl = options.tmsUrl ?? 'https://github.com/ryparker/jest-circus-allure-environment/blob/master/README.md';

		if (options.environmentInfo) {
			this.allureRuntime.writeEnvironmentInfo(options.environmentInfo);
		}

		if (options.categoryDefinitions) {
			this.categoryDefinitions = [
				...this.categoryDefinitions,
				...options.categoryDefinitions
			];
		}

		this.allureRuntime.writeCategoriesDefinitions(this.categoryDefinitions);
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

		if (suite && type.includes('before')) {
			this.currentExecutable = suite.addBefore();
		} else if (suite && type.includes('after')) {
			this.currentExecutable = suite.addAfter();
		}
	}

	public endHook(error?: Error): void {
		if (this.currentExecutable) {
			this.currentExecutable.stage = Stage.FINISHED;

			if (error) {
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

		if (test.fn) {
			const serializedTestCode = test.fn.toString();
			const {code, comments, pragmas} = this.extractCodeDetails(serializedTestCode);

			this.setAllureReportPragmas(pragmas);

			this.currentTest.description = `${comments}\n### Test\n\`\`\`typescript\n${code}\n\`\`\`\n`;
		} else {
			this.currentTest.description = '### Test\nCode is not available.\n';
		}

		if (state.parentProcess?.env?.JEST_WORKER_ID) {
			this.currentTest.addLabel(LabelName.THREAD, state.parentProcess.env.JEST_WORKER_ID);
		}

		this.addSuiteLabelsToTestCase(testPath);
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

	private extractCodeDetails(serializedTestCode: string) {
		if (this.currentTest === null) {
			throw new Error('No active test');
		}

		const docblock = this.extractDocBlock(serializedTestCode);
		const {pragmas, comments} = parseWithComments(docblock);

		let code = serializedTestCode.replace(docblock, '');

		// Add newline before the first expect()
		code = code.split(/(expect[\S\s.]*)/g).join('\n');
		code = prettier.format(code, {parser: 'typescript', plugins: [parser]});

		return {code, comments, pragmas};
	}

	private extractDocBlock(contents: string): string {
		const docblockRe = /^\s*(\/\*\*?(.|\r?\n)*?\*\/)/gm;

		const match = contents.match(docblockRe);
		return match ? match[0].trimStart() : '';
	}

	private setAllureReportPragmas(pragmas: Record<string, string|string[]>) {
		for (let [pragma, value] of Object.entries(pragmas)) {
			if (value instanceof String && value.includes(',')) {
				value = value.split(',');
			}

			if (Array.isArray(value)) {
				value.map(v => this.setAllureLabelsAndLinks(pragma, v));
			} else {
				this.setAllureLabelsAndLinks(pragma, value);
			}
		}
	}

	private setAllureLabelsAndLinks(labelName: string, value: string) {
		if (!this.currentTest) {
			throw new Error('No test running.');
		}

		const test = this.currentTest;

		switch (labelName) {
			case 'issue':
				test.addLink(`${this.jiraUrl}${value}`, value, LinkType.ISSUE);
				break;
			case 'tms':
				test.addLink(`${this.tmsUrl}${value}`, value, LinkType.TMS);
				break;
			case 'tag':
			case 'tags':
				test.addLabel(LabelName.TAG, value);
				break;
			case 'milestone':
				test.addLabel(labelName, value);
				test.addLabel('epic', value);
				break;
			default:
				test.addLabel(labelName, value);

				break;
		}
	}

	private addSuiteLabelsToTestCase(testPath: string) {
		if (!this.currentTest) {
			throw new Error('No active test case');
		}

		const pathsArray = testPath.split('/');

		const [parentSuite, ...suites] = pathsArray;
		const subSuite = suites.pop();

		if (parentSuite) {
			this.currentTest.addLabel(LabelName.PARENT_SUITE, parentSuite);
			this.currentTest.addLabel(LabelName.PACKAGE, parentSuite);
		}

		if (suites.length > 0) {
			this.currentTest.addLabel(LabelName.SUITE, suites.join(' > '));
		}

		if (subSuite) {
			this.currentTest.addLabel(LabelName.SUB_SUITE, subSuite);
		}
	}

	// TODO: Use if describe blocks are present.
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
