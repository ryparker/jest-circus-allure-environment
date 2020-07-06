import {
	Allure,
	AllureRuntime,
	AllureStep,
	AllureTest,
	ContentType,
	ExecutableItemWrapper,
	Status,
	StepInterface,
	isPromise,
	Stage
} from 'allure-js-commons';

import type AllureReporter from './allure-reporter';
import StepWrapper from './step-wrapper';

export default class JestAllureInterface extends Allure {
	constructor(
		private readonly reporter: AllureReporter,
		runtime: AllureRuntime
	) {
		super(runtime);
	}

	public get currentExecutable(): ExecutableItemWrapper {
		const executable: AllureStep | AllureTest | ExecutableItemWrapper | null =
      this.reporter.currentStep ??
      this.reporter.currentTest ??
      this.reporter.currentExecutable;
		if (!executable) {
			throw new Error('No executable!');
		}

		return executable;
	}

	public set currentExecutable(executable: ExecutableItemWrapper) {
		this.reporter.currentExecutable = executable;
	}

	public step<T>(name: string, body: (step: StepInterface) => any): any {
		const wrappedStep = this.startStep(name);
		let result;
		try {
			result = wrappedStep.run(body);
		} catch (error) {
			wrappedStep.endStep();
			throw error;
		}

		if (isPromise(result)) {
			const promise = result as Promise<any>;
			return promise
				.then(a => {
					wrappedStep.endStep();
					return a;
				})
				.catch(error => {
					wrappedStep.endStep();
					throw error;
				});
		}

		wrappedStep.endStep();
		return result;
	}

	logStep(
		name: string,
		status: Status,
		attachments?: Array<{ name: string; content: string; type: ContentType }>
	): void {
		const step = this.startStep(name);

		step.status = status;

		if (attachments) {
			attachments.map(a => this.attachment(a.name, a.content, a.type));
		}

		step.endStep();
	}

	public attachment(
		name: string,
		content: Buffer | string,
		type: ContentType
	): void {
		const file = this.reporter.writeAttachment(content, type);
		this.currentExecutable.addAttachment(name, type, file);
	}

	public testAttachment(
		name: string,
		content: Buffer | string,
		type: ContentType
	): void {
		const file = this.reporter.writeAttachment(content, type);
		this.currentTest.addAttachment(name, type, file);
	}

	public get currentTest(): AllureTest {
		if (this.reporter.currentTest === null) {
			throw new Error('No test running!');
		}

		return this.reporter.currentTest;
	}

	private startStep(name: string): StepWrapper {
		const allureStep: AllureStep = this.currentExecutable.startStep(name);
		this.reporter.pushStep(allureStep);
		return new StepWrapper(this.reporter, allureStep);
	}
}
