# jest-circus-allure-reporter

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

1. Add this package

```shell
yarn add --dev jest-circus-allure-environment
```

2. Update `jest.config.js`

See the [official Jest docs](https://jestjs.io/docs/en/configuration#testenvironment-string) for more details.

```JSON
{
  "testEnvironment": ["jest-circus-allure-environment"],
  "testRunner": "jest-circus/runner"
}
```

3. Run tests

```shell
yarn test
```

4. Open the Allure report

```shell
allure serve ./allure-results
```

## :recycle: Lifecycle events

Updated list available [here](https://github.com/facebook/jest/blob/master/packages/jest-types/src/Circus.ts)

**Bold** items are async test events

**_Italic_** items are synchronous test events

0. **_error_**
1. constructor
2. setup Fn
3. **setup**
4. **_add_hook_**
5. **_start_describe_definition_**
6. **_add_test_**
7. **_finish_describe_definition_**
8. **run_start** / **test_skip** / **test_todo**
9. **run_describe_start**
10. **test_start**
11. **hook_start**
12. **hook_success** / **hook_failure**
13. **test_fn_start**
14. **test_fn_success** / **test_fn_failure** / **error**
15. **test_done**
16. **run_describe_finish**
17. **run_finish**
18. **teardown**
19. teardown Fn
