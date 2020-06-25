import type { Event, State } from 'jest-circus'
import type { Config } from '@jest/types'
import { Allure, AllureRuntime } from 'allure-js-commons'
import NodeEnvironment from 'jest-environment-node'
// import stripAnsi from 'strip-ansi'

// function formatErrors(allure: Allure) {
//   allure.suites.forEach((suite) => {
//     suite.testcases.forEach((test) => {
//       if (test.failure != undefined) {
//         test.failure.message = stripAnsi(test.failure.message)
//         test.failure['stack-trace'] = stripAnsi(test.failure['stack-trace'])
//       }
//     })
//   })
// }

export default class AllureEnvironment extends NodeEnvironment {
  // public allure: AllureRuntime

  constructor(config: Config.ProjectConfig) {
    super(config)
    console.log(`constructor arguments: ${JSON.stringify(arguments, null, 2)}`)
    // this.allure = new AllureRuntime({ ...config, resultsDir: 'allure-results' })
  }

  async setup() {
    await super.setup()
    console.log(`constructor arguments: ${JSON.stringify(arguments, null, 2)}`)
  }

  async teardown() {
    await super.teardown()
    console.log(`constructor arguments: ${JSON.stringify(arguments, null, 2)}`)
  }

  handleTestEvent(event: Event, state: State) {
    console.log(
      `handleTestEvent arguments: ${JSON.stringify(arguments, null, 2)}`
    )
    switch (event.name) {
      case 'finish_describe_definition':
        // this.allure.startSuite(event.blockName)
        break
      case 'test_fn_start':
        // this.allure.startCase(event.test.name)
        break
      case 'test_fn_success':
        // this.allure.endCase('passed')
        break
      case 'test_fn_failure':
        // this.allure.endCase('failed', event.error)
        break
      case 'run_describe_finish':
        // formatErrors(this.allure)
        // Catch error thrown by second describe finish
        try {
          // this.allure.endSuite()
        } catch (error) {
          if (error.message != "Cannot read property 'end' of undefined") {
            throw error
          }
        }
        break
      default:
        break
    }
  }
}
