import JestAllureInterface from './jest-allure-interface';
import type * as jest from '@jest/types';
import stripAnsi = require('strip-ansi');
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

export default class AllureReporter {
	public currentExecutable: ExecutableItemWrapper | null = null;
	private readonly suites: AllureGroup[] = [];
	private readonly steps: AllureStep[] = [];
	private runningTest: AllureTest | null = null;

	constructor(private readonly allureRuntime: AllureRuntime) { }

	public getImplementation(): JestAllureInterface {
		return new JestAllureInterface(this, this.allureRuntime);
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
				this.currentExecutable.status = Status.FAILED;

				const message = stripAnsi(error.message);
				const trace = stripAnsi(error.stack ?? '').replace(message, '');

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

		const testFunc = test.fn ? prettier.format(test.fn.toString(), {parser: 'typescript', plugins: [parser]}) : '';
		this.currentTest.description = `### Test\n\`\`\`TS\n${testFunc}\n\`\`\`\n`;

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
		this.endTest(Status.SKIPPED, {message: `Test ${test.mode as string}`});
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

		// If (error.matcherResult) {
		// 	console.log('error.matcherResult:', error.matcherResult);
		// } else {
		// 	console.log('error:', error);
		// }

		const status = error.matcherResult ? Status.FAILED : Status.BROKEN;

		const isSnapshotFailure = error.matcherResult?.name === 'toMatchSnapshot';

		let message: string;
		let trace: string;

		if (isSnapshotFailure) {
			const [matcherHint, ...snapshotDiff] = stripAnsi(error.matcherResult.message()).split('@@');

			message = matcherHint;
			trace = snapshotDiff.join('');
			// Console.log({message, trace});
		} else {
			message = stripAnsi(error.message);
			trace = stripAnsi(error.stack ?? '').replace(message, '');
		}

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

	private collectTestParentNames(
		parent: jest.Circus.TestEntry | jest.Circus.DescribeBlock | undefined
	) {
		const testPath = [];
		do {
			testPath.unshift(parent?.name);
		} while ((parent = parent?.parent));

		return testPath;
	}

	// Private formatErrors(error: Error) {
	//     error.message = stripAnsi(test.failure.message)
	//   error['stack-trace'] = stripAnsi(test.failure['stack-trace'])
	// }
}
