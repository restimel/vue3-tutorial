# Debug management

[Back to main page](./main.md)

The debug options are useful for debugging to understand why it doesn't work
as expected.

When the logLevel option is set to `'log'` (or `'debug'`) or by enabling only
some trace with `allowCodes`
([see `logs` configuration options](./configuration.md#Logs)),
it prompts in console a log related to the debug trace.
An error is also emitted like any other [errors](./errors.md), the code value
is between 0 and 99.

## Error code (0xx)

### Related to the component (0 → 9)

| Code | Message | Details | What does it means? |
|:----:|---------|---------|---------------------|
|0 | Tutorial mounted | - **options**: the computed options at tutorial level<br> - **open**: the `open` prop<br> - **tutorial**: the tutorial given in prop | The lib component is mounted |
|1 | Tutorial unmounted | - **options**: the computed options at tutorial level<br> - **open**: the `open` prop<br> - **tutorial**: the tutorial given in prop | The lib component has been unmounted |
|2 | Tutorial started | - **options**: the computed options at tutorial level<br> - **currentIndex**: the current step index | A tutorial has been started |
|3 | Tutorial stopped | - **options**: the computed options at tutorial level<br> - **currentIndex**: the current step index | A tutorial has been stopped |

### Related to steps (20 → 29)

| Code | Message | Details | What does it means? |
|:----:|---------|---------|---------------------|
|20 | Step mounted | - **options**: the computed options at step level<br> - **step**: the description of the `step` object<br> - **[tutorialInformation](./configuration.md#tutorialinformation)**: some global information about the tutorial | The step component is mounted |
|21 | Step unmounted | - **options**: the computed options at step level<br> - **step**: the description of the `step` object<br> - **[tutorialInformation](./configuration.md#tutorialinformation)**: some global information about the tutorial | The step component has been unmounted |
|22 | Step changed | - **options**: the computed options at step level<br> - **step**: the description of the `step` object<br> - **[tutorialInformation](./configuration.md#tutorialinformation)**: some global information about the tutorial | The step has been changed |
|24 | Fetch elements | - **options**: the computed options at step level<br> - **ref**: an internal id related to the request<br> - **startTime**: The timestamp of the first request<br> - **currentTime**: The timestamp of the current request | All needed elements for the step are checked in the DOM |
|25 | Target elements change | - **options**: the computed options at step level<br> - **[tutorialInformation](./configuration.md#tutorialinformation)**: some global information about the tutorial<br> - **elements**: list of the targeted elements<br> - **elementsBox**: coordinates in the window of these elements<br> - **hasHiddenElement**: `true` if any elements are hidden. | The targets elements have been changed (either new elements or their position) |
|26 | DOM elements targeted | - **options**: the computed options at step level<br> - **[tutorialInformation](./configuration.md#tutorialinformation)**: some global information about the tutorial<br> - **elements**: list of the targeted elements<br> - **selector**: The target selector used to find elements. | The targets elements have been identified |
|27 | No elements found | - **options**: the computed options at step level<br> - **[tutorialInformation](./configuration.md#tutorialinformation)**: some global information about the tutorial<br> - **selector**: The target selector used to find elements. | No targets elements have been found for this selector. |
|28 | Move to step | - **options**: the computed options at step level<br> - **oldIndex**: The step index from where the movement starts.<br> - **newIndex**: The step index where the movement ends.<br> - **targetIndex**: The step index which is targeted by "`target`".<br> - **target**: the value of the target movement.<br> - **info**: some information about why newIndex is `-1`.  | Action to identify to which step it should move to. |
