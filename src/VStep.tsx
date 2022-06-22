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
import Window, { Box } from './components/Window';
import {
    mergeStepOptions,
} from './tools/defaultValues';
import {
    checkExpression,
    getActionType,
} from './tools/step';
import label, { changeTexts } from './tools/labels';
import { resetBindings } from './tools/keyBinding';
import {
    ActionType,
    EventAction,
    Step,
    StepOptions,
    TutorialInformation,
} from './types';
import error from './tools/errors';
import { getElement } from './tools/tools';

const nope = function() {};

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

    private removeActionListener: () => void = nope;
    private targetElements: Set<HTMLElement> = new Set();
    private timerSetFocus: number = 0;

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

        return elements.map((element) => {
            const rect = element.getBoundingClientRect();

            return [rect.left, rect.top, rect.right, rect.bottom];
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
    }

    @Watch('nextActionTarget')
    @Watch('nextActionType', { immediate: true })
    protected onActionTypeChange() {
        this.addActionListener();
    }

    @Watch('step', { immediate: true, deep: false, flush: 'post' })
    protected onStepChange() {
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

    @Watch('step.target', { immediate: true })
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
            this.removeActionListener = nope;
        };
    }

    /* }}} */
    /* {{{ Life cycle */
    /* }}} */

    public unmounted() {
        this.removeClass(this.elements);
        this.removeActionListener();
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
                        {stepDesc.content}
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
