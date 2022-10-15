import { Prop, Component, Vue, h, Watch, Emits } from 'vtyx';
import { reactive, watch } from 'vue';
import Markdown from 'vue3-markdown-it';

/* File Purpose:
 * It displays an SVG content
 */
var __decorate$4 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let SVG$1 = class SVG extends Vue {
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
__decorate$4([
    Prop()
], SVG$1.prototype, "path", void 0);
__decorate$4([
    Prop({ default: 32 })
], SVG$1.prototype, "width", void 0);
__decorate$4([
    Prop({ default: 32 })
], SVG$1.prototype, "height", void 0);
__decorate$4([
    Prop({ default: '0 0 100 100' })
], SVG$1.prototype, "viewBox", void 0);
__decorate$4([
    Prop()
], SVG$1.prototype, "style", void 0);
SVG$1 = __decorate$4([
    Component
], SVG$1);
var SVG$2 = SVG$1;

/* File Purpose:
 * Handle geometry manipulations (shape transformation and intersection)
 */
function getRectIntersection(rect1, rect2) {
    const [x11, y11, x21, y21] = rect1;
    const [x12, y12, x22, y22] = rect2;
    const x1 = Math.max(x11, x12);
    const x2 = Math.min(x21, x22);
    const y1 = Math.max(y11, y12);
    const y2 = Math.min(y21, y22);
    if (x1 < x2 && y1 < y2) {
        return [x1, y1, x2, y2];
    }
    return null;
}
function getRectOverlap(rectRef, rects) {
    return rects.reduce((overlaps, rect) => {
        const rectOverlap = getRectIntersection(rectRef, rect);
        if (rectOverlap) {
            overlaps.push(rectOverlap);
        }
        return overlaps;
    }, []);
}
function getRectOverlaps(rects) {
    const length = rects.length;
    if (length === 0) {
        return [];
    }
    const allRects = [rects[0]];
    const overlaps = [];
    for (let refIdx = 1; refIdx < length; refIdx++) {
        const rectRef = rects[refIdx];
        const rectOverlaps = getRectOverlap(rectRef, allRects);
        allRects.push(rectRef, ...rectOverlaps);
        overlaps.push(...rectOverlaps);
    }
    return overlaps;
}
function getRectCenter(rect) {
    return [
        (rect[0] + rect[2]) / 2,
        (rect[1] + rect[3]) / 2,
    ];
}

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
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.forceUpdate = 0;
    }
    /* }}} */
    /* {{{ computed */
    get width() {
        const width = self.innerWidth;
        this.forceUpdate; /* for reactivity */
        return width;
    }
    get height() {
        const height = self.innerHeight;
        this.forceUpdate; /* for reactivity */
        return height;
    }
    get viewBox() {
        const width = this.width;
        const height = this.height;
        return `0 0 ${width} ${height}`;
    }
    get cacheForceUpdate() {
        return () => {
            this.forceUpdate++;
        };
    }
    get targetsWithMargin() {
        const margin = this.maskMargin;
        return this.targets.map((target) => {
            const [x1, y1, x2, y2] = target;
            return [x1 - margin, y1 - margin, x2 + margin, y2 + margin];
        });
    }
    get path() {
        const width = this.width;
        const height = this.height;
        const rect = `M0,0 H${width} V${height} H0 z`;
        const targets = this.targetsWithMargin;
        /* rotate in the opposite rotation direction to create holes */
        const holes = targets.map((target) => {
            const [x1, y1, x2, y2] = target;
            return `M${x1},${y1} V${y2} H${x2} V${y1} z`;
        });
        /* and rotate again in the opposite direction, to nullify holes overlapping */
        const overlapHoles = getRectOverlaps(targets).map((target) => {
            const [x1, y1, x2, y2] = target;
            return `M${x1},${y1} H${x2} V${y2} H${x1} z`;
        });
        return [rect, ...holes, ...overlapHoles].join(' ');
    }
    /* }}} */
    /* {{{ Life cycle */
    mounted() {
        addEventListener('resize', this.cacheForceUpdate);
    }
    unmounted() {
        removeEventListener('resize', this.cacheForceUpdate);
    }
    /* }}} */
    render() {
        return h('svg', {
            style: this.style,
            height: this.height,
            width: this.width,
            viewbox: this.viewBox,
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            class: 'vue3-tutorial__svg-mask',
        }, [
            h('path', {
                d: this.path,
                style: this.maskStyle,
                class: 'vue3-tutorial__mask',
            }),
        ]);
    }
};
__decorate$3([
    Prop()
], SVG.prototype, "style", void 0);
__decorate$3([
    Prop()
], SVG.prototype, "maskStyle", void 0);
__decorate$3([
    Prop({ default: 0 })
], SVG.prototype, "maskMargin", void 0);
__decorate$3([
    Prop()
], SVG.prototype, "targets", void 0);
SVG = __decorate$3([
    Component
], SVG);
var Mask = SVG;

/** File purpose:
 * Manage errors that can happens anywhere in the library
 */
let errorCallback = null;
const errorMap = {
    /* 0xx : debug */
    0: 'Tutorial mounted',
    1: 'Tutorial unmounted',
    2: 'Tutorial started',
    3: 'Tutorial stopped',
    20: 'Step mounted',
    21: 'Step unmounted',
    22: 'Step changed',
    25: 'Target elements change',
    /* 1xx : info */
    /* 2xx : warning */
    200: 'Unknown error code',
    201: 'Unknown label',
    202: 'Not able to check if step can be skipped',
    203: 'Tutorial has no active steps',
    204: 'There are no previous step',
    224: 'Timeout: some targets have not been found in the allowing time',
    /* 3xx : error */
    300: 'Selector is not valid',
    301: 'Unknown operation',
    302: 'Step not found',
    303: 'Tutorial is not defined',
    324: 'Timeout: some targets have not been found in the allowing time',
};
const MESSAGE_LOG = 'vue3-tutorial [%d]: %s';
function error(code, details) {
    const message = errorMap[code];
    if (!message) {
        error(200, { code: code, details: details });
    }
    switch (errorStatus(code)) {
        case 'log':
            console.log(MESSAGE_LOG, code, message, details);
            break;
        case 'info':
            console.log(MESSAGE_LOG, code, message, details);
            break;
        case 'warning':
            console.warn(MESSAGE_LOG, code, message, details);
            break;
        case 'error':
            console.error(MESSAGE_LOG, code, message, details);
            break;
    }
    if (errorCallback) {
        errorCallback({
            code,
            message,
            details,
        });
    }
}
function errorStatus(code) {
    if (code < 100) {
        return 'log';
    }
    if (code < 200) {
        return 'info';
    }
    if (code < 300) {
        return 'warning';
    }
    return 'error';
}
function debug(code, options, details = {}) {
    const debug = options.debug;
    if (!debug) {
        return;
    }
    if (debug === true || debug.includes(code)) {
        const dbgDetails = Object.assign({ options: options }, details);
        error(code, dbgDetails);
    }
}
function registerError(callback) {
    errorCallback = callback;
}
function unRegisterError() {
    errorCallback = null;
}

