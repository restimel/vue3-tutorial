/* File Purpose:
 * It handles the display for one step
 */

/* Debug code = [20-29] */

import {
    Component,
    Emits,
    h,
    Prop,
    Vue,
    Watch,
} from 'vtyx';
import {
    watch,
} from 'vue';

import Markdown from './components/Markdown';
import Window from './components/Window';

import {
    checkExpression,
    getActionType,
} from './tools/step';
import label, { changeTexts } from './tools/labels';
import { resetBindings } from './tools/keyBinding';
import {
    ActionType,
    ArrowPosition,
    Box,
    ElementSelector,
    ErrorSelectorPurpose,
    EventAction,
    Rect,
    ScrollKind,
    Step,
    StepOptions,
    TutorialInformation,
} from './types';
import error, { debug } from './tools/errors';
import {
    addParents,
    emptyArray,
    getElement,
    getBox,
    getAnchorPoint,
    getDirection,
    shallowSetCopy,
    isElementVisible,
} from './tools/tools';

const noop = function() {};
const mutationConfig = { childList: true, subtree: true };

type MainElementList = [HTMLElement | null, ...HTMLElement[]];

type AllElementsInfo = {
    ref: number;
    timeout: number;
    purpose: ErrorSelectorPurpose;
    elements: HTMLElement[];
    error: boolean;
};

export interface Props {
    step: Step;
    tutorialInformation: TutorialInformation;
}

@Component
export default class VStep extends Vue<Props> {
    /* {{{ props */

    @Prop()
    private step: Step;

    @Prop()
    private tutorialInformation: TutorialInformation;

    /* }}} */
    /* {{{ data */

    /* XXX: some data are configured in elements Workflow */

    /* }}} */
    /* {{{ computed */

    private get fullOptions(): StepOptions {
        const options = this.step.options;

        if (options.position === 'hidden') {
            if (this.needsNextButton) {
                /* If there are no other possibility to go to "next" action
                 * then redisplay the step.
                 */
                return {...options, position: 'center'};
            }
        }

        return options;
    }

    /* {{{ buttons */

    private get displayPreviousButton(): boolean {
        const info = this.tutorialInformation;
        const previousStep = this.step.desc.previousStep;

        /* If previous step is special (it means user has to do an action)
         * then it should be better to not display the "previous" button.
         * But if previousStep is set, then it means that it is allowed from
         * this step to go backward.  */
        const avoidPrevious = info.previousStepIsSpecial && !previousStep;

        if (avoidPrevious || info.currentIndex <= 0) {
            return false;
        }

        return true;
    }

    private get displayNextButton(): boolean {
        const info = this.tutorialInformation;

        if (info.currentIndex >= info.nbTotalSteps - 1) {
            return false;
        }
        return this.needsNextButton;
    }

    private get displayFinishButton(): boolean {
        const info = this.tutorialInformation;

        if (info.currentIndex >= info.nbTotalSteps - 1) {
            return this.needsNextButton;
        }
        return false;
    }

    private get displaySkipButton(): boolean {
        return true;
    }

    /* }}} */
    /* }}} */
    /* {{{ watch */

    @Watch('fullOptions.texts')
    protected onTextsChange() {
        /* Update labels */
        changeTexts(this.fullOptions.texts);
    }

    @Watch('fullOptions.bindings', { immediate: true, deep: true })
    protected onBindingsChange() {
        /* update key bindings */
        resetBindings(this.fullOptions.bindings);
    }

    /* }}} */
    /* {{{ Next action */

    private removeActionListener: () => void = noop;

    private get nextActionType(): ActionType {
        return getActionType(this.step.desc);
    }

    /* Target the element where we expect user to interact with */
    private get nextActionTarget(): HTMLElement | null {
        const type = this.nextActionType;

        if (type === 'next') {
            return null;
        }

        const action = this.step.desc.actionNext;
        if (typeof action === 'string') {
            return this.mainElement;
        }

        const target = action?.target;
        if (typeof target !== 'string') {
            return this.mainElement;
        }

        /* XXX: only for reactivity, to force to get the correct element */
        this.targetElements;

        return getElement(target, { purpose: 'nextAction' });
    }

