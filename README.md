# jest-circus-allure-reporter

A Jest reporter that creates Allure reports

## Lifecycle events

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
