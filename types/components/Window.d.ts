import { Vue, h } from 'vtyx';
import { Box, Placement } from '../types.d';
/** [style X, style Y, orientation] */
declare type Position = [string, string, Placement];
export interface Props {
    elementsBox?: Box[];
    position?: Placement;
    arrowAnimation?: boolean;
}
export default class Window extends Vue<Props> {
    private elementsBox;
    private position;
    private arrowAnimation;
    private elementSize;
    get mainElement(): Box;
    get realPosition(): Placement;
    get hasNoPointer(): boolean;
    get computePosition(): Position;
    get stylePosition(): string;
    get refUpdateSize(): () => void;
    get getScrollPosition(): Position | undefined;
    get styleScrollPosition(): string;
    protected onElementBoxChange(): void;
    private updateSize;
    private getPosition;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
export {};
