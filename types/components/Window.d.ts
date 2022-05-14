import { Vue, h } from 'vtyx';
import { Placement } from '../types.d';
/** [x1, y1, x2, y2] */
declare type BoxNotEmpty = [number, number, number, number];
export declare type Box = BoxNotEmpty | [];
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
    get realPosition(): Placement;
    get hasNoPointer(): boolean;
    get computePosition(): [string, string, Placement];
    get stylePosition(): string;
    get refUpdateSize(): () => void;
    private updateSize;
    protected onElementBoxChange(): void;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
export {};
