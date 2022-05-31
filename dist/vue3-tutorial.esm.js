import { Prop, Component, Vue, h, Watch, Emits } from 'vtyx';
import { reactive } from 'vue';

/* File Purpose:
 * It displays an SVG content
 */
var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let SVG = class SVG extends Vue {
    /* }}} */
    /* {{{ data */
    /* }}} */
    /* {{{ computed */
    /* }}} */
    /* {{{ methods */
    /* }}} */
    /* {{{ watch */
    /* }}} */
    /* {{{ Life cycle */
    /* }}} */
    render() {
        return h('svg', {
            style: this.style,
            height: this.height,
            width: this.width,
            viewbox: this.viewBox,
        }, [
            h('path', {
                d: this.path,
            }),
        ]);
    }
};
__decorate$3([
    Prop()
], SVG.prototype, "path", void 0);
__decorate$3([
    Prop({ default: 32 })
], SVG.prototype, "width", void 0);
__decorate$3([
    Prop({ default: 32 })
], SVG.prototype, "height", void 0);
__decorate$3([
    Prop({ default: '0 0 100 100' })
], SVG.prototype, "viewBox", void 0);
__decorate$3([
    Prop()
], SVG.prototype, "style", void 0);
SVG = __decorate$3([
    Component
], SVG);
var SVG$1 = SVG;

/* File Purpose:
 * Display a modal box on the screen depending on a position.
 */
var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const BOX_MARGIN = 25;
let Window = class Window extends Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.elementSize = [0, 0];
    }
    /* }}} */
    /* {{{ computed */
    get realPosition() {
        const position = this.position;
        if (position !== 'auto') {
            return position;
        }
        const boxes = this.elementsBox;
        const box = boxes[0];
        if (!(box === null || box === void 0 ? void 0 : box.length)) {
            return 'center';
        }
        /* check where there are enough spaces */
        const [elWidth, elHeight] = this.elementSize;
        const screenHeight = innerHeight;
        const screenWidth = innerWidth;
        const worstPosition = {
            bottom: 0,
            top: 1,
            right: 2,
            left: 3,
        };
        if (box[3] + BOX_MARGIN + elHeight > screenHeight) {
            worstPosition.bottom += 100;
        }
        if (box[1] - BOX_MARGIN - elHeight < 0) {
            worstPosition.top += 100;
        }
        if (box[2] + BOX_MARGIN + elWidth > screenWidth) {
            worstPosition.right += 100;
        }
        if (box[0] - BOX_MARGIN - elWidth < 0) {
            worstPosition.left += 100;
        }
        /* TODO check superposition with other target */
        let choice = 'bottom';
        let currentValue = worstPosition.bottom;
        if (worstPosition.top < currentValue) {
            currentValue = worstPosition.top;
            choice = 'top';
        }
        if (worstPosition.right < currentValue) {
            currentValue = worstPosition.right;
            choice = 'right';
        }
        if (worstPosition.left < currentValue) {
            currentValue = worstPosition.left;
            choice = 'left';
        }
        return choice;
    }
    get hasNoPointer() {
        const boxes = this.elementsBox;
        return !(boxes === null || boxes === void 0 ? void 0 : boxes.length) || !boxes[0].length || this.realPosition === 'center';
    }
    get computePosition() {
        const boxes = this.elementsBox;
        const box = boxes[0];
        const realPosition = !box ? 'center' : this.realPosition;
        let x;
        let y;
        switch (realPosition) {
            case 'bottom':
                x = (box[0] + box[2]) / 2 + 'px';
                y = box[3] + 'px';
                break;
            case 'top':
                x = (box[0] + box[2]) / 2 + 'px';
                y = box[1] + 'px';
                break;
            case 'left':
                x = box[0] + 'px';
                y = (box[1] + box[3]) / 2 + 'px';
                break;
            case 'right':
                x = box[2] + 'px';
                y = (box[1] + box[3]) / 2 + 'px';
                break;
            case 'auto':
            case 'center':
                x = '50%';
                y = '50%';
                break;
        }
        return [x, y, realPosition];
    }
    get stylePosition() {
        const [x, y,] = this.computePosition;
        return `left: ${x}; top: ${y};`;
    }
    /* XXX: This is only to create a reference to the same function */
    get refUpdateSize() {
        return this.updateSize.bind(this);
    }
    /* }}} */
    /* {{{ methods */
    updateSize() {
        const el = this.$refs.modalWindow;
        const rect = el.getBoundingClientRect();
        this.elementSize = [rect.width, rect.height];
    }
    /* }}} */
    /* {{{ watch */
    onElementBoxChange() {
        setTimeout(this.refUpdateSize, 10);
    }
    /* }}} */
    /* {{{ Life cycle */
    mounted() {
        this.updateSize();
        addEventListener('resize', this.refUpdateSize);
    }
    unmounted() {
        removeEventListener('resize', this.refUpdateSize);
    }
    /* }}} */
    render() {
        var _a, _b;
        const position = this.computePosition[2];
        return (h("div", { class: "vue3-tutorial__window-container" },
            !this.hasNoPointer && (h(SVG$1, { width: "15", height: "15", viewBox: "0 0 30 30", path: "M0,0L0,15L5,5L15,0L0,0L25,30L25,25L30,25Z", style: this.stylePosition, class: [
                    'vue3-tutorial__window-arrow',
                    'position-' + position,
                    this.arrowAnimation ? 'animation' : '',
                ] })),
            h("div", { style: this.stylePosition, class: [
                    'vue3-tutorial__window',
                    'position-' + position,
                ], ref: "modalWindow" }, (_b = (_a = this.$slots).content) === null || _b === void 0 ? void 0 : _b.call(_a))));
    }
};
__decorate$2([
    Prop({ default: () => [] })
], Window.prototype, "elementsBox", void 0);
__decorate$2([
    Prop({ default: 'auto' })
], Window.prototype, "position", void 0);
__decorate$2([
    Prop({ default: true })
], Window.prototype, "arrowAnimation", void 0);
__decorate$2([
    Watch('elementBox')
], Window.prototype, "onElementBoxChange", null);
Window = __decorate$2([
    Component
], Window);
var Window$1 = Window;

