/* File Purpose:
 * Display a modal box on the screen depending on a position.
 */

import {Vue, Component, Prop, h, Watch} from 'vtyx';
import SVG from './SVG';
import {Placement} from '../types.d';

/** [x1, y1, x2, y2] */
type BoxNotEmpty = [number, number, number, number];
export type Box = BoxNotEmpty | [];

export interface Props {
    elementsBox?: Box[];
    position?: Placement;
    arrowAnimation?: boolean;
}

const BOX_MARGIN = 25;

@Component
export default class Window extends Vue<Props> {
    /* {{{ props */

    @Prop({ default: () => [] })
    private elementsBox: Box[];
    @Prop({ default: 'auto' })
    private position: Placement;
    @Prop({ default: true })
    private arrowAnimation: boolean;

    /* }}} */
    /* {{{ data */

    private elementSize: [number, number] = [0, 0];

    /* }}} */
    /* {{{ computed */

    get realPosition(): Placement {
        const position = this.position;

        if (position !== 'auto') {
            return position;
        }

        const boxes = this.elementsBox;
        const box = boxes[0];
        if (!box?.length) {
            return 'center';
        }

        /* check where there are enough spaces */
        const [elWidth, elHeight] = this.elementSize;
        const screenHeight = innerHeight;
        const screenWidth = innerWidth;
        const worstPosition = {
            bottom: 0,
            top: 1,
            right: 2,
            left: 3,
        };

        if (box[3] + BOX_MARGIN + elHeight < screenHeight) {
            worstPosition.bottom += 100;
        }

        if (box[1] - BOX_MARGIN - elHeight > 0) {
            worstPosition.top += 100;
        }

        if (box[2] + BOX_MARGIN + elWidth < screenWidth) {
            worstPosition.right += 100;
        }

        if (box[0] - BOX_MARGIN - elWidth > 0) {
            worstPosition.left += 100;
        }

        /* TODO check superposition with other target */

        let choice: Placement = 'bottom';
        let currentValue = worstPosition.bottom;

        if (worstPosition.top < currentValue) {
            currentValue = worstPosition.top;
            choice = 'top';
        }
        if (worstPosition.right < currentValue) {
            currentValue = worstPosition.right;
            choice = 'right';
        }
        if (worstPosition.left < currentValue) {
            currentValue = worstPosition.left;
            choice = 'left';
        }

        return choice;
    }

    get hasNoPointer(): boolean {
        const boxes = this.elementsBox;
        return !boxes?.length || !boxes[0].length || this.realPosition === 'center';
    }

    get computePosition(): [string, string, Placement] {
        const boxes = this.elementsBox;
        const box = boxes[0] as BoxNotEmpty;
        const realPosition = this.realPosition;

        let x: string;
        let y: string;

        switch (realPosition) {
            case 'bottom':
                x = (box[0] + box[2]) / 2 + 'px';
                y = box[3] + 'px';
                break;
            case 'top':
                x = (box[0] + box[2]) / 2 + 'px';
                y = box[1] + 'px';
                break;
            case 'left':
                x = box[0] + 'px';
                y = (box[1] + box[3]) / 2 + 'px';
                break;
            case 'right':
                x = box[2] + 'px';
                y = (box[1] + box[3]) / 2 + 'px';
                break;
            case 'auto':
            case 'center':
                x = '50%';
                y = '50%';
                break;
        }

        return [x, y, realPosition];
    }

    get stylePosition(): string {
        const [x, y, ] = this.computePosition;

        return `left: ${x}; top: ${y};`;
    }

    /* XXX: This is only to create a reference to the same function */
    get refUpdateSize() {
        return this.updateSize.bind(this);
    }

    /* }}} */
    /* {{{ methods */

    private updateSize() {
        const el = this.$refs.modalWindow as HTMLElement;
        const rect = el.getBoundingClientRect();

        this.elementSize = [rect.width, rect.height];
    }

    /* }}} */
    /* {{{ watch */

    @Watch('elementBox')
    protected onElementBoxChange() {
        setTimeout(this.refUpdateSize, 10);
    }

    /* }}} */
    /* {{{ Life cycle */

    public mounted() {
        this.updateSize();
        addEventListener('resize', this.refUpdateSize);
    }

    public unmounted() {
        removeEventListener('resize', this.refUpdateSize);
    }

    /* }}} */

    public render() {
        const position = this.computePosition[2];

        return (
            <div class="vue3-tutorial__window-container">
                {!this.hasNoPointer && (
                <SVG
                    width="15"
                    height="15"
                    viewBox="0 0 30 30"
                    path="M0,0L0,15L5,5L15,0L0,0L25,30L25,25L30,25Z"
                    style={this.stylePosition}
                    class={[
                        'vue3-tutorial__window-arrow',
                        'position-' + position,
                        this.arrowAnimation ? 'animation' : '',
                    ]}
                />
                )}

                <div
                    style={this.stylePosition}
                    class={[
                        'vue3-tutorial__window',
                        'position-' + position,
                    ]}
                    ref="modalWindow"
                >
                    {this.$slots.content?.()}
                </div>
            </div>
        );
    }
}
