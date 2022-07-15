import { h, Vue } from 'vtyx';
import { ActionType, Box, Step, StepOptions, TutorialInformation } from './types';
export interface Props {
    step: Step;
    tutorialInformation: TutorialInformation;
}
export default class VStep extends Vue<Props> {
    private step;
    private tutorialInformation;
    private removeActionListener;
    private targetElements;
    private parentElements;
    private timerSetFocus;
    private updateBox;
    get elements(): HTMLElement[];
    get mainElement(): HTMLElement | null;
    get fullOptions(): StepOptions;
    get elementsBox(): Box[];
    get nextActionType(): ActionType;
    get nextActionTarget(): HTMLElement | null;
    get needsNextButton(): boolean;
    get actionListener(): () => void;
    get recomputeBoxListener(): () => void;
    get displayPreviousButton(): boolean;
    get displayNextButton(): boolean;
    get displayFinishButton(): boolean;
    get displaySkipButton(): boolean;
    protected onTextsChange(): void;
    protected onBindingsChange(): void;
    protected onElementsChange(newElements: HTMLElement[], oldElements: HTMLElement[]): void;
    protected onParentElementsChange(): void;
    protected onActionTypeChange(): void;
    protected onStepChange(): void;
    protected onStepTargetChange(): void;
    private resetElements;
    private getElements;
    private setFocus;
    private scroll;
    private addClass;
    private removeClass;
    private addActionListener;
    private addScrollListener;
    private clearScrollListener;
    private addResizeListener;
    private removeResizeListener;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
