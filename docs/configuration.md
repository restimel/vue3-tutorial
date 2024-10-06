# Configuration

[Back to main page](./main.md)

## Properties

Properties defines how to use the component.

* **tutorial** {[`Tutorial`](#Tutorial)}: Describe the tutorial to show. If you
modify the tutorial when it is running it restarts from first step.
* **options** {[`Options`](#Step-options)} _(optional)_: Define the configuration at the _component_ level.
* **open** {`boolean`}: If set to `true`, the tutorial starts. If set to `false`,
the tutorial ends.
* **step** {`number | string`} _(optional)_: Start to the given step. If changed when a
tutorial is open, moves to given step. If the value is a `number`, this is the
step index. If the value is a `string`, target the step with the given name.
If no step match, it uses the default value. _Default value: `0`_

### properties example

```html
<vue3-tutorial
    :tutorial="tutorial"
    :options="{
        highlight: true,
        texts: {
            finishButton: 'Thank you',
        },
    }"
    :open="tutorialIsRunning"
/>
```

## Tutorial

This object describes the current tutorial.

Its properties are:
* **name** {string} _(optional)_: The name of the tutorial, mainly used for
debugging and to know which tutorial is running.
* **steps** {array of [`Step`](#step)}: It describes the step sequence. When a
step is finished, it displays the next one.
* **options** {[`Options`](#Step-options)} _(optional)_: Define the configuration at the _tutorial_ level.

### tutorial example

```javascript
{
    name: 'quick first overview',
    steps: [{
        title: 'Welcome',
        content: 'With these few steps you will discover how to use the application',
    }, {
        content: 'In the menu you will find many great tools.',
        target: '.menu',
    }],
    options: {
        mask: true,
    },
}
```

## Step

This object describes the current step.

Its properties are:
* [name](#name)
* [target](#target)
* [title](#title)
* [content](#content)
* [options](#options)
* [skipStep](#skipstep)
* [actionNext](#actionnext)
* [previousStep](#previousstep)
* [nextStep](#nextstep)
* [checkBeforeNext](#checkbeforenext) _not done yet_

They are all optional.

### name

type: _string_

defaultValue: `''`

This property is to identify the step. It can be used to retrieve the step.
The value should be unique or the wrong step can be returned.

### target

type: _string | string[]_

defaultValue: `''`

This property is to know which elements are important for the current step.

Its value should be a selector (or a list of selector) to the DOM elements
when the step is active.

It uses `document.querySelectorAll()` to identify elements.

The first element (if there are several) is considered as the main element.


Example:
```javascript
{
    target: '.help__btn',
}
```
```javascript
{
    target: ['form input[type="submit"]', 'form .name', 'form .phone-number'],
}
```

### title

type: _string_

defaultValue: `''`

The title to be displayed in the header of the step pop-up window.

Example:
```javascript
{
    title: 'Fill the form',
}
```

### content

type: _string_

defaultValue: _this is a mandatory property_

The main content to be displayed in the step pop-up window. It should explain
to user what to do.

It supports markdown. So to display a text on a new line, 2 line feeds (`\n`)
should be added.

Example:
```javascript
{
    content: 'After filling your **name** and your **phone number**, submit the _form_.',
}
```

[Read the document related to markdown to know the supported syntax.](./markdown.md)

### options

type: _[`Options`](#Step-options)_

defaultValue: `{}`

Define the configuration at the _step_ level.

Example:
```javascript
{
    options: {
        position: 'right',
        mask: false,
        highlight: true,
    },
}
```

### skipStep

type: _boolean | ((stepIdx: number) => boolean | Promise<boolean>) | CheckDescription_

defaultValue: `false`

Before displaying the step, it checks this property and if it returns `true` it moves directly to the next step.

This property is very useful to start tutorial in the correct context (for
example, if you need to change page first).

If the value is set to `true`, the step will always be skipped. It can be useful to disable a step.

It is possible to declare a [check expression](#check-expression). For more complex
action, it is possible to use a function (which could return either a boolean
or a promise which should return a boolean).

Example:
```javascript
{
    skipStep: () => return location.hash !== '#userForm'),
}
```

or

```javascript
{
    skipStep: {
        target: 'input.tos',
        check: 'is checked',
    },
}
```

### actionNext

type: _'' | 'next' | 'click' | 'mousedown' | 'mouseup' | 'mouseover' | Action_

defaultValue: `'next'`

Instead of displaying a next button, it is possible to force user to interact
with the GUI interface.

For more complex action, it is possible to declare an [Action expression](#action-expression).

Example:
```javascript
{
    actionNext: 'click', // force the user to click on the main target
}
```

```javascript
{
    // force user to fill the input with a text which contains "foo"
    actionNext: {
        action: 'input',
        target: 'input[name="first-name"]'
        check: 'contains',
        value: 'foo',
    },
}
```

### previousStep

type: _StepMovement_

_StepMovement_ = _[TargetStep](#targetstep) | ([TutorialInformation](#tutorialinformation)) => [TargetStep](#tsargetstep)_

defaultValue: `'-1'`

Describe to which step we should navigate to when leaving the current step with an action "previous".

> [!NOTE]
> If `previousStep` is set, then the "previous" button is always displayed.
> Otherwise it depends if previous step requires a special action.

Example:
```javascript
{
    previousStep: '-5', // when going back moves to 5 step behind.
}
```

Example:
```javascript
{
    previousStep: (state) => {
        if (state.currentIndex > 5) {
            /* If the current step is after the 5th step
             * move back to the step named "example" */
            return 'example';
        }
        /* otherwise move backward of 1 step */
        return '-1';
}
```

### nextStep

type: _StepMovement_

_StepMovement_ = _[TargetStep](#targetstep) | ([TutorialInformation](#tutorialinformation)) => [TargetStep](#tsargetstep)_

defaultValue: `'+1'`

Describe to which step we should navigate to when leaving the current step with an action "next" (or any action which move forward).

Example:
```javascript
{
    previousStep: '+5', // when going forward moves to 5 step afterward.
}
```

Example:
```javascript
{
    previousStep: (state) => {
        if (state.currentIndex < 5) {
            /* If the current step is before the 5th step
             * move forward to the step named "example" */
            return 'example';
        }
        /* otherwise move forward of 1 step */
        return '+1';
}
```

### checkBeforeNext

__Not done yet__

type: _false | ((stepIdx: number) => string | Promise<string>) | CheckBeforeNextDescription_

defaultValue: `false`

...

## Special types

### Check expression

Describe a condition check with properties.

* **target**: {`string`} the element where the condition should be checked.

* **timeout** _optional_: {`number`} Duration in milliseconds to find the
`target` before the timeout warning is triggered.
_Default value is the `timeout` defined in [step options](#step-options)._

And all properties from [`Expression`](#expression) in order to explain
expected condition.


### Action expression

Describe the action with properties.

* **action**: {`'click' | 'mousedown' | 'mouseup' | 'mouseover' | 'input' | 'change'`}
The kind of event to listen to.

* **target** _(optional)_: {`string`} the element where the event should be
listen to. If not defined it listens to the _main target_ of the step.

* **timeout** _optional_: {`number`} Duration in milliseconds to find the
`target` before the timeout warning is triggered.
_Default value is the `timeout` defined in [step options](#step-options)._

For actions `'input'` and `'change'`, it is needed to be completed with an
[`Expression`](#expression) about expected value.

It goes to next step when the listened element fulfill the condition detailed
by the expression.

### Expression

For actions, or for conditional steps, it would be useful to describe an
expression about which state we expect (for example, an exact value or an
element not be no more disabled).

The **Expression** is composed with 3 properties:

* **check**: {`ExpressionValueOperation | ExpressionUnaryOperation`} This is
the operation to do to check the condition.

* **value**: {`string`} The value to compare.
_Needed only with ExpressionValueOperation._

* **property** _(optional)_: Define which property to read on the element to
get the value (note: this is the JavaScript name that should be used, for
example, it should be `className` for `class` property).
_Default value is `'value'`._

If **check** is an `ExpressionUnaryOperation`, **value** should not be set.
if **value** is set, **check** is optional then it will be equivalent to
`'is'`.

#### ExpressionUnaryOperation

* **`'is empty'`**: the value should be empty
* **`'is not empty'`**: the value should not be empty
* **`'is checked'`**: the input should be ticked (should have attribute
`checked`)
* **`'is not checked'`**: the input should not be ticked (should not have
attribute `checked`)
* **`'is disabled'`**: the element should have attribute `disabled`
* **`'is not disabled'`**: the element should not have attribute `disabled`
* **`'is rendered'`**: the element should be available in DOM
* **`'is not rendered'`**: the element should not be available in DOM

#### ExpressionValueOperation

* **`'is'`**: the value of the element should be strictly equal to the given
value.
* **`'is not'`**: the value of the element should be different to the given
value.
* **`'contains'`**: the value of the element should contain the given value.
* **`'does not contain'`**: the value of the element should not contains the
given value.

## Step options

This allows to configure how a step should behave.

**Options** can be set at 4 different levels:
* default
* component
* tutorial
* step

If a same option is defined at 2 different levels, the more specific will be
used. It means that _step_ options will be always used over _tutorial_ options.

You cannot change the _default_ option. The most global option you can change
is the _component_ option.

At each level, you can set all or some part of the properties (or none of them
to keep the more global configuration).

**Options** are used to define a different step behavior. This is an object
which have the following properties (each property is optional):

* **position** {[`Placement`](#Placement)}: Position of the step
window related to the main target element. _default value: `'auto'`_
* **highlight** {`boolean | `[`ElementSelector`](#ElementSelector)}: If `true`,
highlights the main target. The class `'vue3-tutorial-highlight'` is added to
this element. If a selector is given, all matching elements will have this class.
_default value: `true`_
* **classForTargets** {`string`}: Class added to all targets.
This can be useful if you want that these elements use one of you own class.
Default value: `''`_
* **arrow** {`boolean | `[`ElementSelector`](#ElementSelector)}: If `true`,
displays an arrow pointing to the main target. If a selector is given, arrows
pointing to all matching elements will be added.
_default value: `true`_
* **arrowAnimation** {`boolean`}: If true, the arrow is animate.
_Default value: `true`_
* **mask** {`boolean | `[`ElementSelector`](#ElementSelector)}: If true, a mask
is added over the page except over targets. If a selector is given, it uses
these elements instead of targets to create holes. An empty array (`[]`), adds
a mask without any holes.
_Default value: `true`_
* **maskMargin** {`number`}: Margin (in px) between target
elements and mask. _Default value: `0`_
* **bindings** {[`Bindings`](#Bindings)` | false`}: Define keys the
user can type for different actions (next, previous, skip). If `false` then no
keys will triggers these actions.
* **focus** {`boolean | `[`FocusBehavior`](#FocusBehavior)}: Define what element
to focus when changing step. `true` is equivalent to `'main-target'`. `false`
is equivalent to `'no-focus'`. Note that setting focus to some elements may
break the key binding which is only active if no elements are focused.
_Default value: `'no-focus'`_.
* **muteElements** {`false | `[`ElementSelector`](#ElementSelector)}: Avoid interaction on these elements. This option should be used to keep user inside the step and to not allow different actions.
If `false`, no elements are muted.
_Default value: `false`_.
* **scroll** {`boolean | `[`ScrollBehavior`](#ScrollBehavior)}: Define how to
behave when main target element is not visible in the page (due to scroll).
`true` is equivalent to `'scroll-to'`. `false` is equivalent to `'no-scroll'`.
_Default value: `'auto-scroll'` on main target element_.
* **sticky** {`boolean`}: Allow or not to move the step window. If the option is set to `true`, user is not allowed to move the window. If `false`, user can move the step window to a different position.
_Default value: `false`_.
* **texts** {[`Dictionary`](#Dictionary)}: Allow to change texts which are displayed in vue3-tutorial. This can be used for translations or to
display your own texts.
* **timeout** {`number`}: Duration in milliseconds before the
timeout error is triggered. During this period, it will continually analyze
DOM in order to find all targets. It continues until all targets are found
or the timeout is reached. A value of 0 means that all targets should be
already in DOM when the step is displayed. _Default value: `3000`_
* **teleport** {`boolean | HTMLElement`}: The container where the window should be displayed.
If the value is `true`, the window is displayed inside `document.body`. If `false`, the window is not moved.
_Default value: `true`_
* ~~**debug** {`boolean | number[]`}~~: **[Deprecated]** _use `logs.logLevel`
or `logs.allowCodes`._<br>
If true, it logs in console and emits error
at some key features in the library. If the value is a number array, it only
logs when given error codes are prompted. _Default value: `false`_
* **logs** {[`Logs`](#Logs)}: Allow to manage logs. Which ones to emit and if
should print in the console or not.
Read [Errors section](./errors.md) for more information.

In addition, for the _component_ option only:
*  ~~**messageLog** {`string | null`}~~:  **[Deprecated]** _use `logs.messageLog`._<br>
Define which message should be prompted
in console when an error or a log is emitted. If the value is `null` nothing
is prompted in the console but the code is still emitted.
**This value is read only when the component is mounted.**
_Default value: `'vue3-tutorial [%d]: %s'`_

### Placement

A string which can have only one of these values:

* **`'auto'`**: Try to choose the best position according where the element
is in the page.
* **`'center'`**: Do not point to an element and put the step window at the
center of the screen.
* **`'bottom'`**: Under the main target.
* **`'top'`**: Over the main target.
* **`'left'`**: At left of the main target.
* **`'right'`**: At right of the main target.
* **`'hidden'`**: Do not display the step window.

Example:
```javascript
{
    position: 'center',
}
```

### ElementSelector

This is either a string or an array of string, corresponding to a selector
(or a list of selector) to the DOM elements. Internally, it uses
`document.querySelectorAll`.

If the selector is not correct, it generates an error with [code 300](./errors.md#error-3xx).
If the `querySelectorAll` does not find any elements within the `timeout`
duration, it will generate an error width [code 324](./errors.md#error-3xx)
or [code 224](./errors.md#error-2xx) depending on the purpose of the query
(highlight, arrows, mute, and mask generates warning).

Example:
```javascript
{
    highlight: ['button.primary-action', '#main-action'],
}
```

### Bindings

`Binding` is a structure where you describe which keys should be awaited to
trigger the action.

All properties accept either a string or an array of string (in such case any
of these keys will trigger the action).
The string should be the expected key (it can be any value returned by
[event.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
).

* **next**: When triggered the tutorial goes to the next step (except if the
current step requires an action from user). _Default value: `['ArrowRight', 'Enter']`_.
* **previous**: When triggered the tutorial goes to previous step (except if
the previous step requires an action from user). _Default value: `'ArrowLeft'`_.
* **skip**: When triggered the tutorial tries to ends (user still has to confirm). _Default value: `'Escape'`_.

Example:
```javascript
{
    bindings: {
        next: ['f', 'PageDown'], // if user types 'f' or page-down key, it goes to next step.
        previous: ['p', 'PageUp'], // if user types 'p' or page-up key, it goes to previous step.
        // skip is not defined so it keeps default value (with escape key)
    },
}
```

### FocusBehavior

Define what to do about focus when step is changing.

* **`'no-focus'`**: Remove focus on any elements. _This is the default value_
* **`'keep'`**: Keep the focus on the current active element.
* **`'main-target'`**: Set focus to the main target of the step.
* **`{ ... }`**:
    * **target** `string`: set focus to the given target element.
    * **timeout** _optional_: {`number`} Duration in milliseconds to find the
`target` before the timeout warning is triggered.
_Default value is the `timeout` defined in [step options](#step-options)._

### ScrollBehavior

Define how to behave when target element is not visible due to scroll.

* **`'no-scroll'`**: Do not change the page position.
Arrow is added to show where to scroll in order to see the target element.
* **`'scroll-to'`**: When changing step automatically scroll to the target.
* **`'auto-scroll'`**: When changing step automatically scroll to the target
if the target is not visible.
 _This is the default value_
* **`{ ... }`**:
  * **target** `string`: Scroll to this element instead of the main target.
  * **scrollKind** _optional_: {`'no-scroll' | 'scroll-to' | 'auto-scroll'`} Describe if we should automatically scroll to the target or not.
  _Default value is `'auto-scroll'`._
  * **timeout** _optional_: {`number`} Duration in milliseconds to find the
`target` before the timeout warning is triggered.
_Default value is the `timeout` defined in [step options](#step-options)._

### TargetStep

Define to which step we should navigate to.

Type: `number | string`

If the type is `number`, it targets the step to the given index.

If the type is `string`, and starts with `'+'` and followed by digits (`+X`),

If the type is `string`, and starts with `'-'` and followed by digits (`-X`),
it target the previous X step.

If the type is `string`, it targets the step with the given `name`.

If no steps match, it will use the default value.

> [!WARNING]
> Giving a negative number value, will be considered as invalid and so it will returns the default value.

### TutorialInformation

Gives some global information about the tutorial and the current step.

It is provided when changing step or for debug information.

This is an object with the following properties:

* **tutorial** _[Tutorial](#tutorial)_: The current tutorial.
* **step** _[Step](#step)_: The current step.
* **currentIndex** _number_: The current index of the step.
* **nbTotalSteps** _number_: The number of steps which are in the tutorial.
* **previousStepIsSpecial** _boolean_: `true` is the step one step before does not have a simple 'next' action.

### Dictionary

An object with the following properties (their values are the string to be
displayed):

* **finishButton**: The text on the "Finish" button.
* **nextButton**: The text on the "Next" button.
* **previousButton**: The text on the "Previous" button.
* **skipButtonTitle**: The text on the title of the "Skip" button (the × on
the window).
* **skipConfirm**: The text displayed on the confirm dialog before skipping
the tutorial.
* **stepState**: The state of the step (Default: `'step %(currentStep)s / %(totalStep)s'`)

### Logs

An object with the following properties:

* **logLevel** _TutorialErrorStatus_: Indicate which logs to emit. Logs with
the given level and more important are emitted.
<br>`'log'`/`debug` < `'info'` < `'warning'` < `'error'` < `'none'`<br>
_Default value: `'warning'`_
* **allowCodes** _number[]_: Emit logs with these codes even if they are lower
than `logLevel`.<br>
_Default value: `[]`_
* **messageLog** _string | boolean_: Define how messages should be prompted
in console when an error or a log is emitted.<br>
If the value is `false`, nothing is prompted in the console but the code is
still emitted.<br>
If the value is `true`, the default message is prompted.<br>
If the value is a string, this message will be prompted (code and details are
still provided).<br>
_Default value: `'vue3-tutorial [%d]: %s'`_

To know more about Logs and Errors read the [Error section](./errors.md).
