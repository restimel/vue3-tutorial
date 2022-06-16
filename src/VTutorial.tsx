/* Component Purpose:
 * vue3-tutorial is a component to indicate to user which actions may
 * be done. User may do the action in order to go to the next step.
 */

/* File Purpose:
 * It initializes the component and manages all communications with external.
 * It coordinates the change of tutorial.
 */

/* Events emitted are:
 *   change [value, isExcluded, component]: triggered when the list is closed and a change occurs
 */

import {
    Component,
    Emits,
    h,
    Prop,
    Vue,
    Watch,
} from 'vtyx';
import VStep from './VStep';
import '../css/tutorial.css';

import {
    DEFAULT_STEP_OPTIONS,
    mergeStepOptions,
} from './tools/defaultValues';
import label from './tools/labels';
import {
    startListening,
    stopListening,
} from './tools/keyBinding';
import {
    checkExpression,
    isStepSpecialAction,
} from './tools/step';
import error, {
    registerError,
    unRegisterError,
} from './tools/errors';

import {
    BindingAction,
    Options,
    StepDescription,
    Tutorial,
    TutorialEmittedError,
    TutorialError,
} from './types.d';
import { getElement } from './tools/tools';

/* Export function helper to know the kind of error which is returned */
export {
    errorStatus,
} from './tools/errors';

/* Export types in order to be used outside */
export {
    Action,
    ActionNext,
    ActionType,
    Binding,
    BindingAction,
    CheckExpression,
    Dictionary,
    ErrorSelectorPurpose,
    EventAction,
    ExpressionUnaryOperation,
    ExpressionValueOperation,
    FocusBehavior,
    Options,
    Placement,
    StepDescription,
    StepOptions,
    Tutorial,
    TutorialEmittedError,
    TutorialErrorCodes,
    TutorialErrorStatus,
    TutorialInformation,
} from './types.d';

export interface Props {
    tutorial?: Tutorial | null;
    options?: Options;
    open?: boolean;
}

@Component
export default class VTutorial extends Vue<Props> {
    /* {{{ props */

    @Prop()
    private tutorial?: Tutorial | null;

    @Prop()
    private options?: Options;

    @Prop({ default: false })
    private open: boolean;

    /* }}} */
    /* {{{ data */

    private currentIndex = 0;
    private isRunning = false;

    /* }}} */
    /* {{{ computed */

    get steps() {
        return this.tutorial?.steps ?? [];
    }

    get nbTotalSteps() {
        return this.steps.length;
    }

    get currentStep(): StepDescription | undefined {
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

    private async skipCurrentStep(step: StepDescription | undefined): Promise<boolean> {
        const skipStep = step?.skipStep;

        if (!skipStep) {
            return false;
        }

        if (typeof skipStep === 'boolean') {
            return skipStep;
        }
        if (typeof skipStep === 'function') {
            return skipStep(this.currentIndex);
        }
        const targetSelector = skipStep.target;
        const targetElement = await getElement(targetSelector, 'skipStep');

        if (!targetElement) {
            return false;
        }

        return checkExpression(skipStep, targetElement, 'skipStep');
    }

    get tutorialOptions(): Options {
        return mergeStepOptions(
            DEFAULT_STEP_OPTIONS,
            this.options || {},
            this.tutorial?.options || {}
        );
    }

    get currentStepIsSpecial(): boolean {
        const step = this.currentStep;

        return !!step && isStepSpecialAction(step);
    }

    get previousStepIsSpecial(): boolean {
        const step = this.steps[this.currentIndex - 1];

        if (!step) {
            return true;
        }

        return isStepSpecialAction(step);
    }

    /* }}} */
    /* {{{ watch */

    @Watch('open', { immediate: true })
    protected onOpenChange() {
        if (this.open) {
            this.start();
        }
    }

    @Watch('steps')
    protected onStepsChange() {
        this.start();
    }

    /* }}} */
    /* {{{ methods */
    /* {{{ navigation */

    private async findStep(oldIndex: number, upDirection = true): Promise<number> {
        let newIndex = oldIndex;
        const nbTotalSteps = this.nbTotalSteps;
        const steps = this.steps;
        let step: StepDescription;

        try {
            do {
                if (upDirection) {
                    if (newIndex >= nbTotalSteps - 1) {
                        this.stop(true);
                        return -1;
                    }
                    newIndex++;
                } else {
                    if (newIndex <= 0) {
                        error(204);
                        return -1;
                    }
                    newIndex--;
                }
                step = steps[newIndex];
            } while(await this.skipCurrentStep(step));
        } catch (err) {
            error(202, {
                index: this.currentIndex,
                fromIndex: oldIndex,
                error: err,
            });
            return -1;
        }
        return newIndex;
    }

    private async start() {
        if (!this.tutorial) {
            error(303);
            this.stop(false);
            return;
        }

        this.currentIndex = await this.findStep(-1, true);
        if (this.currentIndex === -1) {
            error(203);
            return;
        }
        this.isRunning = true;
        this.$emit('start', this.currentIndex);
        startListening(this.onKeyEvent.bind(this));
    }

    private async nextStep(forceNext = false) {
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

    private async previousStep(forcePrevious = false) {
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

    private stop(isFinished = false) {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;

        this.$emit('stop', isFinished);
        stopListening();
    }

    private skip() {
        if (!confirm(label('skipConfirm'))) {
            return;
        }

        this.stop();
    }

    /* }}} */

    private onKeyEvent(action: BindingAction) {
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

    public mounted() {
        registerError((err: TutorialError) => {
            const errEmitted: TutorialEmittedError = Object.assign({
                tutorialName: this.tutorial?.name ?? '',
                stepIndex: this.currentIndex,
            }, err);
            this.$emit('error', errEmitted);
        });
    }

    public unmounted() {
        unRegisterError();
    }

    /* }}} */

    @Emits(['changeStep', 'error', 'nextStep', 'previousStep', 'start', 'stop'])
    public render() {
        const step = this.currentStep;

        if (!this.isRunning || !step) {
            return;
        }

        return (
            <VStep
                step={step}
                options={this.tutorialOptions}
                tutorialInformation={{
                    currentIndex: this.currentIndex,
                    nbTotalSteps: this.nbTotalSteps,
                    previousStepIsSpecial: this.previousStepIsSpecial,
                }}

                on={{
                    previous: () => this.previousStep(true),
                    next: () => this.nextStep(true),
                    finish: () => this.nextStep(true),
                    skip: () => this.skip(),
                }}
            />
        );
    }
}
