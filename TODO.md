= Road-map =

== Target: v1.0 ==

* steps
    * scrollIntoView
        * scroll only if element is not visible
    * Window
        * movable window
* documentation
    * README
        * gif
        * important features
    * how to configure
        * step
            * checkNext
        * split file to avoid having a big file
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
    * restart at previous index [this should now be possible to do this with "step" props]
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
    * Actions
        * Allow to do some action on the page
            * click
            * trigger keyboard event
            * fill fields (and trigger input/change event)
* Window
    * improve auto placement
        * to avoid to be over secondary targets
        * to allow to change order preference
    * allow to change HTML
    * update position of all targets (when scroll or DOM change)
* Interruption
    * add some condition to check and interrupt the tutorial if it appears
        * Propose some actions in such case (steps, move to tutorial step, stop tutorial)
* Skip
    * replace confirm dialog by modal dialog
* Options
    * title (mainly for tutorial, to set title for all steps in one tutorial)
* Global
    * allow to have several instance of vue3-tutorial on the same page
        * do not return a singleton (labels, keyBinding)
* documentation
    * how to configure
        * step
            * checkNext
    * Configuration example (for some usage)
