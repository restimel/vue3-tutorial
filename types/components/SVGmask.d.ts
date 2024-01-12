import { Vue, h } from 'vtyx';
import { BoxNotEmpty, Rect } from '../types.d';
export interface Props {
    targets: BoxNotEmpty[];
    maskMargin: number;
    style?: string;
    maskStyle?: string;
}
export default class SVG extends Vue<Props> {
    private style?;
    private maskStyle?;
    private maskMargin;
    private targets;
    private forceUpdate;
    get width(): number;
    get height(): number;
    get viewBox(): string;
    get cacheForceUpdate(): () => void;
    get targetsWithMargin(): Rect[];
    get path(): string;
    mounted(): void;
    unmounted(): void;
    render(): h.JSX.Element;
}
