= TODO =

* Create a floating window
    * ~~popup~~
    * ~~add arrow~~
    * ~~assert position is correct~~
    * ~~add animation~~
    * ~~auto position~~
    * manage target scrolls
* Identify element and point to it
    * ~~single element~~
    * multi-element
* Content
    * ~~content~~
    * ~~title~~
    * ~~index/total~~
    * ~~navigation buttons~~
        * ~~next~~
        * ~~finished~~
        * ~~previous~~
        * ~~skip~~
        * ~~CSS Style~~
    * conditional displays for these buttons
        * next: no action on current
        * finish: no action on current
        * previous: no action on previous
* create a mask
    * Deactivate interaction with elements
    * global mask
    * simple hole
    * multi-holes
* steps
    * ~~start new~~
    * ~~next~~
    * ~~finish~~
    * emits
        * ~~"change step"~~,
        * ~~"finished"~~
        * ~~"start"~~
        * "error"
    * Add timeout about target
    * scrollIntoView
    * check that next is ok
    * skip current step
* Interactions
    * ~~next button~~
    * conditional  nextStep (user action and button/keyboard)
    * action 'click/mousedown...'
    * action 'input/change...'
* ~~keybindings~~
    * ~~add listeners~~
    * ~~remove listeners~~
* documentation
    * README
        * ~~example code~~
        * gif
        * important features
        * Live example
            * ~~create a dedicated project~~
            * create simple tutorial
            * ~create page with complex cases~
            * create more complex tutorial to show the possibilities
    * how to configure
        * step
        * options
    * ~~CSS variables~~
    * ~~emits~~
* Error management
    * target not found
    * step not found
    * no tutorial
    * send emits depending on error
* Customization
    * Accept markdown
    * ~~change all texts~~
* Compare with vue-tour
    * missing feature
    * How to migrate → documentation
    * What is better in vue3-tutorial

== improvement ==

* Pause
    * restart at previous index
* Step
    * focus
        * remove focus from any element at start of step (but what if it is the wanted behavior)
        * focus on the highlighted element
    * follow target if they move (actions or scroll)
* Window
    * improve auto placement
        * to avoid to be over secondary targets
        * to prefer left/right when target is at sides
    * Allow to move the window
    * change HTML
* Global
    * allow to have several instance of vue3-tutorial on the same page
        * do not return a singleton (labels, keyBinding)
