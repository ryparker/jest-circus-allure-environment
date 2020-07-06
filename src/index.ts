export {default} from './allure-node-environment';

import type AllureNodeEnvironment from './allure-node-environment';
export type {AllureNodeEnvironment};

import type JestAllureInterface from './allure-interface';

export type {JestAllureInterface};

declare global {
	const allure: JestAllureInterface;
}
