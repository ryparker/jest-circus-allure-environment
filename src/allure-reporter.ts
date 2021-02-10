import * as os from 'os';
import {
	AllureGroup,
	AllureRuntime,
	AllureStep,
	AllureTest,
	Category,
	ExecutableItemWrapper,
	LabelName,
	LinkType,
	Stage,
	Status
} from 'allure-js-commons';
import JestAllureInterface, {ContentType} from './jest-allure-interface';
import {createHash} from 'crypto';
import defaultCategories from './category-definitions';
import {parseWithComments} from 'jest-docblock';
import stripAnsi = require('strip-ansi');
import _ = require('lodash');
import prettier = require('prettier/standalone');
import parser = require('prettier/parser-typescript');

import type * as jest from '@jest/types';

export default class AllureReporter {
	currentExecutable: ExecutableItemWrapper | null = null;
	private readonly allureRuntime: AllureRuntime;
	private readonly suites: AllureGroup[] = [];
	private readonly steps: AllureStep[] = [];
	private readonly tests: AllureTest[] = [];
	private readonly jiraUrl: string;
	private readonly tmsUrl: string;
	private readonly categories: Category[] = defaultCategories;

	constructor(options: {
		allureRuntime: AllureRuntime;
		jiraUrl?: string;
		tmsUrl?: string;
		environmentInfo?: Record<string, string>;
		categories?: Category[];
	}) {
		this.allureRuntime = options.allureRuntime;

		this.jiraUrl = options.jiraUrl ?? 'https://github.com/ryparker/jest-circus-allure-environment/blob/master/README.md';

		this.tmsUrl = options.tmsUrl ?? 'https://github.com/ryparker/jest-circus-allure-environment/blob/master/README.md';

		if (options.environmentInfo) {
			this.allureRuntime.writeEnvironmentInfo(options.environmentInfo);
		}

		if (options.categories) {
			this.categories = [
				...this.categories,
				...options.categories
			];
		}

		this.allureRuntime.writeCategoriesDefinitions(this.categories);
	}

	getImplementation(): JestAllureInterface {
		return new JestAllureInterface(this, this.allureRuntime, this.jiraUrl);
	}

	get currentSuite(): AllureGroup | null {
		return this.suites.length > 0 ? this.suites[this.suites.length - 1] : null;
	}

	get currentStep(): AllureStep | null {
		return this.steps.length > 0 ? this.steps[this.steps.length - 1] : null;
	}

	get currentTest(): AllureTest | null {
		return this.tests.length > 0 ? this.tests[this.tests.length - 1] : null;
	}

	environmentInfo(info?: Record<string, string>) {
		this.allureRuntime.writeEnvironmentInfo(info);
	}

	startTestFile(suiteName?: string): void {
		this.startSuite(suiteName);
	}

	endTestFile(): void {
		this.suites.forEach(_ => {
			this.endSuite();
		});
	}

	startSuite(suiteName?: string): void {
		const scope: AllureGroup | AllureRuntime =
      this.currentSuite ?? this.allureRuntime;
		const suite: AllureGroup = scope.startGroup(suiteName ?? 'Global');
		this.pushSuite(suite);
	}

	endSuite(): void {
		if (this.currentSuite === null) {
			throw new Error('endSuite called while no suite is running');
		}

		if (this.steps.length > 0) {
			this.steps.forEach(step => {
				step.endStep();
			});
		}

		if (this.tests.length > 0) {
			this.tests.forEach(test => {
				test.endTest();
			});
		}

		this.currentSuite.endGroup();
		this.popSuite();
	}

	startHook(type: jest.Circus.HookType): void {
		const suite: AllureGroup | null = this.currentSuite;

		if (suite && type.startsWith('before')) {
			this.currentExecutable = suite.addBefore();
		}

		if (suite && type.startsWith('after')) {
			this.currentExecutable = suite.addAfter();
		}
	}

	endHook(error?: Error): void {
		if (this.currentExecutable === null) {
			throw new Error('endHook called while no executable is running');
		}

		if (error) {
			const {status, message, trace} = this.handleError(error);

			this.currentExecutable.status = status;
			this.currentExecutable.statusDetails = {message, trace};
			this.currentExecutable.stage = Stage.FINISHED;
		}

		if (!error) {
			this.currentExecutable.status = Status.PASSED;
			this.currentExecutable.stage = Stage.FINISHED;
		}
	}

	startTestCase(test: jest.Circus.TestEntry, state: jest.Circus.State, testPath: string): void {
		if (this.currentSuite === null) {
			throw new Error('startTestCase called while no suite is running');
		}

		let currentTest = this.currentSuite.startTest(test.name);
		currentTest.fullName = test.name;
		currentTest.historyId = createHash('md5')
			.update(testPath + '.' + test.name)
			.digest('hex');
		currentTest.stage = Stage.RUNNING;

		if (test.fn) {
			const serializedTestCode = test.fn.toString();
			const {code, comments, pragmas} = this.extractCodeDetails(serializedTestCode);

			this.setAllureReportPragmas(currentTest, pragmas);

			currentTest.description = `${comments}\n### Test\n\`\`\`typescript\n${code}\n\`\`\`\n`;
		}

		if (!test.fn) {
			currentTest.description = '### Test\nCode is not available.\n';
		}

		if (state.parentProcess?.env?.JEST_WORKER_ID) {
			currentTest.addLabel(LabelName.THREAD, state.parentProcess.env.JEST_WORKER_ID);
		}

		currentTest = this.addSuiteLabelsToTestCase(currentTest, testPath);
		this.pushTest(currentTest);
	}

