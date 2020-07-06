# Jest Circus Allure Environment

![Lint-Build-Test-Publish](https://github.com/ryparker/jest-circus-allure-reporter/workflows/Lint-Build-Test-Publish/badge.svg)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Jest Circus environment for Allure reporting.

![Allure Report](https://user-images.githubusercontent.com/2823336/40350093-59cad576-5db1-11e8-8210-c4db3bf825a1.png)

## Requirements

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
  "testEnvironment": ["jest-circus-allure-environment"],
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

## Allure reporting in your tests

To provide more information in your reports you can call allure from your tests. For types support you'll need some [additional configuration](#typescript--intellisense-setup).

```js
// simple.test.js

test('2 + 3 is 5', () => {
  allure.epic('Implement addition functionality')
  allure.tag('Accounting')

  expect(2 + 3).toBe(5)
})
```

## Typescript & Intellisense setup

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
