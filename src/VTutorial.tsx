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

/* Debug code = [0-9] */

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
    getStep,
} from './tools/step';
import error, {
    debug,
    registerError,
    unRegisterError,
} from './tools/errors';
import {
    emptyArray, getPositiveInteger,
} from './tools/tools';

import {
    BindingAction,
    Options,
    Step,
    StepMovement,
    TargetStep,
    Tutorial,
    TutorialEmittedError,
    TutorialError,
} from './types.d';

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
    ScrollBehavior,
    StepDescription,
    StepMovement,
    StepOptions,
    TargetStep,
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
    step?: number | string;
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

    @Prop({ default: 0 })
    private step: TargetStep;

    /* }}} */
    /* {{{ data */

    private currentIndex = 0;
    private isRunning = false;

    /* }}} */
    /* {{{ computed */

    get steps(): Step[] {
        const steps = this.tutorial?.steps;

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

    get nbTotalSteps(): number {
        return this.steps.length;
    }

    get currentStep(): Step | undefined {
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

    get tutorialOptions(): Options {
        return mergeStepOptions(
            DEFAULT_STEP_OPTIONS,
            this.options || {},
            this.tutorial?.options || {}
        );
    }

    get currentStepIsSpecial(): boolean {
        const step = this.currentStep;
        return !!step && !step.status.isActionNext;
    }

    get previousStepIsSpecial(): boolean {
        let step: Step;
        let index = this.currentIndex;
        do {
            index--;
            step = this.steps[index];
        } while (step?.status.skipped);

        if (!step) {
            return true;
        }

        return !step.status.isActionNext;
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
        if (!this.tutorial) {
            this.stop();
            return;
        }
        this.start();
    }

    @Watch('step', { immediate: true })
    protected onStepChange() {
        if (this.isRunning) {
            this.gotoInitialStep();
        }
    }

    /* }}} */
    /* {{{ methods */
    /* {{{ navigation */

    /** Find which is the next active step depending on direction */
    private async findStep(oldIndex: number, upDirection = true, iteration = 1): Promise<number> {
        let newIndex = oldIndex;
        const nbTotalSteps = this.nbTotalSteps;
        const steps = this.steps;
        let step: Step;

        try {
            let iterationLeft = getPositiveInteger(iteration, 1);
            while (iterationLeft >= 1) {
                let isSkipped: boolean;
                do {
                    if (upDirection) {
                        if (newIndex >= nbTotalSteps - 1) {
                            this.stop(nbTotalSteps > 0);
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

                    if (upDirection) {
                        /* When moving forward, we check the skipped status */
                        isSkipped = await step.checkSkipped();
                    } else {
                        /* When moving backward, we reuse the previous skipped status.
                         * If it has never been checked then check it this time.
                         */
                        isSkipped = step.status.skipped ?? await step.checkSkipped();
                    }
                } while (isSkipped);
                iterationLeft--;
            };
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

    /** Get the final step index depending on a TargetStep.
     *
     * The TargetStep can be:
     *  - a number: the index destination
     *  - a string starting with '+' or '-' and followed by a number (such as '+1').
     *    the final step will be a movement in the given direction (skipped steps are ignored)
     *  - a string: the final step is the first step having the same name as the target
     */
    private async getIndex(target: StepMovement, oldIndex: number): Promise<number> {
        let targetStep: TargetStep;

        const returnValue = (finalValue: number, targetValue = finalValue, info = ''): number => {
            debug(28, this.tutorialOptions, {
                oldIndex,
                newIndex: finalValue,
                targetIndex: targetValue,
                target: targetStep,
                info,
            });

            return finalValue;
        };

        if (typeof target === 'function') {
            targetStep = await Promise.resolve(target({
                currentIndex: this.currentIndex,
                nbTotalSteps: this.nbTotalSteps,
                previousStepIsSpecial: this.previousStepIsSpecial,
            }));
        } else {
            targetStep = target;
        }

        if (typeof targetStep === 'number') {
            const targetIndex = getPositiveInteger(targetStep, 0);

            if (targetIndex >= this.steps.length) {
                this.stop(this.nbTotalSteps > 0);
                return returnValue(-1, targetIndex, 'out of steps range');
            }

            /* assert that given step is not skipped */
            const finalIndex = await this.findStep(targetIndex - 1, true);

            return returnValue(finalIndex, targetIndex);
        }

        if (typeof targetStep !== 'string') {
            error(305, {
                index: this.currentIndex,
                value: targetStep,
                expected: 'TargetStep (string | number)',
            });
            return returnValue(-1, -1, 'wrong target step type');
        }

        const firstChar = targetStep[0];
        if (firstChar === '+' || firstChar === '-') {
            const upDirection = firstChar === '+';
            const rawValue = parseInt(targetStep.slice(1), 10);
            const value = getPositiveInteger(rawValue, 1);
            const targetIndex = await this.findStep(oldIndex, upDirection, value);

            return returnValue(targetIndex, oldIndex + +target);
        }

        /* Search for a step which has the given name */
        const stepIndex = this.steps.findIndex((step) => {
            return step.desc.name === targetStep;
        });

        if (stepIndex === -1) {
            error(302, {
                nbTotalSteps: this.nbTotalSteps,
                index: targetStep,
            });
            return returnValue(-1, stepIndex, 'name not found');
        }

        /* assert that given step is not skipped */
        const finalIndex = await this.findStep(stepIndex - 1, true);

        return returnValue(finalIndex, stepIndex);
    }

    private async gotoInitialStep(): Promise<number> {
        let step = this.step;

        if (typeof step === 'string' && (step.startsWith('+') || step.startsWith('-'))) {
            /* For initial step, we should not use increment/decrement variation */
            step = 0;
        }

        const oldIndex = this.currentIndex;
        const stepIndex = await this.getIndex(step, oldIndex);

        if (stepIndex !== -1) {
            /* NOTE: due to the asynchronous action, oldIndex may be
             * different to this.currentIndex */
            if (this.currentIndex !== stepIndex) {
                this.currentIndex = stepIndex;

                if (this.isRunning) {
                    this.$emit('changeStep', this.currentIndex, oldIndex);
                }
            }
        } else {
            error(203);
            return -1;
        }

        return stepIndex;
    }

    private async start() {
        if (!this.tutorial) {
            error(303);
            this.stop(false);
            return;
        }
        if (this.isRunning) {
            /* The tutorial is already started */
            return;
        }

        const currentIndex = await this.gotoInitialStep();
        this.isRunning = true;

        this.$emit('start', currentIndex);
        startListening(this.onKeyEvent.bind(this));
        debug(2, this.tutorialOptions, {currentIndex});
    }

    private async nextStep(forceNext = false) {
        if (!this.isRunning) {
            return;
        }

        if (!forceNext && this.currentStepIsSpecial) {
            return;
        }

        const currentStep = this.currentStep;
        const oldIndex = this.currentIndex;
        const currentIndex = await this.getIndex(currentStep?.desc?.nextStep ?? '+1', oldIndex);

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

        const currentStep = this.currentStep;
        const oldIndex = this.currentIndex;
        const currentIndex = await this.getIndex(currentStep?.desc?.previousStep ?? '-1', oldIndex);

        if (currentIndex > -1) {
            this.currentIndex = currentIndex;
            this.$emit('previousStep', currentIndex, oldIndex);
            this.$emit('changeStep', currentIndex, oldIndex);
        }
    }

    /** Will stop the tutorial
     *
     * isFinished is true if the tutorial is completed
     */
    private stop(isFinished = false) {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;

        this.$emit('stop', isFinished);
        stopListening();

        debug(3, this.tutorialOptions, {currentIndex: this.currentIndex});
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

        debug(0, this.tutorialOptions, {
            open: this.open,
            tutorial: this.tutorial,
        });
    }

    public unmounted() {
        unRegisterError();

        debug(1, this.tutorialOptions, {
            open: this.open,
            tutorial: this.tutorial,
        });
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