    private get needsNextButton(): boolean {
        return this.step.status.isActionNext;
    }

    private actionListener() {
        const type = this.nextActionType;
        const valueEventName = ['input', 'change'];

        if (valueEventName.includes(type)) {
            const action = this.step.desc.actionNext as EventAction;
            const targetElement = this.nextActionTarget!;

            if (!checkExpression(action, targetElement, 'nextAction')) {
                return;
            }
        }

        this.$emit('next');
    }

    private addActionListener() {
        const eventName = this.nextActionType;
        const el = this.nextActionTarget;

        this.removeActionListener();

        if (!el || eventName === 'next') {
            return;
        }

        const listener = this.actionListener;
        el.addEventListener(eventName, listener, { capture: true });
        this.removeActionListener = () => {
            el.removeEventListener(eventName, listener, { capture: true });
            this.removeActionListener = noop;
        };
    }

    @Watch('nextActionTarget')
    @Watch('nextActionType', { immediate: true })
    protected onActionTypeChange() {
        this.addActionListener();
    }

    /* }}} */
    /* {{{ Events */
        /* {{{ Resize */

        private addResizeListener() {
            const callback = this.recomputeBox;
            window.addEventListener('resize', callback);
        }

        private removeResizeListener() {
            const callback = this.recomputeBox;
            window.removeEventListener('resize', callback);
        }

        /* }}} */
        /* {{{ Scroll */

        private scrollElements = new Set<HTMLElement>();

        private addScrollListener() {
            const callback = this.recomputeBox;
            const scrollElements = this.scrollElements;

            for (const el of scrollElements) {
                el.addEventListener('scroll', callback);
            }
        }

        private clearScrollListener() {
            const callback = this.recomputeBox;
            const elements = this.scrollElements;

            for (const el of elements) {
                el.removeEventListener('scroll', callback);
            }

            this.scrollElements.clear();
        }

        @Watch('targetElements', {deep: true})
        @Watch('maskElements', {deep: true})
        @Watch('arrowElements', {deep: true})
        protected onPositionElementsChange() {
            const scrollElements = this.scrollElements;

            this.clearScrollListener();
            scrollElements.add(window as any);
            for (const el of this.targetElements) {
                addParents(el, scrollElements);
            }
            for (const el of this.maskElements) {
                addParents(el, scrollElements);
            }
            for (const el of this.arrowElements) {
                addParents(el, scrollElements);
            }
            this.addScrollListener();
        }

        /* }}} */
        /* {{{ Mutation */

        private get mutationObserver() {
            return new MutationObserver((mutationList) => {
                const el = this.nextActionTarget;
                if (!el) {
                    return;
                }
                for (const mutation of mutationList) {
                    if (mutation.type === 'childList'
                    && mutation.removedNodes.length
                    && el.getRootNode() !== document
                    ) {
                        /* On DOM change refetch all elements */
                        this.debounceGetAllElement();
                    }
                }
            });
        }

        /* }}} */
        /* }}} */
    /* {{{ Elements workflow */

    private cacheElements: Map<string, HTMLElement[]> = new Map();
    private boxCache = new WeakMap();
    private startTime: number = 0;
    private timerGetAllElements: number = 0;
    private working = new Map<ErrorSelectorPurpose, false | Promise<boolean>>();
    /* This property is updated anytime elements are refetch. It helps to show
     *  when an asynchronous request is deprecated. */
    private requestRef = 0;
    /* This property is only to force recompute Boxes and re-rendering */
    private updateBox = 0;

        /* {{{ Targets */

        private mainElement: HTMLElement | null = null;
        private targetElements = new Set<HTMLElement>();