	passTestCase(): void {
		if (this.currentTest === null) {
			throw new Error('passTestCase called while no test is running');
		}

		this.currentTest.status = Status.PASSED;
	}

	pendingTestCase(test: jest.Circus.TestEntry): void {
		if (this.currentTest === null) {
			throw new Error('pendingTestCase called while no test is running');
		}

		this.currentTest.status = Status.SKIPPED;
		this.currentTest.statusDetails = {message: `Test is marked: "${test.mode as string}"`};
	}

	failTestCase(error: Error | any): void {
		if (this.currentTest === null) {
			throw new Error('failTestCase called while no test is running');
		}

		const latestStatus = this.currentTest.status;

		// If test already has a failed/broken state, we should not overwrite it
		const isBrokenTest = latestStatus === Status.BROKEN && this.currentTest.stage !== Stage.RUNNING;
		if (latestStatus === Status.FAILED || isBrokenTest) {
			return;
		}

		const {status, message, trace} = this.handleError(error);

		this.currentTest.status = status;
		this.currentTest.statusDetails = {message, trace};
	}

	endTest() {
		if (this.currentTest === null) {
			throw new Error('endTest called while no test is running');
		}

		this.currentTest.stage = Stage.FINISHED;
		this.currentTest.endTest();
		this.popTest();
	}

	writeAttachment(content: Buffer | string, type: ContentType): string {
		// Because Allure-JS-Commons does not support HTML we can workaround by providing the file extension.
		const fileExtension = type === ContentType.HTML ? 'html' : undefined;
		return this.allureRuntime.writeAttachment(content, {contentType: type, fileExtension});
	}

	pushStep(step: AllureStep): void {
		this.steps.push(step);
	}

	popStep(): void {
		this.steps.pop();
	}

	pushTest(test: AllureTest): void {
		this.tests.push(test);
	}

	popTest(): void {
		this.tests.pop();
	}

	pushSuite(suite: AllureGroup): void {
		this.suites.push(suite);
	}

	popSuite(): void {
		this.suites.pop();
	}

	private handleError(error: Error | any) {
		if (Array.isArray(error)) {
			// Test_done event sends an array of arrays containing errors.
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
			message = 'Error. Expand for more details.';
			trace = error;
		}

		return {
			status,
			message: stripAnsi(message),
			trace: stripAnsi(trace)
		};
	}

	private extractCodeDetails(serializedTestCode: string) {
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

	private setAllureReportPragmas(currentTest: AllureTest, pragmas: Record<string, string|string[]>) {
		for (let [pragma, value] of Object.entries(pragmas)) {
			if (value instanceof String && value.includes(',')) {
				value = value.split(',');
			}

			if (Array.isArray(value)) {
				value.forEach(v => {
					this.setAllureLabelsAndLinks(currentTest, pragma, v);
				});
			}

			if (!Array.isArray(value)) {
				this.setAllureLabelsAndLinks(currentTest, pragma, value);
			}
		}
	}

	private setAllureLabelsAndLinks(currentTest: AllureTest, labelName: string, value: string) {
		switch (labelName) {
			case 'issue':
				currentTest.addLink(`${this.jiraUrl}${value}`, value, LinkType.ISSUE);
				break;
			case 'tms':
				currentTest.addLink(`${this.tmsUrl}${value}`, value, LinkType.TMS);
				break;
			case 'tag':
			case 'tags':
				currentTest.addLabel(LabelName.TAG, value);
				break;
			case 'milestone':
				currentTest.addLabel(labelName, value);
				currentTest.addLabel('epic', value);
				break;
			default:
				currentTest.addLabel(labelName, value);
				break;
		}
	}

	private addSuiteLabelsToTestCase(currentTest: AllureTest, testPath: string): AllureTest {
		const isWindows = os.type() === 'Windows_NT';
		const pathDelimiter = isWindows ? '\\' : '/';
		const pathsArray = testPath.split(pathDelimiter);

		const [parentSuite, ...suites] = pathsArray;
		const subSuite = suites.pop();

		if (parentSuite) {
			currentTest.addLabel(LabelName.PARENT_SUITE, parentSuite);
			currentTest.addLabel(LabelName.PACKAGE, parentSuite);
		}

		if (suites.length > 0) {
			currentTest.addLabel(LabelName.SUITE, suites.join(' > '));
		}

		if (subSuite) {
			currentTest.addLabel(LabelName.SUB_SUITE, subSuite);
		}

		return currentTest;
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
