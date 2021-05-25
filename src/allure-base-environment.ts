import {AllureRuntime, IAllureConfig} from 'allure-js-commons';
import type {Circus, Config} from '@jest/types';

import AllureReporter from './allure-reporter';
import type {EnvironmentContext} from '@jest/environment';

import NodeEnvironment = require('jest-environment-node');
import {basename} from 'path';

export default class AllureNodeEnvironment extends NodeEnvironment {
	private readonly reporter: AllureReporter;
	private readonly testPath: string;
	private readonly testFileName: string;

	constructor(config: Config.ProjectConfig, context: EnvironmentContext) {
		super(config);

		if (typeof config.testEnvironmentOptions.testPath === 'string') {
			this.testPath = config.testEnvironmentOptions.testPath;
		}

		this.testPath = this.initializeTestPath(config, context);

		this.testFileName = basename(this.testPath);

		this.reporter = this.initializeAllureReporter(config);

		this.global.allure = this.reporter.getImplementation();
	}

	initializeTestPath(config: Config.ProjectConfig, context: EnvironmentContext) {
		let testPath = context.testPath ?? '';

		if (typeof config.testEnvironmentOptions.testPath === 'string') {
			testPath = testPath?.replace(config.testEnvironmentOptions.testPath, '');
		}

		if (typeof config.testEnvironmentOptions.testPath !== 'string') {
			testPath = testPath?.replace(config.rootDir, '');
		}

		if (testPath.startsWith('/')) {
			testPath = testPath.slice(1);
		}

		return testPath;
	}

	initializeAllureReporter(config: Config.ProjectConfig) {
		const allureConfig: IAllureConfig = {
			resultsDir: config.testEnvironmentOptions.resultsDir as string ?? 'allure-results'
		};

		return new AllureReporter({
			allureRuntime: new AllureRuntime(allureConfig),
			jiraUrl: config.testEnvironmentOptions?.jiraUrl as string,
			tmsUrl: config.testEnvironmentOptions?.tmsUrl as string,
			environmentInfo: config.testEnvironmentOptions?.environmentInfo as Record<string, any>,
			categories: config.testEnvironmentOptions?.categories as Array<Record<string, any>>
		});
	}

	async setup() {
		return super.setup();
	}

	async teardown() {
		return super.teardown();
	}

	handleTestEvent(event: Circus.Event, state: Circus.State) {
		// Console.log(`Event: ${event.name}`);
		// Console.log({event});

		switch (event.name) {
			case 'setup':

				break;
			case 'add_hook':
				break;
			case 'add_test':
				break;
			case 'run_start':
				this.reporter.startTestFile(this.testFileName);

				break;
			case 'test_skip':
				this.reporter.startTestCase(event.test, state, this.testPath);
				this.reporter.pendingTestCase(event.test);

				break;
			case 'test_todo':
				this.reporter.startTestCase(event.test, state, this.testPath);
				this.reporter.pendingTestCase(event.test);

				break;
			case 'start_describe_definition':
				/**
				 * @privateRemarks
				 * Only called if "describe()" blocks are present.
				 */

				break;
			case 'finish_describe_definition':
				/**
				 * @privateRemarks
				 * Only called if "describe()" blocks are present.
				 */

				break;
			case 'run_describe_start':
				/**
				 * @privateRemarks
				 * This is called at the start of a test file.
				 * Even if there are no describe blocks.
				 */

				this.reporter.startSuite(event.describeBlock.name);

				break;
			case 'test_start':
				/**
				 * @privateRemarks
				 * This is called after beforeAll and before the beforeEach hooks.
				 * If we start the test case here, allure will include the beforeEach
				 * hook as part of the "test body" instead of the "Set up".
				 */

				// This.reporter.startTestCase(event.test, state, this.testPath);
				break;
			case 'hook_start':
				this.reporter.startHook(event.hook.type);

				break;
			case 'hook_success':
				this.reporter.endHook();

				break;
			case 'hook_failure':
				this.reporter.endHook(event.error ?? event.hook.asyncError);

				break;
			case 'test_fn_start':
				/**
				 * @privateRemarks
				 * This is called after the beforeAll and after the beforeEach.
				 * Making this the most reliable event to start the test case, so
				 * that only the test context is captured in the allure
				 * "Test body" execution.
				 */

				this.reporter.startTestCase(event.test, state, this.testPath);

				break;
			case 'test_fn_success':
				if (event.test.errors.length > 0) {
					this.reporter.failTestCase(event.test.errors[0]);
				} else {
					this.reporter.passTestCase();
				}

				break;
			case 'test_fn_failure':
				this.reporter.failTestCase(event.test.errors[0]);

				break;
			case 'test_done':
				/**
				 * @privateRemarks
				 * This is called once the test has completed (includes hooks).
				 * This is more reliable for error collection because some failures
				 * like Snapshot failures will only appear in this event.
				 */
				/**
				 * @privateRemarks -Issue-
				 * If we capture errors from both test_done and test_fn_failure
				 * the test case will be overriden causing allure to lose any
				 * test context like steps that the overriden test case may have
				 * had.
				 * A workaround might be to refactor the AllureReporter class
				 * by decoupling the endTestCase method from the passTestCase,
				 * failTestCase, and pendingTestCase methods.
				 */
				/**
				 * @privateRemarks -Issue-
				 * afterEach hooks appears in the allure "test body".
				 */

				if (event.test.errors.length > 0) {
					this.reporter.failTestCase(event.test.errors[0]);
				}

				this.reporter.endTest();

				break;
			case 'run_describe_finish':
				/**
				 * @privateRemarks
				 * This is called at the end of a describe block or test file. If a
				 * describe block is not present in the test file, this event will
				 * still be called at the end of the test file.
				 */

				this.reporter.endSuite();

				break;
			case 'run_finish':
				this.reporter.endTestFile();

				break;
			case 'teardown':
				break;
			case 'error':
				/**
				 * @privateRemarks
				 * Haven't found a good example of when this is emitted yet.
				 */

				// console.log('ERROR EVENT:', event);

				break;
			default:
				/**
				 * @privateRemarks
				 * Haven't found a good example of when this is emitted yet.
				*/

				// console.log('UNHANDLED EVENT:', event);

				break;
		}
	}
}
