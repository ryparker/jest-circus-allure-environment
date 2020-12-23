import {
	Allure,
	AllureRuntime,
	AllureStep,
	AllureTest,
	ContentType,
	ExecutableItemWrapper,
	LabelName,
	LinkType,
	Severity,
	Status,
	StepInterface,
	isPromise
} from 'allure-js-commons';

import type AllureReporter from './allure-reporter';
import StepWrapper from './step-wrapper';

export default class JestAllureInterface extends Allure {
	public jiraUrl: string;
	public tmsUrl = '';

	constructor(
		private readonly reporter: AllureReporter,
		runtime: AllureRuntime,
		jiraUrl?: string
	) {
		super(runtime);
		this.jiraUrl = jiraUrl ?? '';
	}

	public get currentExecutable(): AllureStep | AllureTest | ExecutableItemWrapper {
		const executable: AllureStep | AllureTest | ExecutableItemWrapper | null =
      this.reporter.currentStep ??
      this.reporter.currentTest ??
			this.reporter.currentExecutable;

		if (!executable) {
			throw new Error('No executable!');
		}

		return executable;
	}

	public set currentExecutable(executable: AllureStep | AllureTest | ExecutableItemWrapper) {
		this.reporter.currentExecutable = executable;
	}

	public label(name: string, value: string) {
		this.currentTest.addLabel(name, value);
	}

	public severity(severity: Severity) {
		this.label(LabelName.SEVERITY, severity);
	}

	public tag(tag: string) {
		this.currentTest.addLabel(LabelName.TAG, tag);
	}

	public owner(owner: string) {
		this.label(LabelName.OWNER, owner);
	}

	public lead(lead: string) {
		this.label(LabelName.LEAD, lead);
	}

	public epic(epic: string) {
		this.label(LabelName.EPIC, epic);
	}

	public feature(feature: string) {
		this.label(LabelName.FEATURE, feature);
	}

	public story(story: string) {
		this.label(LabelName.STORY, story);
	}

	public issue(name: string) {
		this.link(this.jiraUrl, name, LinkType.ISSUE);
	}

	public tms(name: string) {
		this.link(this.tmsUrl, name, LinkType.TMS);
	}

	public startStep(name: string): StepWrapper {
		const allureStep: AllureStep = this.currentExecutable.startStep(name);
		this.reporter.pushStep(allureStep);
		return new StepWrapper(this.reporter, allureStep);
	}

	public step<T>(name: string, body: (step: StepInterface) => any): any {
		const wrappedStep = this.startStep(name);
		let result;
		try {
			result = wrappedStep.run(body);
		} catch (error: unknown) {
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

	public logStep(
		name: string,
		status: Status,
		attachments?: Array<{ name: string; content: string; type: ContentType }>
	): void {
		const step = this.startStep(name);

		step.status = status;

		if (attachments) {
			attachments.forEach(a => {
				this.attachment(a.name, a.content, a.type);
			});
		}

		step.endStep();
	}

	public description(markdown: string) {
		const {currentTest} = this.reporter;

		if (!currentTest) {
			throw new Error('Expected a test to be executing before adding a description.');
		}

		currentTest.description = markdown;
	}

	public descriptionHtml(html: string) {
		const {currentTest} = this.reporter;

		if (!currentTest) {
			throw new Error('Expected a test to be executing before adding an HTML description.');
		}

		currentTest.descriptionHtml = html;
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
}
