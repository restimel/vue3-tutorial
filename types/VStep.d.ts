import { h, Vue } from 'vtyx';
import { Step, TutorialInformation } from './types';
type MainElementList = [HTMLElement | null, ...HTMLElement[]];
export interface Props {
    step: Step;
    tutorialInformation: TutorialInformation;
}
export default class VStep extends Vue<Props> {
    private step;
    private tutorialInformation;
    private windowOffset;
    private refPoint;
    private get fullOptions();
    /** To keep a common reference */
    private get mouseMoveListener();
    /** To keep a common reference */
    private get mouseUpListener();
    private get displayPreviousButton();
    private get displayNextButton();
    private get displayFinishButton();
    private get displaySkipButton();
    protected onTextsChange(): void;
    protected onBindingsChange(): void;
    protected onStepChange(): void;
    private removeActionListener;
    private get nextActionType();
    private get nextActionTarget();
    private get needsNextButton();
    private actionListener;
    private addActionListener;
    protected onActionTypeChange(): void;
    private addResizeListener;
    private removeResizeListener;
    private scrollElements;
    private addScrollListener;
    private clearScrollListener;
    protected onPositionElementsChange(): void;
    private get mutationObserver();
    private mouseDownHeader;
    private mouseUpHeader;
    private removeMoveListener;
    private mouseMove;
    private cacheElements;
    private boxCache;
    private startTime;
    private timerGetAllElements;
    private working;
    private requestRef;
    private updateBox;
    private mainElement;
    private targetElements;
    /** list of target elements.
     *
     * Convert the Set in Array.
     * The Set is used to avoid duplications.
     * The Array is used to keep elements in the same order as boxes.
     */
    private get targetElementsOrdered();
    private get isMainElementHidden();
    private get targetBoxes();
    private getTargetElements;
    protected onElementsBoxChange(): void;
    private highlightElements;
    private oldHighlightElements;
    private getHighlightElements;
    private addHighlightClass;
    private addClass;
    private removeClass;
    protected onElementsChange(oldList: MainElementList): void;
    protected onHighlightElementsChange(): void;
    protected onMainElementChange(): void;
    private maskElements;
    private get masksBox();
    private getMaskElements;
    private arrowElements;
    private get arrowsPosition();
    private getArrowElements;
    private mutedElements;
    private getMutedElements;
    private resetMutedElements;
    private timerSetFocus;
    private stopWatchForFocus;
    private setFocus;
    private scrollTo;
    private get isStepReady();
    private recomputeBox;
    private debounceGetAllElement;
    /** Fetch all elements needed for the step.
     *
     * @param ref {number} this is to check if the query is deprecated.
     *                     if 0, a new query is done.
     */
    private getAllElements;
    private getElements;
    private isDeprecated;
    protected onStepTargetChange(): void;
    protected onReadyChange(): void;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
export {};
