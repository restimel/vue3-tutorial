import { Vue } from 'vtyx';
export interface Props {
    path: string;
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    style?: string;
}
export default class SVG extends Vue<Props> {
    private path;
    private width;
    private height;
    private viewBox;
    private style?;
    render(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
}
