= TODO =

== Target: v1.0 ==

* Create a floating window
    * manage target scrolls
* create a mask
    * Deactivate interaction with elements (without mask)
    * global mask
    * simple hole
    * multi-holes
* steps
    * emits
        * "error"
    * scrollIntoView
    * check that next is ok
    * skip current step
        * "previous" on skipped test
    * focus
        * remove focus from any element at start of step
            * Add an option to change focus
                * no focus
                * keep current focus
                * focus on the main element
                * focus on given target
* Error management
    * target not found
    * step not found
    * no tutorial
    * send emits depending on error
* Customization
    * Accept markdown
* Compare with vue-tour
    * missing feature
    * How to migrate → documentation
    * What is better in vue3-tutorial
* documentation
    * README
        * gif
        * important features
    * how to configure
        * step
            * skipStep
            * checkNext
        * ~~options~~
            * ~~Dictionary~~
            * ~~Bindings~~
    * Live example
        * create simple tutorial
        * change highlight color in order to see it on background main color
            → this may be a common pbl

== improvement (for after v1.0) ==

* Pause
    * restart at previous index
* Step
    * follow target if they move (actions or scroll)
    * interaction action
        * timer
        * "next" when clicking anywhere
    * options
        * hidden progress
        * No interaction at all (user cannot click on any elements (should it be the default for "next"?))
    * header
        * status (add icon on the right)
            * working (spinner)
            * Error (danger sign)
            * custom
* Window
    * improve auto placement
        * to avoid to be over secondary targets
        * to prefer left/right when target is at sides
    * Allow user to move the window
    * change HTML
* Global
    * allow to have several instance of vue3-tutorial on the same page
        * do not return a singleton (labels, keyBinding)
* Skip
    * replace confirm dialog by modal dialog
