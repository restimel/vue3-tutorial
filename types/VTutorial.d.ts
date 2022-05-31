import { h, Vue } from 'vtyx';
import '../css/tutorial.css';
import { Options, StepDescription, Tutorial } from './types.d';
export interface Props {
    tutorial?: Tutorial;
    options?: Options;
    open?: boolean;
}
export default class VTutorial extends Vue<Props> {
    private tutorial;
    private options?;
    private open;
    private currentIndex;
    private isRunning;
    get steps(): StepDescription[];
    get nbTotalSteps(): number;
    get currentStep(): StepDescription | undefined;
    get tutorialOptions(): Options;
    get currentStepIsSpecial(): boolean;
    get previousStepIsSpecial(): boolean;
    protected onOpenChange(): void;
    protected onStepsChange(): void;
    private start;
    private nextStep;
    private previousStep;
    private stop;
    private skip;
    private onKeyEvent;
    render(): h.JSX.Element | undefined;
}
