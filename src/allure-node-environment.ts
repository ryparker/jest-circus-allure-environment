import type {Config, Circus} from '@jest/types';
import NodeEnvironment = require('jest-environment-node');
import type {EnvironmentContext} from '@jest/environment';
import AllureReporter from './allure-reporter';
import {AllureRuntime, IAllureConfig} from 'allure-js-commons';

export default class AllureNodeEnvironment extends NodeEnvironment {
	private readonly reporter: AllureReporter;
	private readonly testPath: string;
	private readonly docblockPragmas?: Record<string, string | string[]>;

	constructor(config: Config.ProjectConfig, context: EnvironmentContext) {
		super(config);

		const allureConfig: IAllureConfig = {
			resultsDir: config.testEnvironmentOptions.resultsDir ?? 'allure-results'
		};

		this.docblockPragmas = context.docblockPragmas;
		this.testPath = context.testPath ? context.testPath.replace(config.rootDir, '') : '';

		if (this.testPath.includes('tests/')) {
			this.testPath = this.testPath.split('tests/')[1];
		}

		if (this.testPath.includes('__tests__/')) {
			this.testPath = this.testPath.split('__tests__/')[1];
		}

		this.reporter = new AllureReporter({
			allureRuntime: new AllureRuntime(allureConfig),
			jiraUrl: config.testEnvironmentOptions?.jiraUrl,
			tmsUrl: config.testEnvironmentOptions?.tmsUrl,
			environmentInfo: config.testEnvironmentOptions?.environmentInfo,
			categoryDefinitions: config.testEnvironmentOptions?.categories
		});

		this.global.allure = this.reporter.getImplementation();

		if (this.docblockPragmas?.prototype !== undefined) {
			console.log('this.docblockPragmas:', this.docblockPragmas);
		}
	}

	async setup() {
		return super.setup();
	}

	async teardown() {
		return super.teardown();
	}

	handleTestEvent(event: Circus.Event, state: Circus.State) {
		// Console.log(`Event: ${event.name}`);
		switch (event.name) {
			case 'setup':
				break;
			case 'add_hook':
				break;
			case 'add_test':
				break;
			case 'run_start':
				break;
			case 'test_skip':
				this.reporter.pendingTestCase(event.test, state, this.testPath);
				break;
			case 'test_todo':
				this.reporter.pendingTestCase(event.test, state, this.testPath);
				break;
			case 'start_describe_definition':
				/** @privateRemarks
				 * Only called if "describe()" blocks are present.
				 */

				break;
			case 'finish_describe_definition':
				/** @privateRemarks
				 * Only called if "describe()" blocks are present.
				 */

				break;
			case 'run_describe_start':
				/** @privateRemarks
				 * This is called at the start of a test file.
				 * Even if there are no describe blocks.
				 */

				this.reporter.startSuite(event.describeBlock.name);

				break;
			case 'test_start':
				/** @privateRemarks
				 * This is called after beforeAll and before the beforeEach hooks.
				 * If we start the test case here, allure will include the beforeEach
				 * hook as part of the "test body" instead of the "Set up".
				 */

				// This.reporter.startCase(event.test, state, this.testPath);
				break;
			case 'hook_start':
				this.reporter.startHook(event.hook.type);

				break;
			case 'hook_success':
				this.reporter.endHook();

				break;
			case 'hook_failure':
				console.log('TEST_FN_FAILURE ERROR:', event.error);
				console.log('TEST_FN_FAILURE HOOK.ASYNCERROR:', event.hook.asyncError);

				this.reporter.endHook(event.error ?? event.hook.asyncError);

				break;
			case 'test_fn_start':
				/** @privateRemarks
				 * This is called after the beforeAll and after the beforeEach.
				 * Making this the most reliable event to start the test case, so
				 * that only the test context is captured in the allure
				 * "Test body" execution.
				 */

				this.reporter.startCase(event.test, state, this.testPath);

				break;
			case 'test_fn_success':
				// This.reporter.passTestCase(event.test, state, this.testPath);

				break;
			case 'test_fn_failure':
				// Console.log('TEST_FN_FAILURE ERROR:', event.error);
				// console.log('TEST_FN_FAILURE TEST.ERRORS:', event.test.errors);
				// console.log('TEST_FN_FAILURE TEST.ASYNCERROR:', event.test.asyncError);

				break;
			case 'test_done':
				/** @privateRemarks
				 * This is called once the test has completed (includes hooks).
				 * This is more reliable for error collection because some failures
				 * like Snapshot failures will only appear in this event.
				 */
				/** @privateRemarks -Issue-
				 * If we capture errors from both test_done and test_fn_failure
				 * the test case will be overriden causing allure to lose any
				 * test context like steps that the overriden test case may have
				 * had.
				 * A workaround might be to refactor the AllureReporter class
				 * by decouple the endTestCase method from the passTestCase,
				 * failTestCase, and pendingTestCase methods.
				 */
				/** @privateRemarks -Issue-
				 * afterEach hooks appears in the allure "test body".
				 */

				if (event.test.errors.length > 0) {
					this.reporter.failTestCase(event.test, state, this.testPath, event.test.errors[0]);
				} else {
					this.reporter.passTestCase(event.test, state, this.testPath);
				}

				break;
			case 'run_describe_finish':
				/** @privateRemarks
				 * This is called at the end of a describe block or test file. If a
				 * describe block is not present in the test file, this event will
				 * still be called at the end of the test file.
				 */

				this.reporter.endSuite();

				break;
			case 'run_finish':

				break;
			case 'teardown':

				break;
			case 'error':
				/** @privateRemarks
				 * Haven't found a good example of when this is emitted yet.
				 */

				console.log('ERROR EVENT:', event);

				break;
			default:
				/** @privateRemarks
				 * Haven't found a good example of when this is emitted yet.
				*/

				console.log('UNHANDLED EVENT:', event);

				break;
		}
	}
}
