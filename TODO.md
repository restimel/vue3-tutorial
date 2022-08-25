= Road-map =

== Target: v1.0 ==

* ~~create a mask~~
    * ~~Deactivate interaction with elements (without mask)~~
    * ~~global mask~~
    * ~~simple hole~~
    * ~~multi-holes~~
* Options
    * a common API for
        * target (main Element)
        * arrow
        * highlight
        * scroll
        * mask
        * interactivity
        → checkExpression should include getElement
* steps
    * scrollIntoView
        * scroll only if element is not visible
    * check that next is ok
        * block next action
        * disable button
        * enable button
    * Expression
        * check url
* Errors
    * Add debug
* documentation
    * README
        * gif
        * important features
    * how to configure
        * step
            * checkNext
        * split file to avoid having a big big file
    * Live example
        * create simple tutorial
        * change highlight color in order to see it on background main color
            → this may be a common pbl
* Clean up
    * Change code error, in order to have a logic between 2xy and 3xy
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
    * interaction action
        * timer
        * "next" when clicking anywhere
        * keyboard event about key (note that keybinding may already be used for that)
    * options
        * hidden progress
        * No interaction at all (user cannot click on any elements (should it be the default for "next"?))
    * header
        * status (add icon on the right)
            * working (spinner)
            * Error (danger sign)
            * custom
        * progress status with progress bar (and/or %)
    * Content
        * Add sections (extend markdown ?)
            * Tips
            * info
            * warning
            * error/danger
            * success
    * button section
        * When interactive, add a text to tell what is expected
* Window
    * Allow user to move the window
    * improve auto placement
        * to avoid to be over secondary targets
        * to prefer left/right when target is at sides
    * allow to change HTML
* Skip
    * replace confirm dialog by modal dialog
* Options
    * title (mainly for tutorial, to set title for all steps in one tutorial, maybe remove the title property from step)
* Global
    * allow to have several instance of vue3-tutorial on the same page
        * do not return a singleton (labels, keyBinding)
