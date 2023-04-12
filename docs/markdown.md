# Markdown

[Back to main page](./main.md)

This page is about markdown that can be used inside Vue3-tutorial.

In order to customize text boxes, it is possible to use different tags to
style your texts.

You can change the display by overriding the css applied on them.<br>
[Read the corresponding documentation page for more information about CSS class used for markdown.](./css.md#markdown)

## Basic style

These tags could be used inline.

Name | code | example
---- | ---- | -------
Italic | `*text*` | *text*
Italic | `_text_` | _text_
Bold | `**text**` | **text**
Bold | `__text__` | __text__
Strike | `~~text~~`| ~~text~~
Image| `![alt text](url)`| ![a smiley](./images/smiley.svg)
Link | `[text](url)`| [main documentation](./main.md)
Inline code | `` `text` ``| `text`
Subscript | `~text~`| X<sub>text</sub>
Superscript | `^text^`| X<sup>text</sup>

## Color

_This is not standard markdown_

Name | code
---- | ----
Color | `{color:text}`

* color: could be any css value
* text: is the content that should be modified (this could be markdown text).

## Horizontal line

This should be alone on a line.

Name | code
---- | ----
Horizontal line | `---`
Horizontal line | `___`

Example:
```markdown
___
```
Result:
___


## Headers

This should be added at start of a line.

Name | code
---- | ----
Header level 1 | `# text`
Header level 2 | `## text`
Header level 3 | `### text`
Header level 4 | `#### text`
Header level 5 | `##### text`
Header level 6 | `###### text`

Example:
```markdown
# Example header level 1
## Example header level 2
### Example header level 3
#### Example header level 4
##### Example header level 5
###### Example header level 6
```
Result:
# Example header level 1
## Example header level 2
### Example header level 3
#### Example header level 4
##### Example header level 5
###### Example header level 6

## Multiline code

This should be added at start of a line and the end should be alone on the line.

Name | code
---- | ----
Code | `` ``` ``
Code | `` ~~~ ``
Code with language | `` ```language ``
Code with language | `` ~~~language ``

Example:
~~~
```
some code in any language
```
~~~
Result:
```
some code in any language
```

Example:
~~~
```markdown
some **markdown** code
```
~~~
Result:
```markdown
some **markdown** code
```

To enable syntax highlighting, you should install corresponding plugin.

A class `language-<language>` is added to the element.
The attribute `data-language=<language>` is added to the element.
The element containing the code is a `<code>` element.

## Quote

This should be added at start of a line

Name | code
---- | ----
Quote| `>text`
Quote with class| `>:class1 class2:text`

Example:
~~~
```
> A quote.
> And another line for the same quote.
```
~~~
Result:
> A quote.
> And another line for the same quote.

Adding a class allow to add tips, or to warn about some points.
But it is up to you to style this element to look what you want.

There are some class which comes with existing style:

Class name | style | purpose
---------- | ----- | -------
info       | Display a blue box with a light bulb (💡) | For information, or hints
warning    | Display an orange box with a warn sign (⚠️) | To warn user about something
danger     | Display a red box with a warn sign (⛔) | For something very painful

## List

This should be added at start of a line

Name | code
---- | ----
Unordered list | `* text`
Unordered list | `- text`
Ordered list | `1. text`

Ordered list can be any numbers (whatever the number it will continue the
ordered list).

To create sub-list, space indentation should be added.

Example:
```
* an item
* a second item
  * a sub-item
  * a second sub-item
* a third item
```

Result:
* an item
* a second item
  * a sub-item
  * a second sub-item
* a third item

Example:
```
1. an item
1. a second item
  1. a sub-item
  1. a second sub-item
1. a third item
```

Result:
1. an item
1. a second item
    1. a sub-item
    1. a second sub-item
1. a third item

## Icons or special marker

_This is not standard markdown_

It is possible to create a special element only to add class.

Name | code | HTML Result
---- | ---- |
Class element | `:text:` | `<span class="text"></span>`

This can be useful to display icons.
For example, `:fa-regular fa-thumbs-up:` to display a font-awesome icon.
:warning: To display font-awesome icons, you need to install FontAwesome.
