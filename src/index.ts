export {default} from './allure-node-environment';

export * from 'allure-js-commons';

import type JestAllureInterface from './jest-allure-interface';

export type {JestAllureInterface};

declare global {
	const allure: JestAllureInterface;
}
