/* File Purpose:
 * It handles the display for one step
 */

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

import Window from './components/Window';
import Markdown from 'vue3-markdown-it';

import {
    checkExpression,
    getActionType,
} from './tools/step';
import label, { changeTexts } from './tools/labels';
import { resetBindings } from './tools/keyBinding';
import {
    ActionType,
    Box,
    EventAction,
    ScrollKind,
    Step,
    StepOptions,
    TutorialInformation,
} from './types';
import error from './tools/errors';
import {
    getElement,
    getBox,
} from './tools/tools';

const noop = function() {};

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
    private targetElements: Set<HTMLElement> = new Set();
    private parentElements: Set<HTMLElement> = new Set();
    private timerSetFocus: number = 0;
    private updateBox = 0;

    /* }}} */
    /* {{{ computed */

    get elements(): HTMLElement[] {
        return Array.from(this.targetElements);
    }

    get mainElement(): HTMLElement | null {
        const element = this.elements[0];

        return element || null;
    }

    get fullOptions(): StepOptions {
        return this.step.options;
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
    }

    @Watch('step.desc.target', { immediate: true })
    protected onStepTargetChange() {
        this.resetElements();
    }

    /* }}} */
    /* {{{ methods */

    private resetElements() {
        this.targetElements.clear();
        this.getElements(performance.now());
    }

    private getElements(refTimestamp: number) {
        const targetElements = this.targetElements;
        const target = this.step.desc.target;

        if (!target?.length) {
            return;
        }
        let isNotReadyYet = false;

        const targets = Array.isArray(target) ? target : [target];

        targets.forEach((selector) => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length) {
                    for (const el of Array.from(elements)) {
                        targetElements.add(el as HTMLElement);
                    }
                } else {
                    isNotReadyYet = true;
                }
            } catch (err) {
                error(300, { selector, purpose: 'targets', error: err as Error });
            }
        });

        if (isNotReadyYet) {
            const timeout = this.fullOptions.timeout;
            if (performance.now() - refTimestamp < timeout) {
                setTimeout(() => this.getElements(refTimestamp), 100);
            } else {
                error(324, { timeout, selector: targets, purpose: 'targets' });
            }
        }
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
            behavior = scroll ? 'scroll-to' : 'no-scroll';
            target = this.mainElement;
        } else if (typeof scroll === 'string') {
            behavior = scroll;
            target = this.mainElement;
        } else {
            behavior = 'scroll-to';
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

            if (options.highlight) {
                mainEl.classList.add('vue3-tutorial-highlight');
            }
        }
    }

    private removeClass(oldTargets: HTMLElement[]) {
        const options = this.fullOptions;

        /* remove previous vue3-tutorial class */
        oldTargets.forEach((el) => {
            el.classList.remove(
                'vue3-tutorial-highlight',
                'vue3-tutorial__target',
                'vue3-tutorial__main-target'
            );
            if (options.classForTargets) {
                el.classList.remove(options.classForTargets);
            }
        });
    }

    private addActionListener() {
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
    }

    public unmounted() {
        this.removeClass(this.elements);
        this.removeActionListener();
        this.clearScrollListener();
        this.removeResizeListener();
    }

    @Emits(['finish', 'next', 'previous', 'skip'])
    public render() {
        const options = this.fullOptions;
        const stepDesc = this.step.desc;
        const information = this.tutorialInformation;

        return (
            <Window
                elementsBox={this.elementsBox}
                position={options.position}
                arrowAnimation={options.arrowAnimation}
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
                            ??
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