        /** list of target elements.
         *
         * Convert the Set in Array.
         * The Set is used to avoid duplications.
         * The Array is used to keep elements in the same order as boxes.
         */
        private get targetElementsOrdered(): MainElementList {
            const list: MainElementList = Array.from(this.targetElements) as any;
            const mainElement = this.mainElement;
            const index = list.indexOf(mainElement!);

            if (index === -1) {
                list.unshift(mainElement);
            } else if (index > 0) {
                list.splice(index, 1);
                list.unshift(mainElement);
            }

            return list;
        }

        private get isMainElementHidden(): boolean {
            const mainBox = this.targetBoxes[0];
            if (mainBox && mainBox[4] !== 'visible') {
                return true;
            }
            return false;
        }

        private get targetBoxes(): Box[] {
            const elements = this.targetElements;

            /* XXX: only for reactivity, to force to recompute box coordinates */
            this.updateBox;

            const memo = this.boxCache;
            return Array.from(elements, (element) => {
                if (element) {
                    return getBox(element, memo);
                }
                return [0, 0, 0, 0, 'hidden'];
            });
        }

        private getTargetElements() {
            const targetElements = this.targetElements;

            this.getElements({
                selectors: this.step.desc.target,
                elements: targetElements,
                timeout: this.fullOptions.timeout,
                purpose: 'targets',
                errorIsWarning: false,
                thenCb: (elements, selector, index) => {
                    if (elements?.length) {
                        debug(26, this.fullOptions, {
                            elements,
                            selector,
                        });
                        if (index === 1) {
                            this.mainElement = elements[0];
                        }
                        elements.forEach((el) => targetElements.add(el));
                    } else {
                        /* No elements have been found */
                        debug(27, this.fullOptions, {
                            selector,
                        });
                        this.mainElement = null;
                    }
                },
            });
        }

        @Watch('targetBoxes')
        protected onElementsBoxChange() {
            const boxes = this.targetBoxes;
            const hasHiddenElement = boxes.some((box) => box[4] === 'hidden');

            const elements = this.targetElementsOrdered;
            debug(25, this.fullOptions, {
                elementsBox: boxes,
                elements: elements,
                tutorialInformation: this.tutorialInformation,
                hasHiddenElement,
            });

            if (hasHiddenElement) {
                const timeout = this.fullOptions.timeout;
                const endTime = this.startTime + timeout;

                const hiddenElements = boxes.reduce<HTMLElement[]>((list, box, idx) => {
                    if (box[4] === 'hidden') {
                        list.push(elements[idx]!);
                    }
                    return list;
                }, []);
                const hasVisibleElement = hiddenElements.length < boxes.length;

                /* force to recompute */
                const ref = this.requestRef;
                setTimeout(() => this.getAllElements({
                    ref,
                    timeout,
                    purpose: 'targets',
                    elements: hiddenElements,
                    error: !hasVisibleElement,
                }), 50);
            }
        }

        /* }}} */
        /* {{{ Highlight & class */

        private highlightElements = new Set<HTMLElement>();
        private oldHighlightElements = new Set<HTMLElement>();

        private getHighlightElements() {
            const highlight = this.fullOptions.highlight;
            const highlightElements = this.highlightElements;
            highlightElements.clear();

            if (!highlight || highlight === true) {
                return;
            }

            this.getElements({
                selectors: highlight,
                elements: highlightElements,
                timeout: this.fullOptions.timeout,
                purpose: 'highlight',
                errorIsWarning: true,
                thenCb: (elements) => {
                    if (elements) {
                        elements.forEach((el) => highlightElements.add(el));
                    }
                },
            });
        }

        private addHighlightClass() {
            const highlight = this.fullOptions.highlight;
            if (!highlight) {
                return;
            }

            const highlightElements = this.highlightElements;

            for (const el of highlightElements) {
                el.classList.add('vue3-tutorial-highlight');
            }
        }

        private addClass(newTargets: MainElementList) {
            const options = this.fullOptions;
            const classForTargets = options.classForTargets;

            /* add vue3-tutorial class */
            newTargets.forEach((el) => {
                if (!el) {
                    return;
                }

                el.classList.add(
                    'vue3-tutorial__target'
                );
                if (classForTargets) {
                    el.classList.add(classForTargets);
                }
            });
            const mainEl = newTargets[0];
            if (mainEl) {
                mainEl.classList.add('vue3-tutorial__main-target');
            }
        }

