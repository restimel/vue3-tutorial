import { Vue, h } from 'vtyx';
type TextType = 'bold' | 'color' | 'header' | 'hr' | 'icon' | 'image' | 'inlineCode' | 'indentation' | 'italic' | 'lineFeed' | 'link' | 'multilineCode' | 'newLine' | 'olist' | 'quote' | 'strike' | 'sub' | 'sup' | 'table' | 'text' | 'ulist';
type Chunk = {
    type: TextType;
    value: string;
    extra?: string;
};
export interface Props {
    source: string;
}
export default class Markdown extends Vue<Props> {
    source: string;
    get chunkedSource(): Chunk[];
    private renderChunks;
    render(): h.JSX.Element;
}
export {};
