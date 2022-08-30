import { Vue, h } from 'vtyx';
import { ArrowPosition, Box, Placement, Position } from '../types.d';
export interface Props {
    elementsBox?: Box[];
    masksBox?: Box[];
    position?: Placement;
    arrow?: boolean | ArrowPosition[];
    arrowAnimation?: boolean;
    mask?: boolean;
    maskMargin?: number;
}
export default class Window extends Vue<Props> {
    private elementsBox;
    private masksBox;
    private position;
    private arrow;
    private arrowAnimation;
    private mask;
    private maskMargin;
    private elementSize;
    get mainBoxElement(): Box;
    get realPosition(): Placement;
    get hasNoPointer(): boolean;
    get computePosition(): Position;
    get stylePosition(): string;
    get refUpdateSize(): () => void;
    get getScrollPosition(): Position | undefined;
    get styleScrollPosition(): string;
    get arrowsPosition(): ArrowPosition[];
    protected onElementBoxChange(): void;
    private updateSize;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