/** File purpose:
 * It contains all default values and function to merge them.
 */
function merge(target, source, list = new Map()) {
    if (typeof source !== 'object') {
        return source;
    }
    if (typeof target !== 'object') {
        if (Array.isArray(source)) {
            target = [];
        }
        else {
            target = {};
        }
    }
    for (const key of Object.keys(source)) {
        const val = source[key];
        if (list.has(val)) {
            target[key] = list.get(val);
            continue;
        }
        const tgtValue = target[key];
        if (typeof val === 'object') {
            if (Array.isArray(val)) {
                const valTarget = Array.isArray(tgtValue) ? tgtValue : [];
                list.set(val, valTarget);
                val.forEach((sourceVal, index) => {
                    valTarget[index] = merge(valTarget[index], sourceVal, list);
                });
                target[key] = valTarget;
                continue;
            }
            const valTarget = typeof tgtValue === 'object' ? tgtValue : {};
            list.set(val, valTarget);
            target[key] = merge(valTarget, val, list);
        }
        else {
            target[key] = val;
        }
    }
    return target;
}
const DEFAULT_DICTIONARY = {
    finishButton: 'Finish',
    nextButton: 'Next',
    previousButton: 'Previous',
    skipButtonTitle: 'Skip tutorial',
    skipConfirm: 'Do you want to quit the tutorial?',
    stepState: 'step %(currentStep)s / %(totalStep)s',
};
const DEFAULT_BINDING = {
    next: ['ArrowRight', 'Enter'],
    previous: 'ArrowLeft',
    skip: 'Escape',
};
const DEFAULT_STEP_OPTIONS = {
    position: 'auto',
    highlight: true,
    classForTargets: '',
    arrowAnimation: true,
    mask: true,
    maskMargin: 0,
    bindings: DEFAULT_BINDING,
    texts: DEFAULT_DICTIONARY,
    timeout: 3000,
};
function mergeStepOptions(...options) {
    return options.reduce((merged, option) => merge(merged, option), {});
}

/** File purpose:
 * Handle step check
 */
