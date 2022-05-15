# Getting started

[Back to main page](./main.md)

## Installation

### NPM

```
$ npm install vue3-tutorial
```

### Manual installation

## Usage

Import the vue3-tutorial component in your template anywhere in your app.
Pass it a `Tutorial` description.

```javascript
<template>
  <div>
    <div class="example-1">
        A DOM element on your page.
        The first step will pop on this element.
    </div>
    <div id="example-2">
        Another DOM element on your page.
        The second step will pop on this element.
    </div>
    <div data-example="property">
        A third DOM element on your page.
        The third and final step will pop on this element.
    </div>

    <Vue3Tutorial :tutorial"tutorial" open />
  </div>
</template>

<script>
  import Vue3Tutorial from 'vue3-tutorial';

  export default {
    name: 'tutorial-example',
    data() {
      return {
        tutorial: {
          name: 'Example',
          steps: [{
            target: '.example-1',  // a selector to the wanted element. document.querySelector() is used under the hood
            title: 'Get Started',
            content: 'Discover Vue3 Tutorial!',
          }, {
            target: '#example-2',
            title: 'The second step',
            content: 'It can be customized easily and finely.'
            options: {
              position: right,
            },
          }, {
            target: '[data-example="property"]',
            content: 'To finish this tutorial, you should click on the element.',
            actionNext: 'click,
            options: {
              highlight: true,
            },
          }],
        },
      };
    },
    components: {
      Vue3Tutorial,
    }
  }
</script>
```

The target property of each step can target a DOM element in any component of
your app as long as it exists in the DOM when the concerned step pops up (a
delay is possible, if the component is rendered asynchronously).

The tutorial starts as soon as `open` is set to `true`.

For a more detailed documentation, checkout the [configuration docs](./configuration.md).
