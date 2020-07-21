# Jest Circus Allure Environment

![Lint-Build-Test-Publish](https://github.com/ryparker/jest-circus-allure-reporter/workflows/Lint-Build-Test-Publish/badge.svg)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Jest Circus environment for Allure reporting.

![Allure Report](https://user-images.githubusercontent.com/2823336/40350093-59cad576-5db1-11e8-8210-c4db3bf825a1.png)

---

- [Jest Circus Allure Environment](#jest-circus-allure-environment)
	- [❗️ Requirements](#️-requirements)
	- [:rocket: Quick start](#-quick-start)
	- [:camera_flash: Allure reporting in your tests](#-allure-reporting-in-your-tests)
	- [🔧 Typescript & Intellisense setup](#-typescript--intellisense-setup)
	- [:gear: Options](#️-options)
	- [📈 DocBlocks](#-docblocks)
		- [🔍 Descriptions](#-descriptions)
		- [🏷 Tag](#-tag)
		- [👥 Owner](#-owner)
		- [:part_alternation_mark: Severity](#️-severity)
		- [📇 Behaviors (epics, features, stories)](#-behaviors-epics-features-stories)
		- [🔗 Links (Jira and TMS)](#-links-jira-and-tms)
	- [👩‍🎓 Advanced](#-advanced)
		- [🎛 Global Allure API](#-global-allure-api)

---

## ❗️ Requirements

| Resource                                                             | Description                                                                                  |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [Jest](https://jestjs.io/)                                           | A delightful JavaScript testing framework.                                                   |
| [Allure 2 CLI](https://github.com/allure-framework/allure2#download) | "A Java jar command line tool that turns Allure result files into beautiful Allure reports." |

## :rocket: Quick start

1. **Add this package**

```shell
yarn add --dev jest-circus-allure-environment
```

2. **Update `jest.config.js`**

_See the [testEnvironment docs](https://jestjs.io/docs/en/configuration#testenvironment-string) for configuration details._

```JSON
{
  "testEnvironment": "jest-circus-allure-environment",
  "testRunner": "jest-circus/runner"
}
```

3. **Run tests**

```shell
yarn test
```

4. **Open the Allure report**

```shell
allure serve ./allure-results
```

## :camera_flash: Allure reporting in your tests

To provide more information in your reports you can use Docblock pragmas within your tests. For types support you'll need some [additional configuration](#typescript--intellisense-setup).

```js
// simple.test.js

test('2 + 3 is 5', () => {
  /** My test description.
   * @epic Implement addition functionality
   * @tag Accounting
   */

  expect(2 + 3).toBe(5)
})
```

## 🔧 Typescript & Intellisense setup

1. **Support Typescript & intellisense by loading the module into your `jest.setup.js` file**



```js
// jest.setup.js

import 'jest-circus-allure-environment' // Typescript or ESM
require('jest-circus-allure-environment') // CommonJS
```

2. **Make sure your `jest.setup.js` file is properly configured.**

_See the [setupFilesAfterEnv docs](https://jestjs.io/docs/en/configuration#setupfilesafterenv-array) for configuration details._

```js
// jest.config.js

{
  "setupFilesAfterEnv": ["./jest.setup.js"]
}
```

## :gear: Options

Options that can be passed into the `environmentOptions` property of your `jest.config.js`

| Parameter           | Description                                                                         | Default            |
| ------------------- | ----------------------------------------------------------------------------------- | ------------------ |
| resultsDir          | File path where result files are written.                                           | `"allure-results"` |
| jiraUrl             | Decorator that receives Allure test result objects.                                 | `undefined`        |
| tmsUrl              | Decorator that receives Allure test result objects.                                 | `undefined`        |
| environmentInfo     | Key value pairs that will appear under the environment section of the Allure report | `{}`               |
| categoryDefinitions | Array of custom categories you wish to see in the Allure report                     | `[]`               |

## 📈 DocBlocks

You may set code comments inside your tests called DocBlocks, that can be parsed for specific allure report pragmas. These are the supported DocBlock pragmas you may add to a test.


### 🔍 Descriptions

Add descriptions that document the tested functionality.

```TS
test('does something important, when triggered by user', () => {
	/** This uses a 3rd party API that typically undergoes maintenance on Tuesdays.
	 */

	...
})
```

### 🏷 Tag

Tag a test with a custom label.

_Set multiple tags using a `, ` deliminator._

```TS
test('does something important, when triggered by user', () => {
	/**
	 * @tag beta
	 * @tag feature-flagged, api-v3
	 */

	...
})
```

### 👥 Owner

Set an owner for a test.

```TS
test('does something important, when triggered by user', () => {
	/**
	 * @owner ios-team
	 */

	...
})
```

### :part_alternation_mark: Severity

Mark tests with a severity rating to indicate the importance of the tested functionality in respect to the overall application.

| Level            | Description                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| blocker          | Tests that if failing, will halt further development.                        |
| critical         | Tests that must pass; or risk disrupting crucial application logic.          |
| normal (default) | Tests that are of average importance to the overall application.             |
| minor            | Tests that if failing, should only effect a small subset of the application. |
| trivial          | Tests that validate unreleased, disabled, or deprecated features.            |

Example of setting a test as "critical" severity

```TS
test('does something important, when triggered by user', () => {
	/**
	 * @severity critical
	 */

	...
})
```

### 📇 Behaviors (epics, features, stories)

Mark tests with a behavior label to organize tests in a feature based hierarchy.

| Level   | Description                                                              |
| ------- | ------------------------------------------------------------------------ |
| epic    | Tests that if fail, will effect the expected functionality of an epic.   |
| feature | Tests that if fail, will effect the expected functionality of a feature. |
| story   | Tests that if fail, will effect the expected functionality of story.     |


Example

```TS
test('validation message appears, when email field is skipped', () => {
	/**
	 * @epic Automate user sign up
	 * @feature Registration page
	 * @story Validate required registration fields before creating new user
	 */

	...
})
```

### 🔗 Links (Jira and TMS)

Add Jira and TMS links to a test.

| Level | Description                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------- |
| issue | Adds a link to the test report that will open an existing issue in Jira.                            |
| tms   | Adds a link to the test report that will open an existing test case in your test management system. |


Example

```TS
test('validation message appears, when email field is skipped', () => {
	/**
	 * @issue DEBT-60
	 * @tms CORE-122
	 */

	...
})
```

## 👩‍🎓 Advanced


### 🎛 Global Allure API

An instance of the allure runtime will be available on the Node global variable. You can utilize it's APIs to provide custom reporting functionality.

```TS
/**
 * Returns the Allure test instance for the currently running test when called inside of a test.
 */
allure.currentTest(): AllureTest;

/**
 * Starts and returns a new step instance on the current executable.
 */
allure.description(description: string): void;

/**
 * Starts and returns a new step instance on the current executable.
 */
allure.startStep(name: string): StepWrapper;

/**
 * Starts a new Allure step sets it's status and attachments then ends the step all in one method.
 */
allure.logStep(
	name: string,
	status: Status,
	attachments?: Array<{ name: string; content: string; type: ContentType }>
): void;

/**
 * Add a parameter to the report of the current executable.
 */
allure.parameter(name: string, value: string): void;

/**
 * Attach a file to the report of the current executable.
 */
allure.attachment(
	name: string,
	content: Buffer | string,
	type: ContentType
);

/**
 * Add a issue link to the report of the current test.
 */
allure.issue(id: string): void;

/**
 * Add a TMS link to the report of the current test.
 */
allure.tms(id: string): void;

/**
 * Add a severity label to the report of the current test.
 */
allure.severity(severity: Severity): void;

/**
 * Add a epic label to the report of the current test.
 */
allure.epic(epic: string): void;

/**
 * Add a feature label to the report of the current test.
 */
allure.feature(feature: string): void;

/**
 * Add a story label to the report of the current test.
 */
allure.story(story: string): void;

/**
 * Add a tag label to the report of the current test.
 */
allure.tag(name: string): void;

/**
 * Add a custom label to the report of the current test.
 */
allure.label(name: string, value: string): void;
```
