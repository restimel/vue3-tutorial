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
import { startListening, stopListening } from './tools/keyBinding';
import { isStepSpecialAction } from './tools/step';
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

/* Export types in order to be used outside */
export {
    Action,
    ActionNext,
    ActionType,
    Binding,
    BindingAction,
    CheckExpression,
    Dictionary,
    EventAction,
    ExpressionUnaryOperation,
    ExpressionValueOperation,
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
            error(302, {
                nbTotalSteps: this.nbTotalSteps,
                index: this.currentIndex,
            });
            return;
        }

        return step;
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

    private start() {
        if (!this.tutorial) {
            error(303);
            this.stop(false);
            return;
        }
        this.currentIndex = 0;
        this.isRunning = true;
        this.$emit('start', this.currentIndex);
        startListening(this.onKeyEvent.bind(this));
    }

    private nextStep(forceNext = false) {
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

    private previousStep(forcePrevious = false) {
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