function getActionType(step) {
    const action = step.actionNext;
    if (!action) {
        return 'next';
    }
    if (typeof action === 'string') {
        return action;
    }
    return action.action;
}
function isStepSpecialAction(arg) {
    const actionType = typeof arg === 'string' ? arg : getActionType(arg);
    return actionType !== 'next';
}
function checkExpression(expr, targetEl) {
    /* XXX: This type assignation is only to avoid telling all possible HTML cases */
    const targetElement = targetEl;
    const checkOperation = expr.check || 'is';
    const refValue = expr.value;
    const value = targetElement.value;
    switch (checkOperation) {
        case 'is':
            return value === refValue;
        case 'is not':
            return value !== refValue;
        case 'contains':
            return !!(value === null || value === void 0 ? void 0 : value.includes(refValue));
        case 'do not contain':
            return !!value && !value.includes(refValue);
        case 'is not':
            return value !== refValue;
        case 'is empty':
            return !value;
        case 'is not empty':
            return !!value;
        case 'is checked':
            return !!targetElement.checked;
        case 'is not checked':
            return !targetElement.checked;
        case 'is disabled':
            return !!targetElement.disabled;
        case 'is not disabled':
            return !targetElement.disabled;
        case 'is rendered':
            return document.body.contains(targetElement);
        case 'is not rendered':
            return !document.body.contains(targetElement);
    }
    console.log('Vue3-tutorial: Unknown operation "%s" has been encountered.', checkOperation);
}

/** File purpose:
 * Return strings depending on dictionary
 */
const dictionary = reactive(Object.assign({}, DEFAULT_DICTIONARY));
function label(key, replacement) {
    let text;
    if (typeof dictionary[key] === 'undefined') {
        console.warn('Key "%s" is not defined');
        text = key;
    }
    else {
        text = dictionary[key];
    }
    if (replacement) {
        text = text.replace(/%\(([^)]+)\)s/g, (_p, name) => replacement[name].toString());
    }
    return text;
}
function changeTexts(dic) {
    if (!dic) {
        return;
    }
    Object.assign(dictionary, dic);
}

/** File purpose:
 * Manage key binding and interaction with keyboard
 */
const mapBinding = new Map();
let eventCallback = null;
let isListening = false;
function resetBindings(binding) {
    mapBinding.clear();
    if (binding === false) {
        return;
    }
    for (const [action, keyBindings] of Object.entries(binding)) {
        if (Array.isArray(keyBindings)) {
            keyBindings.forEach((keyBind) => {
                mapBinding.set(keyBind, action);
            });
        }
        else {
            mapBinding.set(keyBindings, action);
        }
    }
}
function onKeyup(evt) {
    const key = evt.key;
    const focusedElement = evt.target;
    if (focusedElement !== document.body) {
        /* Avoid triggering tasks when keyboard may be used by another element */
        return;
    }
    if (mapBinding.has(key) && eventCallback) {
        eventCallback(mapBinding.get(key));
    }
}
function startListening(callback) {
    eventCallback = callback;
    if (isListening) {
        return;
    }
    document.addEventListener('keyup', onKeyup);
    isListening = true;
}
function stopListening() {
    if (!isListening) {
        return;
    }
    isListening = false;
    document.removeEventListener('keyup', onKeyup);
    eventCallback = null;
}

/* File Purpose:
 * It handles the display for one step
 */
