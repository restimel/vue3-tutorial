/* File Purpose:
 * It displays an SVG content
 */


import {Vue, Component,  Prop, h} from 'vtyx';

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
        return (
            <svg
                style={this.style}
                width={this.width}
                height={this.height}
                viewBox={this.viewBox}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d={this.path}
                />
            </svg>
        );
    }
}
