# Errors management

[Back to main page](./main.md)

When the error event is emitted it comes with an argument which explains the
error.

This is an object with the following attributes:
 * **code**: a code in order to identify the error (see below).
 * **message**: a message explaining the error
 * **details**: an object containing more information about the error.
 The content depends on the error code (see below).
 * **stepIndex**: the index value of the current step when the error happens.
 * **tutorialName**: the tutorial name of the current tutorial when the error happens.

## Error code

The error code is to identify the error. Values from 0 to 99 are related to
debug logs. Values from 100 to 199 are related to info logs. Values from 200 to
299 are related to warning (issues happen but it won't be a big problem to
continue the steps). Values from 300 to 399 are related to errors (the step
cannot behave correctly or going to next steps is problematic).

### Log/Debug (0xx)

[Read the dedicated page related to Debug management.](./debug.md)

### Warning (2xx)

| Code | Message | Details | What does it means? |
|:----:|---------|---------|---------------------|
|200 | Unknown error code | - **code**: the unknown error code<br> - **details**: the details given to the error | The given error code is not known |
|201 | Unknown label | - **label**: the unknown label | The text to be displayed is missing from dictionary. |
|202 | Not able to check if step can be skipped | - **index**: the index of the step where the skip test has failed<br> - **fromIndex**: the index of the step from where the tutorial was just before.<br> - **error**: the javascript error | An error occurred when testing to skip the current step. |
|203 | Tutorial has no active steps | | The tutorial has no steps or they are all skipped. |
|204 | There are no previous step | | The tutorial has no steps or they are all skipped. |
|224 | Timeout | - **timeout**: the timeout duration<br> - **selector**: the selector which has expired<br> - **purpose** - explain the purpose of this selector (is of type [`ErrorSelectorPurpose`](#ErrorSelectorPurpose)) | Some elements have not been found during the elapsed time. |

### Error (3xx)

| Code | Message | Details | What does it means? |
|:----:|---------|---------|---------------------|
|300 | Selector is not valid | - **selector**: the broken selector<br> - **purpose** - explain the purpose of this selector (is of type [`ErrorSelectorPurpose`](#ErrorSelectorPurpose))<br> - **error**: the javascript error | The DOM selector given to `querySelector` is not valid. Elements cannot be found correctly.  |
|301 | Unknown operation | - **operation**: the unknown operation<br> - **purpose** - explain the purpose of this selector (is of type [`ErrorSelectorPurpose`](#ErrorSelectorPurpose))  | In an expression operation (nextAction, skipStep, nextStep), the check operator is not known. It is not possible to evaluate the expression. |
|302 | Step not found | - **nbTotalSteps**: the number of steps in the tutorial<br> - **index**: the index not found | In the tutorial, the step is missing for given index. |
|303 | Tutorial is not defined | | The tutorial is not defined while the tour is started |
|324 | Timeout | - **timeout**: the timeout duration<br> - **selector**: the selector which has expired<br> - **purpose** - explain the purpose of this selector (is of type [`ErrorSelectorPurpose`](#ErrorSelectorPurpose)) | Some elements have not been found during the elapsed time. |


### Types
#### `ErrorSelectorPurpose`

A string which indicates what action was done when the error was prompted.
It can have one of this values:
 * `'targets'`: When trying to get the main elements of the step.
 * `'nextAction'`: When trying to get the element where listener should be
 added to go to next step.
 * `'focus'`: When trying to get the element to set focus on.
 * `'scroll'`: When trying to get the element to scroll to.
 * `'skipStep'`: When trying to check if the step should be skipped.


## `errorStatus(code)`

`errorStatus` is a function which can help you to know what kind of error was
triggered depending on the code returned.

```javascript
import { errorStatus } from 'vue3-tutorial';

errorStatus(205); // returns 'warning'
errorStatus(302); // returns 'error'

```

The return type is `TutorialErrorStatus`, the possible values are:
`'log'`, `'info'`, `'warning'`, or `'error'`.