        private removeClass(elements: MainElementList | Set<HTMLElement>) {
            const options = this.fullOptions;
            const classForTargets = options.classForTargets;

            /* remove previous vue3-tutorial class */
            elements.forEach((el) => {
                if (!el) {
                    return;
                }

                el.classList.remove(
                    'vue3-tutorial-highlight',
                    'vue3-tutorial__target',
                    'vue3-tutorial__main-target'
                );
                if (classForTargets) {
                    el.classList.remove(classForTargets);
                }
            });
            if (elements instanceof Set) {
                elements.clear();
            }
        }

        @Watch('targetElementsOrdered')
        protected onElementsChange(oldList: MainElementList) {
            /* cleanup previous elements */
            this.removeClass(oldList);

            /* add class to elements */
            const newList = this.targetElementsOrdered;
            this.addClass(newList);
            this.addHighlightClass();
        }
        @Watch('highlightElements', { deep: true })
        protected onHighlightElementsChange() {
            const oldList = this.oldHighlightElements;

            /* cleanup previous elements */
            this.removeClass(oldList);

            shallowSetCopy(this.highlightElements, oldList);

            /* add class to elements */
            this.addHighlightClass();
        }
        @Watch('mainElement')
        protected onMainElementChange() {
            const highlight = this.fullOptions.highlight;

            if (highlight === true) {
                const highlightElements = this.highlightElements;
                const mainElement = this.mainElement;
                if (mainElement) {
                    highlightElements.clear();
                    highlightElements.add(mainElement);
                }
            }
        }

        /* }}} */
        /* {{{ Mask */

        private maskElements = new Set<HTMLElement>();

        private get masksBox(): Box[] {
            const { mask } = this.fullOptions;

            if (!mask) {
                return emptyArray;
            }
            const cache = this.boxCache;
            const mainElement = this.mainElement;

            if (mask === true) {
                const elementsBox = this.targetBoxes;
                if (mainElement && this.isMainElementHidden) {
                    /* Add the parent box, if element is not visible. This is
                    * to have a visible box to scroll */
                    return [
                        ...elementsBox,
                        getBox(mainElement, cache, {getParentBox: true}),
                    ];
                } else {
                    return elementsBox;
                }
            }

            /* XXX: only for reactivity, to force to recompute box coordinates */
            this.updateBox;

            const listElements = this.maskElements;
            const boxList: Box[] = [];

            for (const element of listElements) {
                boxList.push(getBox(element, cache));
            }

            /* Add the parent box, if element is not visible. This is to have a
            * visible box to scroll */
            if (mainElement && this.isMainElementHidden) {
                boxList.push(getBox(mainElement, cache, {getParentBox: true}));
            }

            return boxList;
        }

        private getMaskElements() {
            const mask = this.fullOptions.mask;

            if (typeof mask === 'boolean') {
                this.working.set('mask', false);
                return;
            }
            const maskElements = this.maskElements;
            this.getElements({
                selectors: mask,
                elements: maskElements,
                timeout: this.fullOptions.timeout,
                purpose: 'mask',
                errorIsWarning: true,
                thenCb: (elements) => {
                    if (elements?.length) {
                        elements.forEach((el) => maskElements.add(el));
                    }
                },
            });
        }

        /* }}} */
        /* {{{ Arrows */

        private arrowElements = new Set<HTMLElement>();

        private get arrowsPosition(): boolean | ArrowPosition[] {
            const arrow = this.fullOptions.arrow;

            if (typeof arrow === 'boolean') {
                return arrow;
            }

            /* XXX: only for reactivity, to force to recompute box coordinates */
            this.updateBox;

            const memo = this.boxCache;
            const listElements = this.arrowElements;
            const positionList: ArrowPosition[] = [];

            for (const element of listElements) {
                const box = getBox(element, memo);
                const placement = getDirection(box as unknown as Rect);
                const [x, y, position] = getAnchorPoint(box, placement);
                positionList.push({ x, y, position });
            }

            return positionList;
        }

