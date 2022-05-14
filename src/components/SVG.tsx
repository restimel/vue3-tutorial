/* File Purpose:
 * It displays an SVG content
 */


import {Vue, Component, Emits, Prop, h} from 'vtyx';

export interface Props {
    path: string;
    width?: number | string;
    height?: number | string;
    viewBox?: string;

    style?: string;
}

@Component
export default class SVG extends Vue<Props> {
    /* {{{ props */

    @Prop()
    private path: string;

    @Prop({default: 32})
    private width: number | string;

    @Prop({default: 32})
    private height: number | string;

    @Prop({default: '0 0 100 100'})
    private viewBox: string;

    /* XXX: seems that style is not known by JSX  :( ... */
    @Prop()
    private style?: string;

    /* }}} */
    /* {{{ data */

    /* }}} */
    /* {{{ computed */

    /* }}} */
    /* {{{ methods */
    /* }}} */
    /* {{{ watch */
    /* }}} */
    /* {{{ Life cycle */

    /* }}} */

    public render() {
        return h('svg', {
            style: this.style,
            height: this.height,
            width: this.width,
            viewbox: this.viewBox,
        }, [
            h('path', {
                d: this.path,
            }),
        ]);
    }
}