var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const nope = function () { };
let VStep = class VStep extends Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.removeActionListener = nope;
        this.targetElements = new Set();
    }
    /* }}} */
    /* {{{ computed */
    get elements() {
        return Array.from(this.targetElements);
    }
    get mainElement() {
        const element = this.elements[0];
        return element || null;
    }
    get fullOptions() {
        return mergeStepOptions(this.options, this.step.options || {});
    }
    get elementsBox() {
        const elements = this.elements;
        return elements.map((element) => {
            const rect = element.getBoundingClientRect();
            return [rect.left, rect.top, rect.right, rect.bottom];
        });
    }
    /* {{{ Next action */
    get nextActionType() {
        return getActionType(this.step);
    }
    get nextActionTarget() {
        const type = this.nextActionType;
        if (type === 'next') {
            return null;
        }
        const action = this.step.actionNext;
        if (typeof action === 'string') {
            return this.mainElement;
        }
        const target = action === null || action === void 0 ? void 0 : action.target;
        if (typeof target !== 'string') {
            return this.mainElement;
        }
        const element = document.querySelector(target);
        return element;
    }
    get needsNextButton() {
        return !isStepSpecialAction(this.nextActionType);
    }
    get actionListener() {
        return () => {
            const type = this.nextActionType;
            const valueEventName = ['input', 'change'];
            if (valueEventName.includes(type)) {
                const action = this.step.actionNext;
                const targetElement = this.nextActionTarget;
                if (!checkExpression(action, targetElement)) {
                    return;
                }
            }
            this.$emit('next');
        };
    }
    /* }}} */
    /* {{{ buttons */
    get displayPreviousButton() {
        const info = this.tutorialInformation;
        if (info.previousStepIsSpecial || info.currentIndex <= 0) {
            return false;
        }
        return true;
    }
    get displayNextButton() {
        const info = this.tutorialInformation;
        if (info.currentIndex >= info.nbTotalSteps - 1) {
            return false;
        }
        return this.needsNextButton;
    }
    get displayFinishButton() {
        const info = this.tutorialInformation;
        if (info.currentIndex >= info.nbTotalSteps - 1) {
            return this.needsNextButton;
        }
        return false;
    }
    get displaySkipButton() {
        return true;
    }
    /* }}} */
    /* }}} */
    /* {{{ watch */
    onTextsChange() {
        changeTexts(this.fullOptions.texts);
    }
    onBindingsChange() {
        resetBindings(this.fullOptions.bindings);
    }
    onElementsChange(newElements, oldElements) {
        if (oldElements) {
            this.removeClass(oldElements);
        }
        if (newElements) {
            this.addClass(newElements);
        }
    }
    onActionTypeChange() {
        this.addActionListener();
    }
    onStepChange() {
        this.resetElements();
    }
    /* }}} */
    /* {{{ methods */
    resetElements() {
        this.targetElements.clear();
        this.getElements(performance.now());
    }
    getElements(refTimestamp) {
        const targetElements = this.targetElements;
        const target = this.step.target;
        if (!(target === null || target === void 0 ? void 0 : target.length)) {
            return;
        }
        let isNotReadyYet = false;
        const targets = Array.isArray(target) ? target : [target];
        targets.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length) {
                for (const el of Array.from(elements)) {
                    targetElements.add(el);
                }
            }
            else {
                isNotReadyYet = true;
            }
        });
        if (isNotReadyYet) {
            const timeout = this.fullOptions.timeout;
            if (performance.now() - refTimestamp < timeout) {
                setTimeout(() => this.getElements(refTimestamp), 100);
            }
            else {
                console.log('error: timeout');
            }
        }
    }
    addClass(newTargets) {
        const options = this.fullOptions;
        /* add vue3-tutorial class */
        newTargets.forEach((el) => {
            el.classList.add('vue3-tutorial__target');
            if (options.classForTargets) {
                el.classList.add(options.classForTargets);
            }
        });
        const mainEl = newTargets[0];
        if (mainEl) {
            mainEl.classList.add('vue3-tutorial__main-target');
            if (options.highlight) {
                mainEl.classList.add('vue3-tutorial-highlight');
            }
        }
    }
    removeClass(oldTargets) {
        const options = this.fullOptions;
        /* remove previous vue3-tutorial class */
        oldTargets.forEach((el) => {
            el.classList.remove('vue3-tutorial-highlight', 'vue3-tutorial__target', 'vue3-tutorial__main-target');
            if (options.classForTargets) {
                el.classList.remove(options.classForTargets);
            }
        });
    }
    addActionListener() {
        const eventName = this.nextActionType;
        const el = this.nextActionTarget;
        this.removeActionListener();
        if (!el || eventName === 'next') {
            return;
        }
        el.addEventListener(eventName, this.actionListener);
        this.removeActionListener = () => {
            el.removeEventListener(eventName, this.actionListener);
            this.removeActionListener = nope;
        };
    }
    /* }}} */
    /* {{{ Life cycle */
    /* }}} */
    unmounted() {
        this.removeClass(this.elements);
        this.removeActionListener();
    }
    render() {
        const options = this.fullOptions;
        const step = this.step;
        const information = this.tutorialInformation;
        return (h(Window$1, { elementsBox: this.elementsBox, position: options.position, arrowAnimation: options.arrowAnimation },
            h("aside", { slot: "content", class: "vue3-tutorial__step" },
                h("header", { class: "vue3-tutorial__step__header" },
                    h("div", { class: "vue3-tutorial__step__header__title" }, step.title),
                    h("div", { class: "vue3-tutorial__step__header__status" }, label('stepState', {
                        currentStep: information.currentIndex + 1,
                        totalStep: information.nbTotalSteps,
                    }))),
                h("div", { class: "vue3-tutorial__step__content" }, step.content),
                h("nav", { class: "vue3-tutorial__step__commands" },
                    this.displayPreviousButton && (h("button", { class: "vue3-tutorial__step__btn vue3-tutorial__step__btn-previous", on: {
                            click: () => this.$emit('previous'),
                        } }, label('previousButton'))),
                    this.displaySkipButton && (h("button", { class: "vue3-tutorial__step__btn vue3-tutorial__step__btn-skip", on: {
                            click: () => this.$emit('skip'),
                        }, title: label('skipButtonTitle') }, "\u00D7")),
                    this.displayNextButton && (h("button", { class: "vue3-tutorial__step__btn vue3-tutorial__step__btn-next", on: {
                            click: () => this.$emit('next'),
                        } }, label('nextButton'))),
                    this.displayFinishButton && (h("button", { class: "vue3-tutorial__step__btn vue3-tutorial__step__btn-finish", on: {
                            click: () => this.$emit('finish'),
                        } }, label('finishButton')))))));
    }
};
__decorate$1([
    Prop()
], VStep.prototype, "step", void 0);
__decorate$1([
    Prop()
], VStep.prototype, "options", void 0);
__decorate$1([
    Prop()
], VStep.prototype, "tutorialInformation", void 0);
__decorate$1([
    Watch('fullOptions.texts')
], VStep.prototype, "onTextsChange", null);
__decorate$1([
    Watch('fullOptions.bindings')
], VStep.prototype, "onBindingsChange", null);
__decorate$1([
    Watch('elements', { deep: true })
], VStep.prototype, "onElementsChange", null);
__decorate$1([
    Watch('nextActionTarget'),
    Watch('nextActionType', { immediate: true })
], VStep.prototype, "onActionTypeChange", null);
__decorate$1([
    Watch('step.target', { immediate: true })
], VStep.prototype, "onStepChange", null);
__decorate$1([
    Emits(['finish', 'next', 'previous', 'skip'])
], VStep.prototype, "render", null);
VStep = __decorate$1([
    Component
], VStep);
var VStep$1 = VStep;

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "/* {{{ variables */\n\n:root {\n    /** Main color used for component */\n    --vue3-tutorial-brand-primary: #42b883;\n\n    /** Secondary color used for contrast */\n    --vue3-tutorial-brand-secondary: #2c3e50;\n\n    /** zIndex used by popup window for the tips. It should be higher than\n     * your other components\n     * The mask will use this value.\n     * The arrow will use this value + 10;\n     * The pop-up window will use this value + 20;\n     */\n    --vue3-tutorial-zindex: 1000;\n\n    /** The background color of the step window */\n    --vue3-tutorial-step-bg-color: var(--vue3-tutorial-brand-primary);\n    /** The text color of step window */\n    --vue3-tutorial-step-text-color: white;\n\n    /** The background color of the header of step window */\n    --vue3-tutorial-step-header-bg-color: var(--vue3-tutorial-brand-secondary);\n    /** The text color of the header of step window */\n    --vue3-tutorial-step-header-text-color: var(--vue3-tutorial-step-text-color);\n\n    /** The shadow style of the popup-window */\n    --vue3-tutorial-window-shadow: 2px 5px 15px black;\n\n    /** The shadow style of the highlighted element */\n    --vue3-tutorial-highlight-shadow: 0 0 10px var(--vue3-tutorial-brand-primary), inset 0 0 10px var(--vue3-tutorial-brand-primary);\n}\n\n/* }}} */\n/* {{{ animations */\n\n@keyframes v3-tutorial-verticalWave {\n    from {margin-top: -2px;}\n    to {margin-top: 2px;}\n}\n\n@keyframes v3-tutorial-horizontalWave {\n    from {margin-left: -2px;}\n    to {margin-left: 2px;}\n}\n\n/* }}} */\n/* {{{ Window */\n\n.vue3-tutorial__window {\n    position: fixed;\n    z-index: calc(var(--vue3-tutorial-zindex) + 20);\n    box-shadow: var(--vue3-tutorial-window-shadow);\n    border-radius: 3px;\n    --vue3-tutorial-priv-window-margin: 20px;\n}\n.vue3-tutorial__window.position-top {\n    transform: translate(-50%, calc(-100% - var(--vue3-tutorial-priv-window-margin)));\n}\n.vue3-tutorial__window.position-bottom {\n    transform: translate(-50%, var(--vue3-tutorial-priv-window-margin));\n}\n.vue3-tutorial__window.position-left {\n    transform: translate(calc(-100% - var(--vue3-tutorial-priv-window-margin)), -50%);\n}\n.vue3-tutorial__window.position-right {\n    transform: translate(var(--vue3-tutorial-priv-window-margin), -50%);\n}\n.vue3-tutorial__window.position-center {\n    transform: translate(-50%, -50%);\n}\n\n.vue3-tutorial__window-arrow {\n    position: fixed;\n    z-index: calc(var(--vue3-tutorial-zindex) + 10);\n    fill: var(--vue3-tutorial-brand-primary);\n    stroke: rgba(250, 250, 250, 0.5);\n}\n.vue3-tutorial__window-arrow.animation {\n    animation-timing-function: ease-in-out;\n    animation-duration: 0.75s;\n    animation-iteration-count: infinite;\n    animation-direction: alternate;\n}\n.vue3-tutorial__window-arrow.position-top {\n    transform: translate(-50%, -100%)  rotate(-135deg);\n    animation-name: v3-tutorial-verticalWave;\n}\n.vue3-tutorial__window-arrow.position-bottom {\n    transform: translate(-50%) rotate(45deg);\n    animation-name: v3-tutorial-verticalWave;\n}\n.vue3-tutorial__window-arrow.position-left {\n    transform: translate(-100%, -50%) rotate(135deg);\n    animation-name: v3-tutorial-horizontalWave;\n}\n.vue3-tutorial__window-arrow.position-right {\n    transform: translate(0, -50%) rotate(-45deg);\n    animation-name: v3-tutorial-horizontalWave;\n}\n.vue3-tutorial__window-arrow.position-center {\n    display: none;\n}\n\n/* }}} */\n/* {{{ Step */\n\n.vue3-tutorial__step {\n    background-color: var(--vue3-tutorial-step-bg-color);\n    color: var(--vue3-tutorial-step-text-color);\n    padding: 1rem;\n    border-radius: 3px;\n}\n\n.vue3-tutorial__step__header {\n    background-color: var(--vue3-tutorial-step-header-bg-color);\n    color: var(--vue3-tutorial-step-header-text-color);\n    text-align: center;\n    padding: 0.5rem;\n    margin-top: -1rem;\n    margin-left: -1rem;\n    margin-right: -1rem;\n    border-radius: 3px;\n}\n\n.vue3-tutorial__step__header__title {\n    font-weight: 300;\n}\n\n.vue3-tutorial__step__header__status {\n    font-size: 0.7em;\n    font-style: italic;\n    opacity: 0.8;\n}\n\n.vue3-tutorial__step__content {\n    margin: 1rem 0 1rem 0;\n}\n\n.vue3-tutorial__step__btn {\n    background: transparent;\n    border: 0.05rem solid var(--vue3-tutorial-step-text-color);\n    border-radius: 0.1rem;\n    color: var(--vue3-tutorial-step-text-color);\n    cursor: pointer;\n    display: inline-block;\n    font-size: 0.8rem;\n    height: 1.8rem;\n    line-height: 1rem;\n    outline: none;\n    margin: 0 0.2rem;\n    padding: 0.35rem 0.4rem;\n    text-align: center;\n    text-decoration: none;\n    transition: all 0.2s ease;\n    vertical-align: middle;\n    white-space: nowrap;\n}\n\n.vue3-tutorial__step__btn-skip {\n    position: absolute;\n    top: 1px;\n    right: 1px;\n    font-size: 32px;\n    width: 32px;\n    height: 32px;\n    border-radius: 32px;\n    padding: 0 3px 0 3px;\n    transform: translate(calc(50% - 5px), calc(-50% + 9px)) scale(0.4);\n    transition: transform 600ms;\n}\n.vue3-tutorial__step__btn-skip:hover {\n    transform: translate(calc(50% - 5px), calc(-50% + 9px)) scale(0.7);\n}\n\n/* }}} */\n/* {{{ External elements */\n\n.vue3-tutorial-highlight {\n    box-shadow: var(--vue3-tutorial-highlight-shadow);\n}\n\n/* }}} */\n";
styleInject(css_248z);