        private getArrowElements() {
            const arrow = this.fullOptions.arrow;

            if (typeof arrow === 'boolean') {
                this.working.set('arrow', false);
                return;
            }

            const arrowElements = this.arrowElements;
            this.getElements({
                selectors: arrow,
                elements: arrowElements,
                timeout: this.fullOptions.timeout,
                purpose: 'arrow',
                errorIsWarning: true,
                thenCb: (elements) => {
                    if (elements?.length) {
                        elements.forEach((el) => arrowElements.add(el));
                    }
                },
            });
        }

        /* }}} */
        /* {{{ Muted */

        /* [Element, tabIndex it had before mute ] */
        private mutedElements: Map<HTMLElement, number> = new Map();

        private getMutedElements() {
            this.resetMutedElements();
            const mutedSelectors = this.fullOptions.muteElements;
            const mutedElements = this.mutedElements;

            if (!mutedSelectors) {
                return;
            }

            this.getElements({
                selectors: mutedSelectors,
                elements: mutedElements,
                timeout: this.fullOptions.timeout,
                purpose: 'mute',
                errorIsWarning: true,
                thenCb: (elements) => {
                    if (elements) {
                        elements.forEach((el) => {
                            if (!mutedElements.has(el)) {
                                mutedElements.set(el, el.tabIndex);
                                el.classList.add('vue3-tutorial-muted');
                                el.tabIndex = -1;
                            }
                        });
                    }
                },
            });
        }

        private resetMutedElements() {
            const elements = this.mutedElements;
            for (const [element, tabindex] of elements) {
                element.tabIndex = tabindex;
                element.classList.remove('vue3-tutorial-muted');
            }
            elements.clear();
        }

        /* }}} */
        /* {{{ Focus */

        private timerSetFocus = 0;
        private stopWatchForFocus: () => void = noop;