/* File Purpose:
 * Propose different common tools to help other components
 */
/** merge deeply an object in another one. */
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
/** Return a value which should be included between min and max */
function minMaxValue(value, min, max) {
    if (min > max) {
        return min;
    }
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}
/* This reference is only to return a common reference for an empty array.
 * This should avoid triggering changes when only providing a new empty array */
const emptyArray = [];
function getElement(query, options) {
    const { purpose, timeout, timeoutError, errorIsWarning, cache, all = false, refTime = performance.now(), } = options;
    try {
        let element;
        let isEmpty = false;
        if (cache === null || cache === void 0 ? void 0 : cache.has(query)) {
            element = cache.get(query);
        }
        else if (all) {
            const elements = document.querySelectorAll(query);
            element = !elements ? null : Array.from(elements);
            isEmpty = !(element === null || element === void 0 ? void 0 : element.length);
        }
        else {
            element = document.querySelector(query);
            isEmpty = !element;
        }
        /* manage cache */
        if (!isEmpty && cache) {
            cache.set(query, element);
        }
        if (typeof timeout === 'number') {
            if (!isEmpty) {
                return Promise.resolve(element);
            }
            /* Timeout have ben reached */
            if (performance.now() - refTime > timeout) {
                const details = {
                    timeout,
                    selector: query,
                    purpose,
                };
                if (typeof timeoutError === 'function') {
                    timeoutError(details);
                }
                else if (errorIsWarning) {
                    error(224, details);
                }
                else {
                    error(324, details);
                }
                return Promise.resolve(null);
            }
            /* If timeout is not reached then search again */
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(getElement(query, {
                        purpose,
                        timeout,
                        timeoutError,
                        errorIsWarning,
                        cache,
                        all,
                        refTime,
                    }));
                }, 50);
            });
        }
        return element;
    }
    catch (err) {
        error(300, { selector: query, purpose, error: err });
    }
    if (typeof timeout === 'number') {
        return Promise.resolve(null);
    }
    return null;
}
function getBox(el, memo, { isParent = false, getParentBox = false, } = {}) {
    /* Check if result is already in memory */
    if (isParent && memo.has(el)) {
        return memo.get(el);
    }
    /* Check if this element is a root element */
    const parentEl = el.parentElement;
    if (!parentEl) {
        const rect = el.getBoundingClientRect();
        const box = [rect.left, rect.top, rect.right, rect.bottom, 'visible'];
        memo.set(el, box);
        return box;
    }
    /* Now we want to check if current element is visible in parent element
     * (due to scroll) */
    const parentBox = getBox(parentEl, memo, { isParent: true, getParentBox });
    /* parent is itself not visible */
    if (parentBox[4] !== 'visible') {
        memo.set(el, parentBox);
        return parentBox;
    }
    /* Check if current element never scrolls, in such case, we keep the
     * parentElement box size */
    if (isParent) {
        const currentOverflow = getComputedStyle(el).overflow;
        if (currentOverflow === 'visible') {
            memo.set(el, parentBox);
            return parentBox;
        }
    }
    /* compare position with the parent scroll status */
    const rect = el.getBoundingClientRect();
    const [parentLeft, parentTop, parentRight, parentBottom] = parentBox;
    const { left: currentLeft, top: currentTop, right: currentRight, bottom: currentBottom, } = rect;
    const min = Math.min;
    const max = Math.max;
    let box;
    if (getParentBox && (currentTop > parentBottom || currentBottom < parentTop ||
        currentLeft > parentRight || currentRight < parentLeft)) {
        box = [
            parentLeft,
            parentTop,
            parentRight,
            parentBottom,
            'visible', // TODO use a better hidden position
        ];
    }
    else if (currentTop > parentBottom) {
        box = [
            max(currentLeft, parentLeft),
            parentBottom,
            min(currentRight, parentRight),
            parentBottom,
            'bottom',
        ];
    }
    else if (currentBottom < parentTop) {
        box = [
            max(currentLeft, parentLeft),
            parentTop,
            min(currentRight, parentRight),
            parentTop,
            'top',
        ];
    }
    else if (currentLeft > parentRight) {
        box = [
            parentRight,
            max(currentTop, parentTop),
            parentRight,
            min(currentBottom, parentBottom),
            'right',
        ];
    }
    else if (currentRight < parentLeft) {
        box = [
            parentLeft,
            max(currentTop, parentTop),
            parentLeft,
            min(currentBottom, parentBottom),
            'left',
        ];
    }
    else {
        box = [
            max(currentLeft, parentLeft),
            max(currentTop, parentTop),
            min(currentRight, parentRight),
            min(currentBottom, parentBottom),
            'visible',
        ];
    }
    memo.set(el, box);
    return box;
}
function getPosition(box, realPosition) {
    const screenHeight = innerHeight;
    const screenWidth = innerWidth;
    let x;
    let y;
    switch (realPosition) {
        case 'bottom':
            x = minMaxValue((box[0] + box[2]) / 2, 0, screenWidth) + 'px';
            y = minMaxValue(box[3], 0, screenHeight) + 'px';
            break;
        case 'top':
            x = minMaxValue((box[0] + box[2]) / 2, 0, screenWidth) + 'px';
            y = minMaxValue(box[1], 0, screenHeight) + 'px';
            break;
        case 'left':
            x = minMaxValue(box[0], 0, screenWidth) + 'px';
            y = minMaxValue((box[1] + box[3]) / 2, 0, screenHeight) + 'px';
            break;
        case 'right':
            x = minMaxValue(box[2], 0, screenWidth) + 'px';
            y = minMaxValue((box[1] + box[3]) / 2, 0, screenHeight) + 'px';
            break;
        case 'auto':
        case 'center':
            x = '50%';
            y = '50%';
            break;
    }
    return [x, y, realPosition];
}
function getPlacement(targetBox, refBox) {
    /* The placement is the direction from the refBox to the targetBox
     */
    if (!refBox) {
        refBox = [0, 0, innerWidth, innerHeight];
    }
    /* Compare center of rects */
    const [targetX, targetY] = getRectCenter(targetBox);
    const [refX, refY] = getRectCenter(refBox);
    if (targetX === refX) {
        if (refY > targetY) {
            return 'top';
        }
        else {
            /* this is also the case if points are the same (default value) */
            return 'bottom';
        }
    }
    const isRight = refX > targetX;
    const deviation = (refY - targetY) / (refX - targetX);
    if (isRight) {
        if (deviation < -1) {
            return 'top';
        }
        if (deviation < 1) {
            return 'right';
        }
        return 'bottom';
    }
    if (deviation < -1) {
        return 'bottom';
    }
    if (deviation < 1) {
        return 'left';
    }
    return 'top';
}

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
    get mainBoxElement() {
        return this.elementsBox[0];
    }
    get realPosition() {
        const position = this.position;
        if (position !== 'auto') {
            return position;
        }
        const box = this.mainBoxElement;
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
        const arrow = this.arrow;
        if (arrow === false) {
            return true;
        }
        if (arrow === true) {
            const boxes = this.elementsBox;
            return !(boxes === null || boxes === void 0 ? void 0 : boxes.length) || !boxes[0].length || !!this.getScrollPosition || this.realPosition === 'center';
        }
        return false;
    }
    get computePosition() {
        const box = this.mainBoxElement;
        const realPosition = !box || box[4] !== 'visible' ? 'center' : this.realPosition;
        return getPosition(box, realPosition);
    }
    get stylePosition() {
        let [x, y, placement] = this.computePosition;
        const [elWidth, elHeight] = this.elementSize;
        switch (placement) {
            case 'center':
                break;
            case 'bottom':
            case 'top':
                const valX = parseInt(x, 10);
                if (valX < elWidth / 2) {
                    x = elWidth / 2 + 'px';
                }
                break;
            case 'left':
            case 'right':
                const valY = parseInt(y, 10);
                if (valY < elHeight / 2) {
                    y = elHeight / 2 + 'px';
                }
                break;
        }
        return `left: ${x}; top: ${y};`;
    }
    /* XXX: This is only to create a reference to the same function */
    get refUpdateSize() {
        return this.updateSize.bind(this);
    }
    /* {{{ scroll */
    get getScrollPosition() {
        const box = this.mainBoxElement;
        const hiddenPosition = box === null || box === void 0 ? void 0 : box[4];
        if (!hiddenPosition || hiddenPosition === 'visible') {
            return;
        }
        return getPosition(box, hiddenPosition);
    }
    get styleScrollPosition() {
        const [x, y,] = this.getScrollPosition || [];
        return `left: ${x}; top: ${y};`;
    }
    get arrowsPosition() {
        const arrow = this.arrow;
        if (!arrow || this.hasNoPointer) {
            return emptyArray;
        }
        if (arrow === true) {
            const [x, y, position] = this.computePosition;
            return [{ x, y, position }];
        }
        return arrow;
    }
    /* }}} */
    /* }}} */
    /* {{{ watch */
    onElementBoxChange() {
        setTimeout(this.refUpdateSize, 10);
    }
    /* }}} */
    /* {{{ methods */
    updateSize() {
        const el = this.$refs.modalWindow;
        const rect = el.getBoundingClientRect();
        this.elementSize = [rect.width, rect.height];
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
        const arrowAnimation = this.arrowAnimation;
        return (h("div", { class: "vue3-tutorial__window-container" },
            this.mask && (h(Mask, { targets: this.masksBox, maskMargin: this.maskMargin })),
            this.arrowsPosition.map((arrow) => (h(SVG$2, { width: "15", height: "15", viewBox: "0 0 30 30", path: "M0,0L0,15L5,5L25,30L25,25L30,25L5,5L15,0L0,0Z", style: `left: ${arrow.x}; top: ${arrow.y};`, class: [
                    'vue3-tutorial__window-arrow',
                    'position-' + arrow.position,
                    arrowAnimation ? 'animation' : '',
                ] }))),
            !!this.getScrollPosition && (h(SVG$2, { width: "30", height: "30", viewBox: "0 0 30 30", path: "M0,0L0,15L7,7L10,30L30,10L7,7L15,0L0,0Z", style: this.styleScrollPosition, class: [
                    'vue3-tutorial__window-scroll-arrow',
                    'position-' + this.getScrollPosition[2],
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
    Prop({ default: () => [] })
], Window.prototype, "masksBox", void 0);
__decorate$2([
    Prop({ default: 'auto' })
], Window.prototype, "position", void 0);
__decorate$2([
    Prop({ default: true })
], Window.prototype, "arrow", void 0);
__decorate$2([
    Prop({ default: true })
], Window.prototype, "arrowAnimation", void 0);
__decorate$2([
    Prop({ default: true })
], Window.prototype, "mask", void 0);
__decorate$2([
    Prop({ default: 0 })
], Window.prototype, "maskMargin", void 0);
__decorate$2([
    Watch('elementsBox', { deep: true })
], Window.prototype, "onElementBoxChange", null);
Window = __decorate$2([
    Component
], Window);
var Window$1 = Window;

/** File purpose:
 * It contains all default values and function to merge them.
 */
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
    arrow: true,
    maskMargin: 0,
    bindings: DEFAULT_BINDING,
    focus: 'no-focus',
    texts: DEFAULT_DICTIONARY,
    scroll: 'scroll-to',
    timeout: 3000,
    debug: false,
};
function mergeStepOptions(...options) {
    return options.reduce((merged, option) => merge(merged, option), {});
}

/** File purpose:
 * Handle step relative methods
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
function checkExpression(expr, targetEl, purpose) {
    var _a, _b, _c;
    /* XXX: This type assignation is only to avoid telling all possible HTML cases */
    const targetElement = targetEl;
    const checkOperation = expr.check || 'is';
    const prop = (_a = expr.property) !== null && _a !== void 0 ? _a : 'value';
    const refValue = expr.value;
    const value = targetElement[prop];
    switch (checkOperation) {
        case 'is':
            return value == refValue;
        case 'is not':
            return value != refValue;
        case 'contains':
            return !!((_b = value === null || value === void 0 ? void 0 : value.includes) === null || _b === void 0 ? void 0 : _b.call(value, refValue));
        case 'do not contain':
        case 'does not contain':
            return !((_c = value === null || value === void 0 ? void 0 : value.includes) === null || _c === void 0 ? void 0 : _c.call(value, refValue));
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
    error(301, { operation: checkOperation, purpose });
    return false;
}
async function skipCurrentStep(step, info) {
    var _a;
    const stepDesc = step.desc;
    const skipStep = stepDesc === null || stepDesc === void 0 ? void 0 : stepDesc.skipStep;
    if (!skipStep) {
        return false;
    }
    if (typeof skipStep === 'boolean') {
        return skipStep;
    }
    if (typeof skipStep === 'function') {
        return skipStep(info.currentIndex);
    }
    const operator = skipStep.check;
    const isOperatorNotRendered = operator === 'is not rendered';
    const isOperatorRender = isOperatorNotRendered || operator === 'is rendered';
    const targetSelector = skipStep.target;
    const targetElement = await getElement(targetSelector, {
        purpose: 'skipStep',
        timeout: (_a = skipStep.timeout) !== null && _a !== void 0 ? _a : step.options.timeout,
        timeoutError: (details) => {
            if (isOperatorRender) {
                return;
            }
            error(224, details);
        },
    });
    if (!targetElement) {
        /* If the element has not been found return false only if it is
         * not the purpose of the operator */
        if (!isOperatorNotRendered) {
            return false;
        }
        return true;
    }
    return checkExpression(skipStep, targetElement, 'skipStep');
}
function getStep(stepDesc, tutorialOptions, info) {
    const step = reactive({
        desc: stepDesc,
        status: {
            isActionNext: true,
            skipped: false,
            index: info.currentIndex,
        },
        /* will be filled immediately */
        options: {},
        async checkSkipped() {
            /* recompute the skip status */
            const skipped = await skipCurrentStep(step, info);
            step.status.skipped = skipped;
            return skipped;
        },
    });
    /* handle options */
    watch(() => [stepDesc, tutorialOptions], () => {
        step.options = mergeStepOptions(tutorialOptions, stepDesc.options || {});
    }, { immediate: true, deep: true });
    /* handle status.isActionNext */
    watch(() => stepDesc.actionNext, () => {
        const nextActionType = getActionType(stepDesc);
        step.status.isActionNext = !isStepSpecialAction(nextActionType);
    }, { immediate: true, deep: true });
    step.checkSkipped();
    return step;
}
/* test */

/** File purpose:
 * Return strings depending on dictionary
 */
const dictionary = reactive(Object.assign({}, DEFAULT_DICTIONARY));
function label(key, replacement) {
    let text;
    if (typeof dictionary[key] === 'undefined') {
        error(201, { label: key });
        text = key;
    }
    else {
        text = dictionary[key];
    }
    if (replacement) {
        text = text.replace(/%\(([^)]+)\)s/g, (_p, name) => { var _a, _b; return (_b = (_a = replacement[name]) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ''; });
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
let currentBindingSignature = '';
function resetBindings(binding) {
    const signature = JSON.stringify(binding);
    if (currentBindingSignature === signature) {
        return;
    }
    currentBindingSignature = signature;
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
    if (!isListening || focusedElement !== document.body) {
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
const noop = function () { };
let VStep = class VStep extends Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.removeActionListener = noop;
        this.cacheElements = new Map();
        this.promiseTargetElements = Promise.resolve();
        this.targetElements = new Set();
        this.parentElements = new Set();
        this.highlightElements = new Set();
        this.timerSetFocus = 0;
        this.updateBox = 0;
    }
    /* }}} */
    /* {{{ computed */
    get fullOptions() {
        return this.step.options;
    }
    /* {{{ targets */
    get elements() {
        return Array.from(this.targetElements);
    }
    get mainElement() {
        const element = this.elements[0];
        return element || null;
    }
    get elementsBox() {
        const elements = this.elements;
        /* XXX: only for reactivity, to force to recompute box coordinates */
        this.updateBox;
        const memo = new WeakMap();
        return elements.map((element) => {
            return getBox(element, memo);
        });
    }
    get isMainElementHidden() {
        const mainBox = this.elementsBox[0];
        if (mainBox && mainBox[4] !== 'visible') {
            return true;
        }
        return false;
    }
    /* }}} */
    /* {{{ mask */
    get masksBox() {
        const { mask } = this.fullOptions;
        if (!mask) {
            return emptyArray;
        }
        const elementsBox = this.elementsBox;
        if (mask === true) {
            if (this.isMainElementHidden) {
                /* Add the parent box, if element is not visible. This is to have a
                * visible box to scroll */
                return [
                    ...elementsBox,
                    getBox(this.mainElement, new WeakMap(), { getParentBox: true }),
                ];
            }
            else {
                return elementsBox;
            }
        }
        /* XXX: only for reactivity, to force to recompute box coordinates */
        this.updateBox;
        const cache = this.cacheElements;
        const selectors = Array.isArray(mask) ? mask : [mask];
        const memo = new WeakMap();
        const boxes = selectors.reduce((boxList, selector) => {
            const listElements = getElement(selector, {
                all: true,
                purpose: 'mask',
                cache,
                errorIsWarning: true,
            });
            if (listElements) {
                for (const element of listElements) {
                    boxList.push(getBox(element, memo));
                }
            }
            else {
                /* some elements have not been found, search them asynchronously */
                getElement(selector, {
                    timeout: this.fullOptions.timeout,
                    all: true,
                    purpose: 'mask',
                    cache,
                    errorIsWarning: true,
                }).then((result) => {
                    if (result) {
                        /* Recompute the boxes */
                        this.updateBox++;
                    }
                });
            }
            return boxList;
        }, []);
        /* Add the parent box, if element is not visible. This is to have a
         * visible box to scroll */
        if (this.isMainElementHidden) {
            boxes.push(getBox(this.mainElement, new WeakMap(), { getParentBox: true }));
        }
        return boxes;
    }
    /* }}} */
    /* {{{ arrows */
    get arrowsPosition() {
        const arrow = this.fullOptions.arrow;
        if (typeof arrow === 'boolean') {
            return arrow;
        }
        /* XXX: only for reactivity, to force to recompute box coordinates */
        this.updateBox;
        const cache = this.cacheElements;
        const selectors = Array.isArray(arrow) ? arrow : [arrow];
        const memo = new WeakMap();
        const positions = selectors.reduce((positionList, selector) => {
            const listElements = getElement(selector, {
                all: true,
                purpose: 'arrow',
                cache,
                errorIsWarning: true,
            });
            if (listElements) {
                for (const element of listElements) {
                    const box = getBox(element, memo);
                    const placement = getPlacement(box);
                    const [x, y, position] = getPosition(box, placement);
                    positionList.push({ x, y, position });
                }
            }
            else {
                /* some elements have not been found, search them asynchronously */
                getElement(selector, {
                    timeout: this.fullOptions.timeout,
                    all: true,
                    purpose: 'arrow',
                    cache,
                    errorIsWarning: true,
                }).then((result) => {
                    if (result) {
                        /* Recompute the boxes (and so arrows) */
                        this.updateBox++;
                    }
                });
            }
            return positionList;
        }, []);
        return positions;
    }
    /* }}} */
    /* {{{ Next action */
    get nextActionType() {
        return getActionType(this.step.desc);
    }
    get nextActionTarget() {
        const type = this.nextActionType;
        if (type === 'next') {
            return null;
        }
        const action = this.step.desc.actionNext;
        if (typeof action === 'string') {
            return this.mainElement;
        }
        const target = action === null || action === void 0 ? void 0 : action.target;
        if (typeof target !== 'string') {
            return this.mainElement;
        }
        return getElement(target, { purpose: 'nextAction' });
    }
    get needsNextButton() {
        return this.step.status.isActionNext;
    }
    /* }}} */
    /* {{{ listeners */
    get actionListener() {
        return () => {
            const type = this.nextActionType;
            const valueEventName = ['input', 'change'];
            if (valueEventName.includes(type)) {
                const action = this.step.desc.actionNext;
                const targetElement = this.nextActionTarget;
                if (!checkExpression(action, targetElement, 'nextAction')) {
                    return;
                }
            }
            this.$emit('next');
        };
    }
    get recomputeBoxListener() {
        return () => {
            this.updateBox++;
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
        /* Remove events */
        this.clearScrollListener();
        /* Add events */
        const parentElements = this.parentElements;
        function addParents(el) {
            let node = el;
            while (node) {
                node = node.parentElement;
                if (node) {
                    parentElements.add(node);
                }
            }
        }
        this.elements.forEach(addParents);
        parentElements.add(window);
    }
    onHighlightChange() {
        this.removeClass(Array.from(this.highlightElements));
        this.highlightElements.clear();
        this.addHighlightClass();
    }
    onParentElementsChange() {
        this.addScrollListener();
    }
    onActionTypeChange() {
        this.addActionListener();
    }
    /* XXX: flush: post is needed because some of the variable are related to DOM */
    onStepChange() {
        this.scroll();
        this.setFocus();
        debug(22, this.fullOptions, {
            step: this.step,
            tutorialInformation: this.tutorialInformation,
        });
    }
    onStepTargetChange() {
        this.resetElements();
    }
    onElementsBoxChange() {
        debug(25, this.fullOptions, {
            elementsBox: this.elementsBox,
            elements: this.elements,
            tutorialInformation: this.tutorialInformation,
        });
    }
    /* }}} */
    /* {{{ methods */
    resetElements(get = true) {
        this.removeClass(this.elements);
        this.removeClass(Array.from(this.highlightElements));
        this.cacheElements.clear();
        this.targetElements.clear();
        this.highlightElements.clear();
        if (get) {
            this.getTargetElements();
        }
    }
    getTargetElements() {
        const targetElements = this.targetElements;
        const target = this.step.desc.target;
        if (!(target === null || target === void 0 ? void 0 : target.length)) {
            return;
        }
        const timeout = this.fullOptions.timeout;
        const cache = this.cacheElements;
        const targets = Array.isArray(target) ? target : [target];
        const promises = [];
        targets.forEach(async (selector) => {
            const promise = getElement(selector, {
                timeout,
                all: true,
                purpose: 'targets',
                cache,
            });
            promises.push(promise);
            const elements = await promise;
            if (elements === null || elements === void 0 ? void 0 : elements.length) {
                elements.forEach((el) => targetElements.add(el));
            }
        });
        this.promiseTargetElements = Promise.all(promises);
    }
    setFocus() {
        const fullOptions = this.fullOptions;
        const focusCfg = fullOptions.focus;
        clearTimeout(this.timerSetFocus++);
        switch (focusCfg) {
            case false:
            case 'no-focus': {
                /* Remove focus from any element */
                const el = document.activeElement;
                el === null || el === void 0 ? void 0 : el.blur();
                break;
            }
            case 'keep':
                /* Do not change any focus */
                return;
            case true:
            case 'main-target': {
                /* set focus to the main target */
                const timeout = fullOptions.timeout;
                /* Timer is to stop the watch after timeout. */
                this.timerSetFocus = setTimeout(() => {
                    stopWatch();
                    error(324, { timeout, selector: '{main-target}', purpose: 'focus' });
                }, timeout || 10);
                const refTimer = this.timerSetFocus;
                const stopWatch = watch(() => this.mainElement, () => {
                    const timerSetFocus = this.timerSetFocus;
                    /* check that function is not outdated */
                    if (refTimer !== timerSetFocus) {
                        clearTimeout(timerSetFocus);
                        stopWatch();
                        return;
                    }
                    /* Check if mainElement is defined in order to set focus */
                    const mainElement = this.mainElement;
                    if (mainElement) {
                        mainElement.focus();
                        clearTimeout(timerSetFocus);
                        /* defer stopWatch in order to be sure that the value exists (due to immediate option) */
                        setTimeout(() => stopWatch(), 0);
                        return;
                    }
                }, { immediate: true });
                break;
            }
            default: {
                /* Set focus to given target */
                const target = focusCfg.target;
                const refTimer = this.timerSetFocus;
                getElement(target, {
                    purpose: 'focus',
                    timeout: fullOptions.timeout,
                }).then((el) => {
                    if (el && refTimer === this.timerSetFocus) {
                        el.focus();
                    }
                });
                break;
            }
        }
    }
    async scroll() {
        var _a, _b;
        const options = this.fullOptions;
        const scroll = options.scroll;
        let behavior;
        let target;
        if (typeof scroll === 'boolean') {
            await this.promiseTargetElements;
            behavior = scroll ? 'scroll-to' : 'no-scroll';
            target = this.mainElement;
        }
        else if (typeof scroll === 'string') {
            await this.promiseTargetElements;
            behavior = scroll;
            target = this.mainElement;
        }
        else {
            behavior = (_a = scroll.scrollKind) !== null && _a !== void 0 ? _a : 'scroll-to';
            target = await getElement(scroll.target, {
                purpose: 'scroll',
                timeout: (_b = scroll.timeout) !== null && _b !== void 0 ? _b : options.timeout,
                errorIsWarning: true,
            });
        }
        if (target && behavior === 'scroll-to') {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
    addHighlightClass() {
        const highlight = this.fullOptions.highlight;
        if (!highlight) {
            return;
        }
        const highlightElements = this.highlightElements;
        if (highlight === true) {
            const mainElement = this.mainElement;
            if (mainElement) {
                mainElement === null || mainElement === void 0 ? void 0 : mainElement.classList.add('vue3-tutorial-highlight');
                highlightElements.add(mainElement);
            }
            return;
        }
        const selectors = Array.isArray(highlight) ? highlight : [highlight];
        const timeout = this.fullOptions.timeout;
        const cache = this.cacheElements;
        selectors.forEach(async (selector) => {
            const elements = await getElement(selector, {
                all: true,
                timeout,
                purpose: 'highlight',
                cache,
                errorIsWarning: true,
            });
            if (elements) {
                for (const el of elements) {
                    el.classList.add('vue3-tutorial-highlight');
                    highlightElements.add(el);
                }
            }
        });
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
        options.highlight;
        const mainEl = newTargets[0];
        if (mainEl) {
            mainEl.classList.add('vue3-tutorial__main-target');
        }
    }
    removeClass(oldTargets) {
        const options = this.fullOptions;
        const classForTargets = options.classForTargets;
        /* remove previous vue3-tutorial class */
        oldTargets.forEach((el) => {
            el.classList.remove('vue3-tutorial-highlight', 'vue3-tutorial__target', 'vue3-tutorial__main-target');
            if (classForTargets) {
                el.classList.remove(classForTargets);
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
            this.removeActionListener = noop;
        };
    }
    addScrollListener() {
        const callback = this.recomputeBoxListener;
        const parentElements = this.parentElements;
        for (const el of parentElements) {
            el.addEventListener('scroll', callback);
        }
    }
    clearScrollListener() {
        const callback = this.recomputeBoxListener;
        const elements = this.parentElements;
        for (const el of elements) {
            el.removeEventListener('scroll', callback);
        }
        this.parentElements.clear();
    }
    addResizeListener() {
        const callback = this.recomputeBoxListener;
        window.addEventListener('resize', callback);
    }
    removeResizeListener() {
        const callback = this.recomputeBoxListener;
        window.removeEventListener('resize', callback);
    }
    /* }}} */
    /* {{{ Life cycle */
    /* }}} */
    mounted() {
        this.addResizeListener();
        debug(20, this.fullOptions, {
            step: this.step,
            tutorialInformation: this.tutorialInformation,
        });
    }
    unmounted() {
        this.resetElements(false);
        this.removeActionListener();
        this.clearScrollListener();
        this.removeResizeListener();
        debug(21, this.fullOptions, {
            step: this.step,
            tutorialInformation: this.tutorialInformation,
        });
    }
    render() {
        const options = this.fullOptions;
        const stepDesc = this.step.desc;
        const information = this.tutorialInformation;
        return (h(Window$1, { elementsBox: this.elementsBox, masksBox: this.masksBox, position: options.position, arrow: this.arrowsPosition, arrowAnimation: options.arrowAnimation, mask: !!options.mask, maskMargin: options.maskMargin },
            h("aside", { slot: "content", class: "vue3-tutorial__step" },
                h("header", { class: "vue3-tutorial__step__header" },
                    h("div", { class: "vue3-tutorial__step__header__title" }, stepDesc.title),
                    h("div", { class: "vue3-tutorial__step__header__status" }, label('stepState', {
                        currentStep: information.currentIndex + 1,
                        totalStep: information.nbTotalSteps,
                    }))),
                h("div", { class: "vue3-tutorial__step__content" },
                    h(Markdown, { source: stepDesc.content })),
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
], VStep.prototype, "tutorialInformation", void 0);
__decorate$1([
    Watch('fullOptions.texts')
], VStep.prototype, "onTextsChange", null);
__decorate$1([
    Watch('fullOptions.bindings', { immediate: true, deep: true })
], VStep.prototype, "onBindingsChange", null);
__decorate$1([
    Watch('elements', { deep: true })
], VStep.prototype, "onElementsChange", null);
__decorate$1([
    Watch('elements', { deep: true, flush: 'post' }),
    Watch('fullOptions.highlight', { deep: true, flush: 'post' })
], VStep.prototype, "onHighlightChange", null);
__decorate$1([
    Watch('parentElements', { deep: true })
], VStep.prototype, "onParentElementsChange", null);
__decorate$1([
    Watch('nextActionTarget'),
    Watch('nextActionType', { immediate: true })
], VStep.prototype, "onActionTypeChange", null);
__decorate$1([
    Watch('step.desc', { immediate: true, deep: false, flush: 'post' })
], VStep.prototype, "onStepChange", null);
__decorate$1([
    Watch('step.desc.target', { immediate: true })
], VStep.prototype, "onStepTargetChange", null);
__decorate$1([
    Watch('elementsBox')
], VStep.prototype, "onElementsBoxChange", null);
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

var css_248z = "/* {{{ variables */\n\n:root {\n    /** Main color used for component */\n    --vue3-tutorial-brand-primary: #42b883;\n\n    /** Secondary color used for contrast */\n    --vue3-tutorial-brand-secondary: #2c3e50;\n\n    /** zIndex used by popup window for the tips. It should be higher than\n     * your other components\n     * The mask will use this value.\n     * The arrow will use this value + 10;\n     * The pop-up window will use this value + 20;\n     */\n    --vue3-tutorial-zindex: 1000;\n\n    /** The background color of the step window */\n    --vue3-tutorial-step-bg-color: var(--vue3-tutorial-brand-primary);\n    /** The text color of step window */\n    --vue3-tutorial-step-text-color: white;\n\n    /** The background color of the header of step window */\n    --vue3-tutorial-step-header-bg-color: var(--vue3-tutorial-brand-secondary);\n    /** The text color of the header of step window */\n    --vue3-tutorial-step-header-text-color: var(--vue3-tutorial-step-text-color);\n\n    /** The shadow style of the popup-window */\n    --vue3-tutorial-window-shadow: 2px 5px 15px black;\n\n    /** The shadow style of the highlighted element */\n    --vue3-tutorial-highlight-shadow: 0 0 10px var(--vue3-tutorial-brand-primary), inset 0 0 10px var(--vue3-tutorial-brand-primary);\n\n    /** The mask fill color */\n    --vue3-tutorial-mask-color: #c8c8c8bb;\n}\n\n/* }}} */\n/* {{{ animations */\n\n@keyframes v3-tutorial-verticalWave {\n    from {margin-top: -3px;}\n    to {margin-top: 3px;}\n}\n\n@keyframes v3-tutorial-horizontalWave {\n    from {margin-left: -3px;}\n    to {margin-left: 3px;}\n}\n\n/* }}} */\n/* {{{ Window */\n\n.vue3-tutorial__window {\n    position: fixed;\n    z-index: calc(var(--vue3-tutorial-zindex) + 20);\n    box-shadow: var(--vue3-tutorial-window-shadow);\n    border-radius: 3px;\n    --vue3-tutorial-priv-window-margin: 20px;\n\n    min-width: 150px;\n\n    transition-property: top, left;\n    transition-duration: 250ms;\n}\n.vue3-tutorial__window.position-top {\n    transform: translate(-50%, calc(-100% - var(--vue3-tutorial-priv-window-margin)));\n}\n.vue3-tutorial__window.position-bottom {\n    transform: translate(-50%, var(--vue3-tutorial-priv-window-margin));\n}\n.vue3-tutorial__window.position-left {\n    transform: translate(calc(-100% - var(--vue3-tutorial-priv-window-margin)), -50%);\n}\n.vue3-tutorial__window.position-right {\n    transform: translate(var(--vue3-tutorial-priv-window-margin), -50%);\n}\n.vue3-tutorial__window.position-center {\n    transform: translate(-50%, -50%);\n}\n\n.vue3-tutorial__window-arrow,\n.vue3-tutorial__window-scroll-arrow {\n    position: fixed;\n    z-index: calc(var(--vue3-tutorial-zindex) + 10);\n    fill: var(--vue3-tutorial-brand-primary);\n    stroke: var(--vue3-tutorial-brand-secondary);\n}\n.vue3-tutorial__window-arrow.animation,\n.vue3-tutorial__window-scroll-arrow.animation {\n    animation-timing-function: ease-in-out;\n    animation-duration: 0.75s;\n    animation-iteration-count: infinite;\n    animation-direction: alternate;\n}\n.vue3-tutorial__window-arrow.position-top {\n    transform: translate(-50%, -100%)  rotate(-135deg);\n    animation-name: v3-tutorial-verticalWave;\n}\n.vue3-tutorial__window-arrow.position-bottom {\n    transform: translate(-50%) rotate(45deg);\n    animation-name: v3-tutorial-verticalWave;\n}\n.vue3-tutorial__window-arrow.position-left {\n    transform: translate(-100%, -50%) rotate(135deg);\n    animation-name: v3-tutorial-horizontalWave;\n}\n.vue3-tutorial__window-arrow.position-right {\n    transform: translate(0, -50%) rotate(-45deg);\n    animation-name: v3-tutorial-horizontalWave;\n}\n.vue3-tutorial__window-arrow.position-center {\n    display: none;\n}\n\n.vue3-tutorial__window-scroll-arrow.position-top {\n    transform: translate(-50%) rotate(45deg);\n    animation-name: v3-tutorial-verticalWave;\n}\n.vue3-tutorial__window-scroll-arrow.position-bottom {\n    transform: translate(-50%, -100%)  rotate(-135deg);\n    animation-name: v3-tutorial-verticalWave;\n}\n.vue3-tutorial__window-scroll-arrow.position-left {\n    transform: translate(0, -50%) rotate(-45deg);\n    animation-name: v3-tutorial-horizontalWave;\n}\n.vue3-tutorial__window-scroll-arrow.position-right {\n    transform: translate(-100%, -50%) rotate(135deg);\n    animation-name: v3-tutorial-horizontalWave;\n}\n.vue3-tutorial__window-scroll-arrow.position-center,\n.vue3-tutorial__window-scroll-arrow.position-visible {\n    display: none;\n}\n\n.vue3-tutorial__svg-mask {\n    position: fixed;\n    top: 0;\n    left: 0;\n    bottom: 100%;\n    right: 100%;\n    z-index: var(--vue3-tutorial-zindex);\n    pointer-events: none;\n}\n.vue3-tutorial__mask {\n    fill: var(--vue3-tutorial-mask-color);\n    stroke: none;\n    pointer-events: fill;\n}\n\n/* }}} */\n/* {{{ Step */\n\n.vue3-tutorial__step {\n    background-color: var(--vue3-tutorial-step-bg-color);\n    color: var(--vue3-tutorial-step-text-color);\n    padding: 1rem;\n    border-radius: 3px;\n}\n\n.vue3-tutorial__step__header {\n    background-color: var(--vue3-tutorial-step-header-bg-color);\n    color: var(--vue3-tutorial-step-header-text-color);\n    text-align: center;\n    padding: 0.5rem;\n    margin-top: -1rem;\n    margin-left: -1rem;\n    margin-right: -1rem;\n    border-radius: 3px;\n}\n\n.vue3-tutorial__step__header__title {\n    font-weight: 300;\n}\n\n.vue3-tutorial__step__header__status {\n    font-size: 0.7em;\n    font-style: italic;\n    opacity: 0.8;\n}\n\n.vue3-tutorial__step__content {\n    margin: 1rem 0 1rem 0;\n}\n\n.vue3-tutorial__step__btn {\n    background: transparent;\n    border: 0.05rem solid var(--vue3-tutorial-step-text-color);\n    border-radius: 0.1rem;\n    color: var(--vue3-tutorial-step-text-color);\n    cursor: pointer;\n    display: inline-block;\n    font-size: 0.8rem;\n    height: 1.8rem;\n    line-height: 1rem;\n    outline: none;\n    margin: 0 0.2rem;\n    padding: 0.35rem 0.4rem;\n    text-align: center;\n    text-decoration: none;\n    transition: all 0.2s ease;\n    vertical-align: middle;\n    white-space: nowrap;\n}\n\n.vue3-tutorial__step__btn-skip {\n    position: absolute;\n    top: 1px;\n    right: 1px;\n    font-size: 32px;\n    width: 32px;\n    height: 32px;\n    border-radius: 32px;\n    padding: 0 3px 0 3px;\n    transform: translate(calc(50% - 5px), calc(-50% + 9px)) scale(0.4);\n    transition: transform 600ms;\n}\n.vue3-tutorial__step__btn-skip:hover {\n    transform: translate(calc(50% - 5px), calc(-50% + 9px)) scale(0.7);\n}\n\n/* }}} */\n/* {{{ External elements */\n\n.vue3-tutorial-highlight {\n    box-shadow: var(--vue3-tutorial-highlight-shadow);\n}\n\n/* }}} */\n";
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
        var _a;
        const steps = (_a = this.tutorial) === null || _a === void 0 ? void 0 : _a.steps;
        if (!steps) {
            return emptyArray;
        }
        const tutorialOptions = this.tutorialOptions;
        const length = steps.length;
        return steps.map((step, index) => {
            return getStep(step, tutorialOptions, {
                currentIndex: index,
                nbTotalSteps: length,
                previousStepIsSpecial: false,
            });
        });
    }
    get nbTotalSteps() {
        return this.steps.length;
    }
    get currentStep() {
        const step = this.steps[this.currentIndex];
        if (!step) {
            if (this.isRunning) {
                error(302, {
                    nbTotalSteps: this.nbTotalSteps,
                    index: this.currentIndex,
                });
            }
            return;
        }
        return step;
    }
    get tutorialOptions() {
        var _a;
        return mergeStepOptions(DEFAULT_STEP_OPTIONS, this.options || {}, ((_a = this.tutorial) === null || _a === void 0 ? void 0 : _a.options) || {});
    }
    get currentStepIsSpecial() {
        const step = this.currentStep;
        return !!step && !step.status.isActionNext;
    }
    get previousStepIsSpecial() {
        let step;
        let index = this.currentIndex;
        do {
            index--;
            step = this.steps[index];
        } while (step === null || step === void 0 ? void 0 : step.status.skipped);
        if (!step) {
            return true;
        }
        return !step.status.isActionNext;
    }
    /* }}} */
    /* {{{ watch */
    onOpenChange() {
        if (this.open) {
            this.start();
        }
    }
    onStepsChange() {
        if (!this.tutorial) {
            this.stop();
            return;
        }
        this.start();
    }
    /* }}} */
    /* {{{ methods */
    /* {{{ navigation */
    async findStep(oldIndex, upDirection = true) {
        let newIndex = oldIndex;
        const nbTotalSteps = this.nbTotalSteps;
        const steps = this.steps;
        let step;
        try {
            let isSkipped;
            do {
                if (upDirection) {
                    if (newIndex >= nbTotalSteps - 1) {
                        this.stop(true);
                        return -1;
                    }
                    newIndex++;
                }
                else {
                    if (newIndex <= 0) {
                        error(204);
                        return -1;
                    }
                    newIndex--;
                }
                step = steps[newIndex];
                if (upDirection) {
                    /* When moving forward, we check the skipped status */
                    isSkipped = await step.checkSkipped();
                }
                else {
                    /* When moving backward, we reuse the previous skipped status */
                    isSkipped = step.status.skipped;
                }
            } while (isSkipped);
        }
        catch (err) {
            error(202, {
                index: this.currentIndex,
                fromIndex: oldIndex,
                error: err,
            });
            return -1;
        }
        return newIndex;
    }
    async start() {
        if (!this.tutorial) {
            error(303);
            this.stop(false);
            return;
        }
        if (this.isRunning) {
            /* The tutorial is already started */
            return;
        }
        this.isRunning = true;
        const currentIndex = await this.findStep(-1, true);
        this.currentIndex = currentIndex;
        if (currentIndex === -1) {
            error(203);
            this.isRunning = false;
            return;
        }
        this.$emit('start', currentIndex);
        startListening(this.onKeyEvent.bind(this));
        debug(2, this.tutorialOptions, { currentIndex });
    }
    async nextStep(forceNext = false) {
        if (!this.isRunning) {
            return;
        }
        if (!forceNext && this.currentStepIsSpecial) {
            return;
        }
        const oldIndex = this.currentIndex;
        const currentIndex = await this.findStep(oldIndex, true);
        if (currentIndex > -1) {
            this.currentIndex = currentIndex;
            this.$emit('nextStep', currentIndex, oldIndex);
            this.$emit('changeStep', currentIndex, oldIndex);
        }
    }
    async previousStep(forcePrevious = false) {
        if (!this.isRunning) {
            return;
        }
        if (!forcePrevious && this.previousStepIsSpecial) {
            return;
        }
        const oldIndex = this.currentIndex;
        const currentIndex = await this.findStep(oldIndex, false);
        if (currentIndex > -1) {
            this.currentIndex = currentIndex;
            this.$emit('previousStep', currentIndex, oldIndex);
            this.$emit('changeStep', currentIndex, oldIndex);
        }
    }
    stop(isFinished = false) {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        this.$emit('stop', isFinished);
        stopListening();
        debug(3, this.tutorialOptions, { currentIndex: this.currentIndex });
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
    mounted() {
        registerError((err) => {
            var _a, _b;
            const errEmitted = Object.assign({
                tutorialName: (_b = (_a = this.tutorial) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '',
                stepIndex: this.currentIndex,
            }, err);
            this.$emit('error', errEmitted);
        });
        debug(0, this.tutorialOptions, {
            open: this.open,
            tutorial: this.tutorial,
        });
    }
    unmounted() {
        unRegisterError();
        debug(1, this.tutorialOptions, {
            open: this.open,
            tutorial: this.tutorial,
        });
    }
    /* }}} */
    render() {
        const step = this.currentStep;
        if (!this.isRunning || !step) {
            return;
        }
        return (h(VStep$1, { step: step, tutorialInformation: {
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
    Prop()
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
    Emits(['changeStep', 'error', 'nextStep', 'previousStep', 'start', 'stop'])
], VTutorial.prototype, "render", null);
VTutorial = __decorate([
    Component
], VTutorial);
var VTutorial$1 = VTutorial;

export { VTutorial$1 as default, errorStatus };
