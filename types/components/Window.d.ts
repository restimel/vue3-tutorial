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
    teleport?: HTMLElement | boolean;
}
export default class Window extends Vue<Props> {
    private elementsBox;
    private masksBox;
    private position;
    private arrow;
    private arrowAnimation;
    private mask;
    private maskMargin;
    private teleport;
    private elementSize;
    private timerSizeRefresh;
    get mainBoxElement(): Box;
    get realPosition(): Placement;
    get hasNoPointer(): boolean;
    get computePosition(): Position;
    get realWindowPosition(): Placement;
    get stylePosition(): string;
    get refUpdateSize(): () => void;
    get teleportContainer(): HTMLElement | null;
    get getScrollPosition(): Position | undefined;
    get styleScrollPosition(): string;
    get arrowsPosition(): ArrowPosition[];
    protected onElementBoxChange(): void;
    protected onTeleportChange(): void;
    private updateSize;
    private useTeleport;
    private removeTeleport;
    mounted(): void;
    updated(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
