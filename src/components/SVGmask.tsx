/* File Purpose:
 * It displays an SVG content
 */

import {Vue, Component,  Prop, h} from 'vtyx';
import { getRectOverlaps } from '../tools/geometry';
import { BoxNotEmpty, Rect } from '../types.d';

export interface Props {
    targets: BoxNotEmpty[];
    maskMargin: number;

    style?: string;
    maskStyle?: string;
}

@Component
export default class SVG extends Vue<Props> {
    /* {{{ props */

    /* XXX: seems that style is not known by JSX  :( ... */
    @Prop()
    private style?: string;

    @Prop()
    private maskStyle?: string;

    @Prop({ default: 0 })
    private maskMargin: number;

    @Prop()
    private targets: BoxNotEmpty[];

    /* }}} */
    /* {{{ data */

    private forceUpdate = 0;

    /* }}} */
    /* {{{ computed */

    get width() {
        const width = self.innerWidth;
        this.forceUpdate; /* for reactivity */

        return width;
    }

    get height() {
        const height = self.innerHeight;
        this.forceUpdate; /* for reactivity */

        return height;
    }

    get viewBox() {
        const width = this.width;
        const height = this.height;

        return `0 0 ${width} ${height}`;
    }

    get cacheForceUpdate() {
        return () => {
            this.forceUpdate++;
        };
    }

    get targetsWithMargin(): Rect[] {
        const margin = this.maskMargin;
        return this.targets.map((target) => {
            const [x1, y1, x2, y2] = target;
            return [x1 - margin, y1 - margin, x2 + margin, y2 + margin];
        });
    }

    get path() {
        const width = this.width;
        const height = this.height;
        const rect = `M0,0 H${width} V${height} H0 z`;
        const targets = this.targetsWithMargin;

        /* rotate in the opposite rotation direction to create holes */
        const holes = targets.map((target) => {
            const [x1, y1, x2, y2] = target;
            return `M${x1},${y1} V${y2} H${x2} V${y1} z`;
        });
        /* and rotate again in the opposite direction, to nullify holes overlapping */
        const overlapHoles = getRectOverlaps(targets).map((target) => {
            const [x1, y1, x2, y2] = target;
            return `M${x1},${y1} H${x2} V${y2} H${x1} z`;
        });

        return [rect, ...holes, ...overlapHoles].join(' ');
    }

    /* }}} */
    /* {{{ Life cycle */

    public mounted() {
        addEventListener('resize', this.cacheForceUpdate);
    }

    public unmounted() {
        removeEventListener('resize', this.cacheForceUpdate);
    }

    /* }}} */

    public render() {
        return (
            <svg
                style={this.style}
                width={this.width}
                height={this.height}
                viewBox={this.viewBox}
                xmlns="http://www.w3.org/2000/svg"
                class="vue3-tutorial__svg-mask"
            >
                <path
                    d={this.path}
                    style={this.maskStyle}
                    class="vue3-tutorial__mask"
                />
            </svg>
        );
    }
}
