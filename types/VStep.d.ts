import { Vue, h } from 'vtyx';
import { Box } from './components/Window';
import { Options, StepDescription, StepOptions, TutorialInformation } from './types';
export interface Props {
    step: StepDescription;
    options: Options;
    tutorialInformation: TutorialInformation;
}
export default class VStep extends Vue<Props> {
    private step;
    private options;
    private tutorialInformation;
    private forceRecompute;
    get elements(): HTMLElement[];
    get mainElement(): HTMLElement | null;
    get fullOptions(): StepOptions;
    get elementsBox(): Box[];
    get displayPreviousButton(): boolean;
    get displayNextButton(): boolean;
    get displayFinishButton(): boolean;
    get displaySkipButton(): boolean;
    private recompute;
    private addClass;
    private removeClass;
    protected onTextsChange(): void;
    protected onBindingsChange(): void;
    protected onElementsChange(newElements: HTMLElement[], oldElements: HTMLElement[]): void;
    created(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
