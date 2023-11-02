import { h, Vue } from 'vtyx';
import '../css/tutorial.css';
import { Options, Step, Tutorial } from './types.d';
export { errorStatus, } from './tools/errors';
export { Action, ActionNext, ActionType, Binding, BindingAction, CheckExpression, Dictionary, ErrorSelectorPurpose, EventAction, ExpressionUnaryOperation, ExpressionValueOperation, FocusBehavior, Options, Placement, ScrollBehavior, StepDescription, StepOptions, Tutorial, TutorialEmittedError, TutorialErrorCodes, TutorialErrorStatus, TutorialInformation, } from './types.d';
export interface Props {
    tutorial?: Tutorial | null;
    options?: Options;
    open?: boolean;
    step?: number | string;
}
export default class VTutorial extends Vue<Props> {
    private tutorial?;
    private options?;
    private open;
    private step;
    private currentIndex;
    private isRunning;
    get steps(): Step[];
    get nbTotalSteps(): number;
    get currentStep(): Step | undefined;
    get tutorialOptions(): Options;
    get currentStepIsSpecial(): boolean;
    get previousStepIsSpecial(): boolean;
    protected onOpenChange(): void;
    protected onStepsChange(): void;
    protected onStepChange(): void;
    /** Find which is the next active step depending on direction */
    private findStep;
    /** Get the final step index depending on a TargetStep.
     *
     * The TargetStep can be:
     *  - a number: the index destination
     *  - a string starting with '+' or '-' and followed by a number (such as '+1').
     *    the final step will be a movement in the given direction (skipped steps are ignored)
     *  - a string: the final step is the first step having the same name as the target
     */
    private getIndex;
    private gotoInitialStep;
    private start;
    private nextStep;
    private previousStep;
    /** Will stop the tutorial
     *
     * isFinished is true if the tutorial is completed
     */
    private stop;
    private skip;
    private onKeyEvent;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element | undefined;
}
