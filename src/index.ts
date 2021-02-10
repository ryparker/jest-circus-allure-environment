import type JestAllureInterface from './jest-allure-interface';

declare global {
	const allure: JestAllureInterface;
}

export {default} from './allure-node-environment';

export * from 'allure-js-commons';
export {ContentType} from './jest-allure-interface';
export type {default as StepWrapper} from './step-wrapper';
export type {default as JestAllureInterface} from './jest-allure-interface';

