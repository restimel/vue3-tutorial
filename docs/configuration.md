# Configuration

[Back to main page](./main.md)

## Properties

Properties defines how to use the component.

* **tutorial** {[Tutorial](#Tutorial)}: Describe the tutorial to show. If you
modify the tutorial when it is running it restarts from first step.
* **options** {[Options](#Step_options)} _(optional)_: Define the configuration at the _component_ level.
* **open** {boolean}: If set to `true`, the tutorial starts. If set to `false`,
the tutorial ends.

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
* **steps** {array of [Step](#step)}: It describes the step sequence. When a
step is finished, it displays the next one.
* **options** {[Options](#Step_options)} _(optional)_: Define the configuration at the _tutorial_ level.

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
* [target](#target)
* [title](#title)
* [content](#content)
* [options](#options)
* [skipStep](#skipStep)
* [actionNext](#actionNext)
* [checkBeforeNext](#checkBeforeNext)

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

Example:
```javascript
{
    content: 'After filling your name and your phone number. Submit the form.',
}
```

### options

type: _[Options](#Step_options)_

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

__Not done yet__

type: _boolean | ((stepIdx: number) => boolean | Promise<boolean>) | VerificationDescription_

defaultValue: `false`

Before displaying the step, it checks this property and if it returns `true` it moves directly to the next step.

This property is very useful to start tutorial in the correct context (for
example, if you need to change page first).

If the value is set to `true`, the step will always be skipped. It can be useful to disable a step.

Example:
```javascript
{
    skipStep: () => return location.hash !== '#userForm'),
}
```

### actionNext

type: _'' | 'next' | 'click' | 'mousedown' | 'mouseup' | 'mouseover' | Action_

defaultValue: `'next'`

Instead of displaying a next button, it is possible to force user to interact
with the GUI interface.

For more complex action, it is possible to declare an [Action expression](#action).

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

### checkBeforeNext

__Not done yet__

type: _false | ((stepIdx: number) => string | Promise<string>) | CheckBeforeNextDescription_

defaultValue: `false`

...

## Special types

### Action

Describe the action with properties.

* **action**: {`'click' | 'mousedown' | 'mouseup' | 'mouseover' | 'input' | 'change'`}
The kind of event to listen to.

* **target** _(optional)_: {`string`} the element where the event should be
listen to. If not defined it listens to the _main target_ of the step.

For actions `'input'` and `'change'`, it is needed to add
[Expression](#expression) about expected value.

It goes to next step when the listened element fulfill the condition detailed
by the expression.


### Expression

For actions, or for conditional steps, it would be useful to describe an
expression about which state we expect (for example, an exact value or an
element not be no more disabled).

The **Expression* is composed with 2 properties:

* **check**: {`ExpressionValueOperation | ExpressionUnaryOperation`} This is
the operation to do to check the condition.

* **value**: {`string`} The value to compare.

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

#### ExpressionUnaryOperation

* **`'is'`**: the value of the element should be strictly equal to the given
value.
* **`'is not'`**: the value of the element should be different to the given
value.
* **`'contains'`**: the value of the element should contain the given value.
* **`'do not contain'`**: the value of the element should not contains the
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
which have the following properties:

* **position** {`[Placement](#Placement)`} _(optional)_: Position of the step
window related to the main target element. _default value: `'auto'`_
* **highlight** {`boolean`} _(optional)_: Highlight the main target. The class
`'vue3-tutorial-highlight'` is added to this element. _default value: `true`_
* **classForTargets** {`string`} _(optional)_: Class added to all targets.
This can be useful if you want that these elements use one of you own class.
Default value: `''`_
* **arrowAnimation** {`boolean`} _(optional)_: If true, the arrow is animate.
_Default value: `true`_
* **mask** {`boolean`} _(optional)_: If true a mask is added over the page
except over targets. _Default value: `true`_
* **maskMargin** {`number`} _(optional)_: Margin (in px) between target
elements and mask. _Default value: `0`_
* **bindings** {`[Bindings](#Bindings) | false`} _(optional)_: Define keys the
user can type for different actions (next, previous, skip). If `false` then no
keys will triggers these actions.
* **texts** {`[Dictionary](#Dictionary)`} _(optional)_: Allow to change texts which are displayed in vue3-tutorial. This can be used for translations or to
display your own texts.
* **timeout** {`number`} _(optional)_: Duration in milliseconds before the
timeout error is triggered. During this period, it will continually analyze
DOM in order to find all targets. It continues until all targets are found
or the timeout is reached. A value of 0 means that all targets should be
already in DOM when the step is displayed. _Default value: `3000`_

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

### Bindings

`Binding` is a structure where you describe which keys should be awaited to
trigger the action.

All properties accept either a string or an array of string (in such case any
of these keys will trigger the action).
The string should be the expected key (it can be any value return by
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
