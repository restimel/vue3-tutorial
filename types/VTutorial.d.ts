import { h, Vue } from 'vtyx';
import '../css/tutorial.css';
import { Options, Step, Tutorial } from './types.d';
export { errorStatus, } from './tools/errors';
export { Action, ActionNext, ActionType, Binding, BindingAction, CheckExpression, Dictionary, ErrorSelectorPurpose, EventAction, ExpressionUnaryOperation, ExpressionValueOperation, FocusBehavior, Options, Placement, ScrollBehavior, StepDescription, StepOptions, Tutorial, TutorialEmittedError, TutorialErrorCodes, TutorialErrorStatus, TutorialInformation, } from './types.d';
export interface Props {
    tutorial?: Tutorial | null;
    options?: Options;
    open?: boolean;
}
export default class VTutorial extends Vue<Props> {
    private tutorial?;
    private options?;
    private open;
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
    private findStep;
    private start;
    private nextStep;
    private previousStep;
    /** isFinished is true if the tutorial is completed */
    private stop;
    private skip;
    private onKeyEvent;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element | undefined;
}