/* Component Purpose:
 * vue3-tutorial is a component to indicate to user which actions may
 * be done. User may do the action in order to go to the next step.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let VTutorial = class VTutorial extends Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.currentIndex = 0;
        this.isRunning = false;
    }
    /* }}} */
    /* {{{ computed */
    get steps() {
        var _a, _b;
        return (_b = (_a = this.tutorial) === null || _a === void 0 ? void 0 : _a.steps) !== null && _b !== void 0 ? _b : [];
    }
    get nbTotalSteps() {
        return this.steps.length;
    }
    get currentStep() {
        const step = this.steps[this.currentIndex];
        if (!step) {
            return;
        }
        return step;
    }
    get tutorialOptions() {
        return mergeStepOptions(DEFAULT_STEP_OPTIONS, this.options || {}, this.tutorial.options || {});
    }
    get currentStepIsSpecial() {
        const step = this.currentStep;
        return !!step && isStepSpecialAction(step);
    }
    get previousStepIsSpecial() {
        const step = this.steps[this.currentIndex - 1];
        if (!step) {
            return true;
        }
        return isStepSpecialAction(step);
    }
    /* }}} */
    /* {{{ watch */
    onOpenChange() {
        if (this.open) {
            this.start();
        }
    }
    onStepsChange() {
        this.start();
    }
    /* }}} */
    /* {{{ methods */
    /* {{{ navigation */
    start() {
        this.currentIndex = 0;
        this.isRunning = true;
        this.$emit('start', this.currentIndex);
        startListening(this.onKeyEvent.bind(this));
    }
    nextStep(forceNext = false) {
        if (!this.isRunning) {
            return;
        }
        if (!forceNext && this.currentStepIsSpecial) {
            return;
        }
        if (this.currentIndex >= this.nbTotalSteps - 1) {
            this.stop(true);
        }
        this.currentIndex++;
        this.$emit('nextStep', this.currentIndex);
        this.$emit('changeStep', this.currentIndex);
    }
    previousStep(forcePrevious = false) {
        if (!this.isRunning) {
            return;
        }
        if (this.currentIndex <= 0) {
            return;
        }
        if (!forcePrevious && this.previousStepIsSpecial) {
            return;
        }
        this.currentIndex--;
        this.$emit('previousStep', this.currentIndex);
        this.$emit('changeStep', this.currentIndex);
    }
    stop(isFinished = false) {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        this.$emit('stop', isFinished);
        stopListening();
    }
    skip() {
        if (!confirm(label('skipConfirm'))) {
            return;
        }
        this.stop();
    }
    /* }}} */
    onKeyEvent(action) {
        switch (action) {
            case 'next':
                this.nextStep();
                break;
            case 'previous':
                this.previousStep();
                break;
            case 'skip':
                this.skip();
                break;
        }
    }
    /* }}} */
    /* {{{ Life cycle */
    /* }}} */
    render() {
        const step = this.currentStep;
        if (!this.isRunning || !step) {
            return;
        }
        return (h(VStep$1, { step: step, options: this.tutorialOptions, tutorialInformation: {
                currentIndex: this.currentIndex,
                nbTotalSteps: this.nbTotalSteps,
                previousStepIsSpecial: this.previousStepIsSpecial,
            }, on: {
                previous: () => this.previousStep(true),
                next: () => this.nextStep(true),
                finish: () => this.nextStep(true),
                skip: () => this.skip(),
            } }));
    }
};
__decorate([
    Prop({ default: () => ({ steps: [] }) })
], VTutorial.prototype, "tutorial", void 0);
__decorate([
    Prop()
], VTutorial.prototype, "options", void 0);
__decorate([
    Prop({ default: false })
], VTutorial.prototype, "open", void 0);
__decorate([
    Watch('open', { immediate: true })
], VTutorial.prototype, "onOpenChange", null);
__decorate([
    Watch('steps')
], VTutorial.prototype, "onStepsChange", null);
__decorate([
    Emits(['changeStep', 'nextStep', 'previousStep', 'start', 'stop'])
], VTutorial.prototype, "render", null);
VTutorial = __decorate([
    Component
], VTutorial);
var VTutorial$1 = VTutorial;

export { VTutorial$1 as default };
