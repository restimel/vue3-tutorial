# Errors management

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

### Warning (2xx)

| Code | Message | Details | What does it means? |
|:----:|---------|---------|---------------------|
|200 | Unknown error code | - **code**: the unknown error code<br> - **details**: the details given to the error | The given error code is not known |
|201 | Unknown label | - **label**: the unknown label | The text to be displayed is missing from dictionary. |

### Error (3xx)

| Code | Message | Details | What does it means? |
|:----:|---------|---------|---------------------|
|300 | Selector is not valid | - **selector**: the broken selector<br> - **purpose** - explain the purpose of this selector (can be `'targets'`, '`nextAction`', or `'focus'`)<br> - **error**: the javascript error | The DOM selector given to `querySelector` is not valid. Elements cannot be found correctly.  |
|301 | Unknown operation | - **operation**: the unknown operation | In an expression operation (action, skiptStep, nextStep), the check operator is not known. It is not possible to evaluate the expression. |
|302 | Step not found | - **nbTotalSteps**: the number of steps in the tutorial<br> - **index**: the index not found | In the tutorial, the step is missing for given index. |
|303 | Tutorial is not defined | | The tutorial i snot defined while we try to start the tour |
|324 | Timeout | - **timeout**: the timeout duration<br> - **selector**: the selector which has expired<br> - **purpose** - explain the purpose of this selector (can be `'targets'`, '`nextAction`', or `'focus'`) | Some elements have not been found during the elapsed time. |


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
