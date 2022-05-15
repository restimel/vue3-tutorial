# Configuration

[Back to main page](./main.md)

## Properties

Properties defines how to use the component.

* **tutorial** {[Tutorial](#Tutorial)}: Describe the tutorial to show. If you
modify the tutorial when it is running it restarts from first step.
* **options** {[Options](#Options)} _(optional)_: Define the configuration at the _component_ level.
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
* **options** {[Options](#Options)} _(optional)_: Define the configuration at the _tutorial_ level.

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

type: _[Options](#Options)_

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

__Not done yet__

type: _'none' | 'click' | 'mousedown' | 'mouseup' | 'hover' | Action_

defaultValue: `'none'`


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

### checkBeforeNext

__Not done yet__

type: _false | ((stepIdx: number) => string | Promise<string>) | CheckBeforeNextDescription_

defaultValue: `false`

...

#### Action

Describe the action with properties.

* **type**: `'click' | 'mousedown' | 'mouseup' | 'hover' | 'input' | 'change'`
The kind of event to listen to.

* **target**: `string` the element where the event should be listen to. If
not defined it listen to the _main target_ of the step.

* **value**: `string` The value to compare (needed for the events `'input'`
and `'change'`). It goes to next step when the target element has this value.


## Options

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

**Options** are used to define a different behavior. This is an object which have the following properties:

*
