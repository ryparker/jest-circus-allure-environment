# Changelog

# [0.14.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.13.6...v0.14.0) (2021-01-02)


### Features

* **allure-node-environment.ts:** added `testPath` config option ([bf787c3](https://github.com/ryparker/jest-circus-allure-environment/commit/bf787c381f6d69c28949a8814a5b7a90e5ff9b6b))

## [0.13.6](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.13.5...v0.13.6) (2020-12-30)


### Bug Fixes

* **allure-node-environment.ts,allure-report.ts:** beforeAll failures should mark tests as "broken" ([66e60b4](https://github.com/ryparker/jest-circus-allure-environment/commit/66e60b43de39156fcce48ecde714ca3c88721409))

## [0.13.5](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.13.4...v0.13.5) (2020-12-23)


### Bug Fixes

* **allure-reporter.ts:** passing test through pragma methods ([c8a35f6](https://github.com/ryparker/jest-circus-allure-environment/commit/c8a35f63359497165136dcbc5776ba22814ced1b))

## [0.13.4](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.13.3...v0.13.4) (2020-12-23)


### Bug Fixes

* **xo:** xO linter fixes ([774fd4f](https://github.com/ryparker/jest-circus-allure-environment/commit/774fd4f25c5bfc03188c46c56eb330e17efeba43))

## [0.13.3](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.13.2...v0.13.3) (2020-11-20)


### Bug Fixes

* **package.json:** resolved to "mem": "^4.0", ([e957e0c](https://github.com/ryparker/jest-circus-allure-environment/commit/e957e0cd6c88b870f916c0f3bd2df96e0b873082))

## [0.13.2](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.13.1...v0.13.2) (2020-11-20)


### Bug Fixes

* **package.json:** upgraded deps and workflows ([19ab8e0](https://github.com/ryparker/jest-circus-allure-environment/commit/19ab8e05a1b5349626c8bac1c0266b125328599d))

## [0.13.1](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.13.0...v0.13.1) (2020-11-18)


### Bug Fixes

* **fixed file pathing on windows machines:** the report was not parsing file paths as expected ([59e9c15](https://github.com/ryparker/jest-circus-allure-environment/commit/59e9c158ec72f49ebff444440db74752b766566c))
* **package.json:** upgraded deps ([c6c663c](https://github.com/ryparker/jest-circus-allure-environment/commit/c6c663cc1a3b5497d358dc0231f5e325ec648842))

# [0.13.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.12.0...v0.13.0) (2020-11-17)


### Features

* **package.json:** bumped all deps to latest versions ([f34ea2a](https://github.com/ryparker/jest-circus-allure-environment/commit/f34ea2abb4a838e610dc96ca30fc3e9dca73dab8))

# [0.12.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.11.4...v0.12.0) (2020-10-29)


### Bug Fixes

* **logs:** removed debug logging of errors ([dcbe549](https://github.com/ryparker/jest-circus-allure-environment/commit/dcbe549ce4dac7dca4b22716540902f5b1f2d3c1))


### Features

* **allure suites page:** test file paths will now show just the file name in the 3rd tier ([3fc991f](https://github.com/ryparker/jest-circus-allure-environment/commit/3fc991f123c5bb6678c812dba3a3adc6ee285d54))

## [0.11.4](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.11.3...v0.11.4) (2020-09-11)


### Bug Fixes

* **fixed description() and added tests:** the global allure API for .description() fix and tests ([a1dcd90](https://github.com/ryparker/jest-circus-allure-environment/commit/a1dcd90f75e53f075130eb8f640a36df6b987b88))

## [0.11.3](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.11.2...v0.11.3) (2020-09-03)


### Bug Fixes

* **allure.description:** allure.description should now fetch the currently active test ([f645bae](https://github.com/ryparker/jest-circus-allure-environment/commit/f645bae9dc0e48a23052ed51be873c52ea53d2ad))

## [0.11.2](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.11.1...v0.11.2) (2020-07-23)


### Bug Fixes

* **improved handling of comma separated pragmas:** splitting comma sparated values ([4bba0a9](https://github.com/ryparker/jest-circus-allure-environment/commit/4bba0a9135a4a2d4ad8cd13504b63c2e26d837c3))

## [0.11.1](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.11.0...v0.11.1) (2020-07-23)


### Bug Fixes

* **allure-reporter:** removed logs and trimming comma separated pragmas ([4f99fe5](https://github.com/ryparker/jest-circus-allure-environment/commit/4f99fe51986e1a4c7cc69565ba14b6fc8bfba214))

# [0.11.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.10.0...v0.11.0) (2020-07-15)


### Features

* **tms support:** enabled a tmsUrl to be setup and linked on the report. Updated README ([a9dbb72](https://github.com/ryparker/jest-circus-allure-environment/commit/a9dbb72578e35a576ac2a39d70eb8d863bc1b47d))

# [0.10.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.9.0...v0.10.0) (2020-07-15)


### Bug Fixes

* **fixed .git repo link:** reconfigured .git/config to use renamed repo ([f76b77f](https://github.com/ryparker/jest-circus-allure-environment/commit/f76b77f6c0853257e39924ba45004b375f70819a))


### Features

* **allure reporter:** implemented docblock pragma parsing which will be used to add more reporting ([7997047](https://github.com/ryparker/jest-circus-allure-environment/commit/79970479b8a5fa651da24144a7c7bcc9bb05843c))

# [0.9.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.8.0...v0.9.0) (2020-07-12)


### Features

* **environmentinfo:** added environmentInfo reporting. Improved test case reporting ([9ff3ce2](https://github.com/ryparker/jest-circus-allure-environment/commit/9ff3ce20940c89b326d75a9b0991ffb331763ba8))

# [0.8.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.7.2...v0.8.0) (2020-07-08)


### Features

* **project-wide:** added Jest specific categories, and improved error catching ([5c4ae36](https://github.com/ryparker/jest-circus-allure-environment/commit/5c4ae36c51f67aafcd1190cc6171b76bc7608986))

## [0.7.2](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.7.1...v0.7.2) (2020-07-08)


### Bug Fixes

* reconnected results dir option ([24df569](https://github.com/ryparker/jest-circus-allure-environment/commit/24df56929996c9ed6dfdc493781a77042a342074))

## [0.7.1](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.7.0...v0.7.1) (2020-07-08)


### Bug Fixes

* reverted environmentInfo feat ([9bf8dd2](https://github.com/ryparker/jest-circus-allure-environment/commit/9bf8dd25468fd3655bea228b6cb4eb553bc637bb))
* **allure-node-environment:** fixed typo ([d8592ed](https://github.com/ryparker/jest-circus-allure-environment/commit/d8592ede1dd95cd2fc621a2eccb8099e2ba26991))

# [0.7.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.6.1...v0.7.0) (2020-07-08)


### Features

* **allurereporter:** accepting environmentInfo and jiraUrl from jest environmentt options ([b2ae7ab](https://github.com/ryparker/jest-circus-allure-environment/commit/b2ae7abb07e21325cf9b6c0adfdee14179be0180))

## [0.6.1](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.6.0...v0.6.1) (2020-07-07)


### Bug Fixes

* **console logs:** fixed null docblockPragma console log condition ([bc41d2b](https://github.com/ryparker/jest-circus-allure-environment/commit/bc41d2bbbd21552f8f3b40824063c7184d3d4417))

# [0.6.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.5.0...v0.6.0) (2020-07-07)


### Features

* **package-wide:** exporting StepWrapper type and disabled some unnecessary console logs ([5763d91](https://github.com/ryparker/jest-circus-allure-environment/commit/5763d910c3e1a2e5c89c6ae085acab31cd21e190))

# [0.5.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.4.2...v0.5.0) (2020-07-07)


### Features

* **step-interface:** improved steps interface to support attachments and more ([a84c481](https://github.com/ryparker/jest-circus-allure-environment/commit/a84c4817bbd2bb4f0e428108891bfa7b87bec73e))

## [0.4.2](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.4.1...v0.4.2) (2020-07-06)


### Bug Fixes

* **allure-reporter.ts:** fixed null pointer exception ([0bbd59a](https://github.com/ryparker/jest-circus-allure-environment/commit/0bbd59ae5ca51c0fe44513bfebf62d271fe4a554))

## [0.4.1](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.4.0...v0.4.1) (2020-07-06)


### Bug Fixes

* **allure-reporter.ts:** fixed Snapshot failure handling ([4922775](https://github.com/ryparker/jest-circus-allure-environment/commit/492277591666964d6f60ad13eee021e60eca47ed))

# [0.4.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.3.0...v0.4.0) (2020-07-06)


### Features

* **project wide:** added support for the global "allure" report helper. Added better types support ([3cc3adc](https://github.com/ryparker/jest-circus-allure-environment/commit/3cc3adc70364a645b3d1051fa5a9210f68decc06))

# [0.3.0](https://github.com/ryparker/jest-circus-allure-environment/compare/v0.2.0...v0.3.0) (2020-07-06)


### Bug Fixes

* **package.json:** added dev dep @semantic-release/changelog ([df3f96c](https://github.com/ryparker/jest-circus-allure-environment/commit/df3f96c4d3260e65f91d4e969efa4f1b5c25b1b9))
* **package.json:** added dev dep @semantic-release/git for CI ([0f52366](https://github.com/ryparker/jest-circus-allure-environment/commit/0f52366e60f53803e2a2a3aee3d4bb50f6944a92))


### Features

* **package.json:** renamed npm package, better declarations, removed logs ([0d2cae0](https://github.com/ryparker/jest-circus-allure-environment/commit/0d2cae06f9314d414bc3075fbf0d32f8ab05c856))
