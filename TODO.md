= Road-map =

== Target: v1.0 ==

* steps
    * scrollIntoView
        * scroll only if element is not visible
    * Window
        * Position when target is too big and there is not enough space outside
* documentation
    * README
        * gif
        * important features
    * how to configure
        * step
            * checkNext
        * split file to avoid having a big file
    * Live example
        * create simple tutorial
        * change highlight color in order to see it on background main color
            → this may be a common pbl
* Compare with vue-tour
    * missing feature
    * How to migrate → documentation
    * What is better in vue3-tutorial
* Compare with EnjoyHint
    * great feature
    * presentation

== improvement (for after v1.0) ==

* Errors
    * Add info
    * Add options to filter what is emitted
* Pause
    * restart at previous index
* Step
    * check that next is ok
        * block next action
        * disable button
        * enable button
    * Expression
        * check url
    * interaction action
        * timer
        * "next" when clicking anywhere
        * keyboard event about key (note that keybinding may already be used for that)
    * options
        * hidden progress
        * No interaction at all (user cannot click on any elements (should it be the default for "next"?))
            * Follow common API
        * highlight in a different styles
        * arrow
            * Allow to choose arrows direction
    * header
        * status (add icon on the right)
            * working (spinner)
            * Error (danger sign)
            * custom
        * progress status with progress bar (and/or %)
    * button section
        * When interactive, add a text to tell what is expected
    * Workflow
        * Go to step X (instead of next step), which should help to manage errors
* Window
    * Allow user to move the window
    * improve auto placement
        * to avoid to be over secondary targets
        * to prefer left/right when target is at sides
    * allow to change HTML
    * update position of all targets (when scroll or DOM change)
* Skip
    * replace confirm dialog by modal dialog
* Options
    * title (mainly for tutorial, to set title for all steps in one tutorial, maybe remove the title property from step)
* Global
    * allow to have several instance of vue3-tutorial on the same page
        * do not return a singleton (labels, keyBinding)
* documentation
    * how to configure
        * step
            * checkNext
    * Configuration example (for some usage)

* Bugs
    - window position with big element which takes all the screen