        private setFocus() {
            const fullOptions = this.fullOptions;
            const focusCfg = fullOptions.focus;
            this.stopWatchForFocus();
            this.timerSetFocus++

            switch (focusCfg) {
                case false:
                case 'false':
                case 'no-focus': {
                    /* Remove focus from any element */
                    const el = document.activeElement as HTMLElement | null;
                    el?.blur();
                    break;
                }
                case 'keep':
                    /* Do not change any focus */
                    return;
                case true:
                case 'true':
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

                    this.stopWatchForFocus = () => {
                        stopWatch();
                        clearTimeout(this.timerSetFocus);
                        this.stopWatchForFocus = noop;
                    };
                    break;
                }
                default: {
                    /* Set focus to given target */
                    const target = focusCfg.target;
                    const refTimer = this.timerSetFocus;
                    const timeout = focusCfg.timeout ?? fullOptions.timeout;

                    getElement(target, {
                        purpose: 'focus',
                        timeout: timeout,
                    }).then((el) => {
                        if (el && refTimer === this.timerSetFocus) {
                            el.focus();
                        }
                    });
                    break;
                }
            }
        }

        /* }}} */
        /* {{{ Scroll To */

        private async scrollTo() {
            const options = this.fullOptions;
            let scroll = options.scroll;
            let behavior: ScrollKind;
            let target: HTMLElement | null;

            if (typeof scroll === 'boolean') {
                const targetWorking = this.working.get('targets');
                if (targetWorking instanceof Promise) {
                    await targetWorking;
                }
                behavior = scroll ? 'scroll-to' : 'no-scroll';
                target = this.mainElement;
            } else if (typeof scroll === 'string') {
                if (scroll === 'true') {
                    scroll = 'scroll-to';
                } else if (scroll === 'false') {
                    scroll = 'no-scroll';
                }

                const targetWorking = this.working.get('targets');
                if (targetWorking instanceof Promise) {
                    await targetWorking;
                }
                behavior = scroll;
                target = this.mainElement;
            } else {
                behavior = scroll.scrollKind ?? 'auto-scroll';
                target = await getElement(scroll.target, {
                    purpose: 'scroll',
                    timeout: scroll.timeout ?? options.timeout,
                    errorIsWarning: true,
                });
            }

            if (target && (behavior === 'scroll-to' || behavior === 'auto-scroll')) {
                const box = getBox(target, this.boxCache);

                if (behavior === 'scroll-to' || !isElementVisible(box)) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }

        /* }}} */
        /* {{{ global */

        private get isStepReady(): boolean {
            const working = this.working;
            if (working.size === 0) {
                return false;
            }
            for (const isWorking of working.values()) {
                if (isWorking) {
                    return false;
                }
            }
            return true;
        }

        private recomputeBox() {
            this.updateBox++;
            this.boxCache = new WeakMap();
        }

        private debounceGetAllElement(info?: AllElementsInfo, timer = 10) {
            clearTimeout(this.timerGetAllElements);
            this.timerGetAllElements = setTimeout(() => {
                this.getAllElements(info);
            }, timer);
        }

        /** Fetch all elements needed for the step.
         *
         * @param ref {number} this is to check if the query is deprecated.
         *                     if 0, a new query is done.
         */
        private getAllElements(info?: AllElementsInfo) {
            const {
                ref = 0,
                timeout = this.fullOptions.timeout,
                purpose,
                elements,
                error: sendError,
            } = info ?? {};
            const currentTime = performance.now();

            /* Check if timeout is reached */
            if (ref) {
                if (ref !== this.requestRef) {
                    /* A newer query has already been requested */
                    return;
                }

                const duration = currentTime - this.startTime;

                if (duration > timeout) {
                    const details = {
                        timeout,
                        elements,
                        purpose,
                    };

                    if (sendError) {
                        error(325, details);
                    } else {
                        error(225, details);
                    }
                    return;
                }
            }

            /* Reinitialize */
            this.requestRef++;
            this.cacheElements.clear();
            this.boxCache = new WeakMap();
            if (!ref) {
                this.startTime = currentTime;
            }

            /* fetch elements */
            this.getTargetElements();
            this.getMaskElements();
            this.getArrowElements();
            this.getHighlightElements();
            this.getMutedElements();

            /* Apply effects */
            this.scrollTo();
            this.setFocus();


            debug(24, this.fullOptions, {
                ref: this.requestRef,
                startTime: this.startTime,
                currentTime,
            });
            /* TODO: check that it is ok (no hidden element) */
        }

        private getElements(arg: {
            selectors?: ElementSelector;
            elements: Set<HTMLElement> | Map<HTMLElement, any>;
            timeout: number;

            purpose: ErrorSelectorPurpose;
            errorIsWarning: boolean;

            thenCb: (elements: HTMLElement[] | null, selector: string, index: number) => void;
        }) {
            const {
                selectors,
                elements,
                timeout,
                purpose,
                errorIsWarning,
                thenCb,
            } = arg;
            const ref = this.requestRef;

            elements.clear();
            const querySelectors: string[] = Array.isArray(selectors) ? selectors : [selectors] as [string];

            if (!selectors || !querySelectors.length) {
                this.working.set(purpose, false);
                thenCb(null, querySelectors[0], 0);
                return;
            }

            const isDeprecated = this.isDeprecated;
            const cache = this.cacheElements;

            const promises: Array<Promise<any>> = [];

            querySelectors.forEach(async (selector) => {
                const promise = getElement(selector, {
                    timeout,
                    all: true,
                    purpose,
                    cache,
                    errorIsWarning,
                });
                const index = promises.push(promise);
                const elements = await promise;

                if (isDeprecated(ref)) {
                    return;
                }

                thenCb(elements, selector, index);
            });

            const allPromises = Promise.all(promises).then(() => {
                if (isDeprecated(ref)) {
                    return false;
                }
                this.working.set(purpose, false);
                return true;
            });
            this.working.set(purpose, allPromises);
        }

        private isDeprecated(ref: number) {
            return ref !== this.requestRef;
        }

        @Watch('step.desc.target', { immediate: true, deep: true })
        protected onStepTargetChange() {
             /* Step changed */
             debug(22, this.fullOptions, {
                step: this.step,
                tutorialInformation: this.tutorialInformation,
            });

            /* Fetch elements for this step */
            this.getAllElements();
        }

        @Watch('isStepReady')
        protected onReadyChange() {
            this.mutationObserver.disconnect();
            if (this.isStepReady) {
                this.mutationObserver.observe(document.body, mutationConfig);
            }
        }

        /* }}} */
    /* }}} */
    /* {{{ Life cycle */
    /* }}} */

    public mounted() {
        this.addResizeListener();

        debug(20, this.fullOptions, {
            step: this.step,
            tutorialInformation: this.tutorialInformation,
        });
    }

    public unmounted() {
        this.removeClass(this.targetElements);
        this.removeClass(this.oldHighlightElements);
        this.removeClass(this.highlightElements);
        this.resetMutedElements();
        this.stopWatchForFocus();
        this.removeActionListener();
        this.clearScrollListener();
        this.removeResizeListener();
        this.mutationObserver.disconnect();

        this.cacheElements.clear();
        /* Ensure that all asynchronous request will be deprecated */
        this.requestRef++;

        debug(21, this.fullOptions, {
            step: this.step,
            tutorialInformation: this.tutorialInformation,
        });
    }

    @Emits(['finish', 'next', 'previous', 'skip'])
    public render() {
        const options = this.fullOptions;
        const stepDesc = this.step.desc;
        const information = this.tutorialInformation;

        return (
            <Window
                elementsBox={this.targetBoxes}
                masksBox={this.masksBox}
                position={options.position}
                arrow={this.arrowsPosition}
                arrowAnimation={options.arrowAnimation}
                mask={!!options.mask}
                maskMargin={options.maskMargin}
                teleport={options.teleport}
            >
                <aside slot="content"
                    class="vue3-tutorial__step"
                >
                    <header
                        class="vue3-tutorial__step__header"
                    >
                        <div
                            class="vue3-tutorial__step__header__title"
                        >
                            {stepDesc.title}
                        </div>
                        <div
                            class="vue3-tutorial__step__header__status"
                        >
                            {label('stepState', {
                                currentStep: information.currentIndex + 1,
                                totalStep: information.nbTotalSteps,
                            })}
                        </div>
                    </header>
                    <div
                        class="vue3-tutorial__step__content"
                    >
                        <Markdown
                            source={stepDesc.content}
                        />
                    </div>
                    <nav
                        class="vue3-tutorial__step__commands"
                    >
                        {this.displayPreviousButton && (
                        <button
                            class="vue3-tutorial__step__btn vue3-tutorial__step__btn-previous"
                            on={{
                                click: () => this.$emit('previous'),
                            }}
                        >
                            {label('previousButton')}
                        </button>
                        )}
                        {this.displaySkipButton && (
                        <button
                            class="vue3-tutorial__step__btn vue3-tutorial__step__btn-skip"
                            on={{
                                click: () => this.$emit('skip'),
                            }}
                            title={label('skipButtonTitle') as unknown as string}
                        >
                            ×
                        </button>
                        )}
                        {this.displayNextButton && (
                        <button
                            class="vue3-tutorial__step__btn vue3-tutorial__step__btn-next"
                            on={{
                                click: () => this.$emit('next'),
                            }}
                        >
                            {label('nextButton')}
                        </button>
                        )}
                        {this.displayFinishButton && (
                        <button
                            class="vue3-tutorial__step__btn vue3-tutorial__step__btn-finish"
                            on={{
                                click: () => this.$emit('finish'),
                            }}
                        >
                            {label('finishButton')}
                        </button>
                        )}
                    </nav>
                </aside>
            </Window>
        );
    }
}
