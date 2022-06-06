# Emit

[Back to main page](./main.md)

Events which are emitted bu vue3-tutorial component.

* `'changeStep'`: Triggered when step is changed (for any reason).
The first argument is the new step index.
* `'nextStep'`: Triggered when moving to a step forward.
The first argument is the new step index.
* `'previousStep'`: Triggered when moving to a step backward.
The first argument is the new step index.
* `'start'`: Triggered when the tutorial starts.
The first argument is the new step index.
* `'stop'`: Triggered when the tutorial ends.
The first argument is the step index when finished.
The second argument is a boolean which is `true` if the tutorial has been completed (not skipped).
* `'error'`: Triggered when any error is encountered.
The argument is an object described in [this documentation](./errors.md).

### usage example

```html
<vue3-tutorial
    :tutorial="tutorial"
    @changeStep="(idx) => console.log('Tutorial has moved to step %d', idx)"
/>
```