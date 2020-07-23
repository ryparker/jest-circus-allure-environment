import type {AllureStep, StepInterface, Stage, ContentType} from 'allure-js-commons';
import {Status} from 'allure-js-commons';
import type AllureReporter from './allure-reporter';

export default class StepWrapper {
	constructor(private readonly reporter: AllureReporter, private readonly step: AllureStep) {}

	get name() {
		return this.step.name;
	}

	set name(name: string) {
		this.step.name = name;
	}

	get status() {
		return this.step.status ?? Status.PASSED;
	}

	set status(status: Status) {
		this.step.status = status;
	}

	get stage() {
		return this.step.stage;
	}

	set stage(stage: Stage) {
		this.step.stage = stage;
	}

	public parameter(name: string, value: string): void {
		this.step.addParameter(name, value);
	}

	public attachment(
		name: string,
		content: Buffer | string,
		type: ContentType
	): void {
		const file = this.reporter.writeAttachment(content, type);
		this.step.addAttachment(name, type, file);
	}

	public startStep(name: string): StepWrapper {
		const step: AllureStep = this.step.startStep(name);
		this.reporter.pushStep(step);
		return new StepWrapper(this.reporter, step);
	}

	public endStep(): void {
		this.reporter.popStep();
		this.step.endStep();
	}

	public run<T>(body: (step: StepInterface) => T): T {
		return this.step.wrap(body)();
	}
}
