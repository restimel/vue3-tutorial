import { h, Vue } from 'vtyx';
import { Box } from './components/Window';
import { ActionType, Options, StepDescription, StepOptions, TutorialInformation } from './types';
export interface Props {
    step: StepDescription;
    options: Options;
    tutorialInformation: TutorialInformation;
}
export default class VStep extends Vue<Props> {
    private step;
    private options;
    private tutorialInformation;
    private removeActionListener;
    private targetElements;
    get elements(): HTMLElement[];
    get mainElement(): HTMLElement | null;
    get fullOptions(): StepOptions;
    get elementsBox(): Box[];
    get nextActionType(): ActionType;
    get nextActionTarget(): HTMLElement | null;
    get needsNextButton(): boolean;
    get actionListener(): () => void;
    get displayPreviousButton(): boolean;
    get displayNextButton(): boolean;
    get displayFinishButton(): boolean;
    get displaySkipButton(): boolean;
    protected onTextsChange(): void;
    protected onBindingsChange(): void;
    protected onElementsChange(newElements: HTMLElement[], oldElements: HTMLElement[]): void;
    protected onActionTypeChange(): void;
    protected onStepChange(): void;
    private resetElements;
    private getElements;
    private addClass;
    private removeClass;
    private addActionListener;
    unmounted(): void;
    render(): h.JSX.Element;
}
