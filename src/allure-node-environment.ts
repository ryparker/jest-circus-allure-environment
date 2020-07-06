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

		const allureConfig: IAllureConfig = {resultsDir: 'allure-results', ...config.testEnvironmentOptions};

		this.docblockPragmas = context.docblockPragmas;
		this.testPath = context.testPath ? context.testPath.replace(config.rootDir, '') : '';

		if (this.testPath.includes('tests/')) {
			this.testPath = this.testPath.split('tests/')[1];
		}

		if (this.testPath.includes('__tests__/')) {
			this.testPath = this.testPath.split('__tests__/')[1];
		}

		this.reporter = new AllureReporter(new AllureRuntime(allureConfig));

		this.global.allure = this.reporter.getImplementation();

		if (this.docblockPragmas === {}) {
			console.log(this.docblockPragmas);
		}
	}

	async setup() {
		return super.setup();
	}

	async teardown() {
		// This.global.allure = null;

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
				break;
			case 'finish_describe_definition':
				break;
			case 'run_describe_start':
				this.reporter.startSuite(event.describeBlock.name);
				break;
			case 'test_start':
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
				this.reporter.startCase(event.test, state, this.testPath);
				break;
			case 'test_fn_success':
				this.reporter.passTestCase(event.test, state, this.testPath);
				break;
			case 'test_fn_failure':
				console.log('TEST_FN_FAILURE:', event.error);
				this.reporter.failTestCase(event.test, state, this.testPath, event.error ?? event.test.asyncError);
				break;
			case 'test_done':
				break;
			case 'run_describe_finish':
				this.reporter.endSuite();
				break;
			case 'run_finish':
				break;
			case 'teardown':
				break;
			case 'error':
				console.log('ERROR EVENT:', event.error);
				break;
			default:
				console.log('unhandled event:', event);
				break;
		}
	}
}
