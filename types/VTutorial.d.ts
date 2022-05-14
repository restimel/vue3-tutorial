import { Vue, h } from 'vtyx';
import { Options, StepDescription, Tutorial } from './types.d';
import '../css/tutorial.css';
export interface Props {
    tutorial: Tutorial;
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
    private start;
    private nextStep;
    private previousStep;
    private stop;
    private skip;
    private onKeyEvent;
    protected onOpenChange(): void;
    protected onStepsChange(): void;
    render(): h.JSX.Element | undefined;
}
