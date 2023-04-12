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
    EventAction,
    Rect,
    ScrollKind,
    Step,
    StepOptions,
    TutorialInformation,
} from './types';
import error, { debug } from './tools/errors';
import {
    emptyArray,
    getElement,
    getBox,
    getPosition,
    getPlacement,
} from './tools/tools';

const noop = function() {};
const mutationConfig = { childList: true, subtree: true };

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

    private removeActionListener: () => void = noop;
    private cacheElements: Map<string, HTMLElement[]> = new Map();
    private promiseTargetElements: Promise<any> = Promise.resolve();
    private targetElements: Set<HTMLElement> = new Set();
    private parentElements: Set<HTMLElement> = new Set();
    private mutedElements: Map<HTMLElement, number> = new Map();
    private highlightElements: Set<HTMLElement> = new Set();
    private timerSetFocus: number = 0;
    private timerResetElements: number = 0;
    private startTime: number = 0;
    private updateBox = 0;

    /* }}} */
    /* {{{ computed */

    get fullOptions(): StepOptions {
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

    /* {{{ targets */

    /** list of target elements.
     *
     * Convert the Set in Array.
     * The Set is used to avoid duplications.
     * The Array is used to keep elements in the same order as boxes.
     */
    get elements(): HTMLElement[] {
        return Array.from(this.targetElements);
    }

    get mainElement(): HTMLElement | null {
        const element = this.elements[0];

        return element || null;
    }

    get elementsBox(): Box[] {
        const elements = this.elements;

        /* XXX: only for reactivity, to force to recompute box coordinates */
        this.updateBox;

        const memo = new WeakMap();
        return elements.map((element) => {
            return getBox(element, memo);
        });
    }

    get isMainElementHidden(): boolean {
        const mainBox = this.elementsBox[0];
        if (mainBox && mainBox[4] !== 'visible') {
            return true;
        }
        return false;
    }

    /* }}} */
    /* {{{ mask */

    get masksBox(): Box[] {
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
                    getBox(this.mainElement!, new WeakMap(), {getParentBox: true}),
                ];
            } else {
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
            } else {
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
        }, [] as Box[]);

        /* Add the parent box, if element is not visible. This is to have a
         * visible box to scroll */
        if (this.isMainElementHidden) {
            boxes.push(getBox(this.mainElement!, new WeakMap(), {getParentBox: true}));
        }
        return boxes;
    }

    /* }}} */
    /* {{{ arrows */

    get arrowsPosition(): boolean | ArrowPosition[] {
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
                    const placement = getPlacement(box as unknown as Rect);
                    const [x, y, position] = getPosition(box, placement);
                    positionList.push({ x, y, position });
                }
            } else {
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
        }, [] as ArrowPosition[]);

        return positions;
    }

    /* }}} */
    /* {{{ Next action */

    get nextActionType(): ActionType {
        return getActionType(this.step.desc);
    }

    get nextActionTarget(): HTMLElement | null {
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

    get needsNextButton(): boolean {
        return this.step.status.isActionNext;
    }

    /* }}} */
    /* {{{ listeners */

    get actionListener() {
        return () => {
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
        };
    }

    get recomputeBoxListener() {
        return () => {
            this.updateBox++;
        };
    }

    get mutationObserver() {
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
                    this.resetElementsDebounced(true);
                }
            }
        });
    }

    /* }}} */
    /* {{{ buttons */

    get displayPreviousButton(): boolean {
        const info = this.tutorialInformation;

        if (info.previousStepIsSpecial || info.currentIndex <= 0) {
            return false;
        }

        return true;
    }

    get displayNextButton(): boolean {
        const info = this.tutorialInformation;

        if (info.currentIndex >= info.nbTotalSteps - 1) {
            return false;
        }
        return this.needsNextButton;
    }

    get displayFinishButton(): boolean {
        const info = this.tutorialInformation;

        if (info.currentIndex >= info.nbTotalSteps - 1) {
            return this.needsNextButton;
        }
        return false;
    }

    get displaySkipButton(): boolean {
        return true;
    }

    /* }}} */
    /* }}} */
    /* {{{ watch */

    @Watch('fullOptions.texts')
    protected onTextsChange() {
        changeTexts(this.fullOptions.texts);
    }

    @Watch('fullOptions.bindings', { immediate: true, deep: true })
    protected onBindingsChange() {
        resetBindings(this.fullOptions.bindings);
    }

    @Watch('elements', { deep: true })
    protected onElementsChange(newElements: HTMLElement[], oldElements: HTMLElement[]) {
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

        function addParents(el: HTMLElement) {
            let node: HTMLElement | null = el;
            while (node) {
                node = node.parentElement;
                if (node) {
                    parentElements.add(node);
                }
            }
        }
        this.elements.forEach(addParents);

        parentElements.add(window as any);
    }

    @Watch('elements', { deep: true, flush: 'post' })
    @Watch('fullOptions.highlight', { deep: true, flush: 'post' })
    protected onHighlightChange() {
        this.removeClass(Array.from(this.highlightElements));
        this.highlightElements.clear();
        this.addHighlightClass();
    }

    @Watch('parentElements', { deep: true })
    protected onParentElementsChange() {
        this.addScrollListener();
    }

    @Watch('nextActionTarget')
    @Watch('nextActionType', { immediate: true })
    protected onActionTypeChange() {
        this.addActionListener();
    }

    /* XXX: flush: post is needed because some of the variable are related to DOM */
    @Watch('step.desc', { immediate: true, deep: false, flush: 'post' })
    protected onStepChange() {
        this.scroll();
        this.setFocus();

        debug(22, this.fullOptions, {
            step: this.step,
            tutorialInformation: this.tutorialInformation,
        });
    }

    @Watch('step.desc.target', { immediate: true })
    protected onStepTargetChange() {
        this.resetElements();
    }

    @Watch('elementsBox')
    protected onElementsBoxChange() {
        const hasHiddenElement = this.elementsBox.some((box) => box[4] === 'hidden');

        debug(25, this.fullOptions, {
            elementsBox: this.elementsBox,
            elements: this.elements,
            tutorialInformation: this.tutorialInformation,
            hasHiddenElement,
        });

        if (hasHiddenElement) {
            const currentTime = performance.now();
            const timeout = this.fullOptions.timeout;
            const endTime = this.startTime + timeout;
            if (currentTime > endTime) {
                const elements = this.elements;
                const hiddenElements = this.elementsBox.reduce<HTMLElement[]>((list, box, idx) => {
                    if (box[4] === 'hidden') {
                        list.push(elements[idx]);
                    }
                    return list;
                }, []);
                const hasVisibleElement = hiddenElements.length < this.elementsBox.length;
                const details = {
                    timeout,
                    elements: hiddenElements,
                    purpose: 'targets',
                };

                if (hasVisibleElement) {
                    error(225, details);
                } else {
                    error(325, details);
                }
                return;
            }
            // force updateBox to recompute
            setTimeout(() => this.updateBox++, 50);
        }
    }

    /* }}} */
    /* {{{ methods */

    private resetElementsDebounced(get = true) {
        clearTimeout(this.timerResetElements);
        this.timerResetElements = setTimeout(() => {
            this.resetElements(get)
        }, 10);
    }

    private resetElements(get = true) {
        clearTimeout(this.timerResetElements);
        this.removeClass(this.elements);
        this.removeClass(Array.from(this.highlightElements));
        this.cacheElements.clear();
        this.targetElements.clear();
        this.highlightElements.clear();
        this.resetMutedElements();
        if (get) {
            this.getTargetElements();
            this.muteElements();
        }
    }

    private getTargetElements() {
        const targetElements = this.targetElements;
        const target = this.step.desc.target;
        this.startTime = performance.now();

        if (!target?.length) {
            return;
        }
        const timeout = this.fullOptions.timeout;
        const cache = this.cacheElements;

        const targets = Array.isArray(target) ? target : [target];
        const promises: Array<Promise<any>> = [];

        targets.forEach(async (selector) => {
            const promise = getElement(selector, {
                timeout,
                all: true,
                purpose: 'targets',
                cache,
            });
            promises.push(promise);
            const elements = await promise;

            if (elements?.length) {
                debug(26, this.fullOptions, {
                    elements,
                    selector,
                });
                elements.forEach((el) => targetElements.add(el));
            } else {
                debug(27, this.fullOptions, {
                    selector,
                });
            }
        });

        this.promiseTargetElements = Promise.all(promises);
    }

    private setFocus() {
        const fullOptions = this.fullOptions;
        const focusCfg = fullOptions.focus;
        clearTimeout(this.timerSetFocus++);

        switch (focusCfg) {
            case false:
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

    private async scroll() {
        const options = this.fullOptions;
        const scroll = options.scroll;
        let behavior: ScrollKind;
        let target: HTMLElement | null;

        if (typeof scroll === 'boolean') {
            await this.promiseTargetElements;
            behavior = scroll ? 'scroll-to' : 'no-scroll';
            target = this.mainElement;
        } else if (typeof scroll === 'string') {
            await this.promiseTargetElements;
            behavior = scroll;
            target = this.mainElement;
        } else {
            behavior = scroll.scrollKind ?? 'scroll-to';
            target = await getElement(scroll.target, {
                purpose: 'scroll',
                timeout: scroll.timeout ?? options.timeout,
                errorIsWarning: true,
            });
        }

        if (target && behavior === 'scroll-to') {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    private addHighlightClass() {
        const highlight = this.fullOptions.highlight;
        if (!highlight) {
            return;
        }

        const highlightElements = this.highlightElements;

        if (highlight === true) {
            const mainElement = this.mainElement;
            if (mainElement) {
                mainElement?.classList.add('vue3-tutorial-highlight');
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

    private addClass(newTargets: HTMLElement[]) {
        const options = this.fullOptions;

        /* add vue3-tutorial class */
        newTargets.forEach((el) => {
            el.classList.add(
                'vue3-tutorial__target',
            );
            if (options.classForTargets) {
                el.classList.add(options.classForTargets);
            }
        });
        const mainEl = newTargets[0];
        if (mainEl) {
            mainEl.classList.add('vue3-tutorial__main-target');
        }
    }

    private removeClass(oldTargets: HTMLElement[]) {
        const options = this.fullOptions;
        const classForTargets = options.classForTargets;

        /* remove previous vue3-tutorial class */
        oldTargets.forEach((el) => {
            el.classList.remove(
                'vue3-tutorial-highlight',
                'vue3-tutorial__target',
                'vue3-tutorial__main-target'
            );
            if (classForTargets) {
                el.classList.remove(classForTargets);
            }
        });
    }

    // private muted(event: Event) {
    //     event.stopPropagation();
    // }

    private resetMutedElements() {
        const elements = this.mutedElements;
        for (const [element, tabindex] of elements) {
            element.tabIndex = tabindex;
            element.classList.remove('vue3-tutorial-muted');
        }
        elements.clear();
    }

    private muteElements() {
        const mutedElements = this.mutedElements;
        const muteSelectors = this.fullOptions.muteElements;

        this.resetMutedElements();
        if (muteSelectors === false) {
            return false;
        }

        const cache = this.cacheElements;
        const selectors = Array.isArray(muteSelectors) ? muteSelectors : [muteSelectors];

        selectors.forEach((selector) => {
            const listElements = getElement(selector, {
                all: true,
                purpose: 'mute',
                cache,
                errorIsWarning: true,
            });

            if (listElements) {
                for (const element of listElements) {
                    mutedElements.set(element, element.tabIndex);
                    element.classList.add('vue3-tutorial-muted');
                    element.tabIndex = -1;
                }
            } else {
                /* some elements have not been found, search them asynchronously */
                getElement(selector, {
                    timeout: this.fullOptions.timeout,
                    all: true,
                    purpose: 'mute',
                    cache,
                    errorIsWarning: true,
                }).then((result) => {
                    if (result) {
                        for (const element of result) {
                            mutedElements.set(element, element.tabIndex);
                            element.classList.add('vue3-tutorial-muted');
                            element.tabIndex = -1;
                        }
                    }
                });
            }
        });

        return true;
    }

    private addActionListener() {
        const eventName = this.nextActionType;
        const el = this.nextActionTarget;

        this.mutationObserver.disconnect();
        this.removeActionListener();

        if (!el || eventName === 'next') {
            return;
        }

        if (el.getRootNode() === document) {
            this.mutationObserver.observe(document.body, mutationConfig);
        }

        const listener = this.actionListener;
        el.addEventListener(eventName, listener, { capture: true });
        this.removeActionListener = () => {
            el.removeEventListener(eventName, listener, { capture: true });
            this.removeActionListener = noop;
        };
    }

    private addScrollListener() {
        const callback = this.recomputeBoxListener;
        const parentElements = this.parentElements;

        for (const el of parentElements) {
            el.addEventListener('scroll', callback);
        }
    }

    private clearScrollListener() {
        const callback = this.recomputeBoxListener;
        const elements = this.parentElements;

        for (const el of elements) {
            el.removeEventListener('scroll', callback);
        }

        this.parentElements.clear();
    }

    private addResizeListener() {
        const callback = this.recomputeBoxListener;
        window.addEventListener('resize', callback);
    }

    private removeResizeListener() {
        const callback = this.recomputeBoxListener;
        window.removeEventListener('resize', callback);
    }

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
        this.resetElements(false);
        this.removeActionListener();
        this.clearScrollListener();
        this.removeResizeListener();
        this.mutationObserver.disconnect();

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
                elementsBox={this.elementsBox}
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
