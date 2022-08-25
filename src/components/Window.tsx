/* File Purpose:
 * Display a modal box on the screen depending on a position.
 */

import {Vue, Component, Prop, h, Watch} from 'vtyx';
import SVG from './SVG';
import Mask from './SVGmask';
import {
    minMaxValue,
} from '../tools/tools';
import {
    Box,
    BoxNotEmpty,
    Placement,
} from '../types.d';

/** [style X, style Y, orientation] */
type Position = [string, string, Placement];

export interface Props {
    elementsBox?: Box[];
    position?: Placement;
    arrowAnimation?: boolean;
    mask?: boolean;
    maskMargin?: number;
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
    @Prop({ default: true })
    private mask: boolean;
    @Prop({ default: 0 })
    private maskMargin: number;

    /* }}} */
    /* {{{ data */

    private elementSize: [number, number] = [0, 0];

    /* }}} */
    /* {{{ computed */

    get mainElement(): Box {
        return this.elementsBox[0];
    }

    get realPosition(): Placement {
        const position = this.position;

        if (position !== 'auto') {
            return position;
        }

        const box = this.mainElement;
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

        if (box[3] + BOX_MARGIN + elHeight > screenHeight) {
            worstPosition.bottom += 100;
        }

        if (box[1] - BOX_MARGIN - elHeight < 0) {
            worstPosition.top += 100;
        }

        if (box[2] + BOX_MARGIN + elWidth > screenWidth) {
            worstPosition.right += 100;
        }

        if (box[0] - BOX_MARGIN - elWidth < 0) {
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
        return !boxes?.length || !boxes[0].length || !!this.getScrollPosition || this.realPosition === 'center';
    }

    get computePosition(): Position {
        const box = this.mainElement as BoxNotEmpty;
        const realPosition = !box || box[4] !== 'visible' ? 'center' : this.realPosition;

        return this.getPosition(box, realPosition);
    }

    get stylePosition(): string {
        const [x, y, ] = this.computePosition;

        return `left: ${x}; top: ${y};`;
    }

    /* XXX: This is only to create a reference to the same function */
    get refUpdateSize() {
        return this.updateSize.bind(this);
    }

    /* {{{ scroll */

    get getScrollPosition(): Position | undefined {
        const box = this.mainElement;
        const hiddenPosition = box?.[4];

        if (!hiddenPosition || hiddenPosition === 'visible') {
            return;
        }

        return this.getPosition(box as BoxNotEmpty, hiddenPosition);
    }

    get styleScrollPosition(): string {
        const [x, y, ] = this.getScrollPosition || [];

        return `left: ${x}; top: ${y};`;
    }

    /* }}} */
    /* }}} */
    /* {{{ watch */

    @Watch('elementsBox', { deep: true })
    protected onElementBoxChange() {
        setTimeout(this.refUpdateSize, 10);
    }

    /* }}} */
    /* {{{ methods */

    private updateSize() {
        const el = this.$refs.modalWindow as HTMLElement;
        const rect = el.getBoundingClientRect();

        this.elementSize = [rect.width, rect.height];
    }

    private getPosition(box: BoxNotEmpty, realPosition: Placement): Position {
        const screenHeight = innerHeight;
        const screenWidth = innerWidth;

        let x: string;
        let y: string;

        switch (realPosition) {
            case 'bottom':
                x = minMaxValue((box[0] + box[2]) / 2, 0, screenWidth) + 'px';
                y = minMaxValue(box[3], 0, screenHeight) + 'px';
                break;
            case 'top':
                x = minMaxValue((box[0] + box[2]) / 2, 0, screenWidth) + 'px';
                y = minMaxValue(box[1], 0, screenHeight) + 'px';
                break;
            case 'left':
                x = minMaxValue(box[0], 0, screenWidth) + 'px';
                y = minMaxValue((box[1] + box[3]) / 2, 0, screenHeight) + 'px';
                break;
            case 'right':
                x = minMaxValue(box[2], 0, screenWidth) + 'px';
                y = minMaxValue((box[1] + box[3]) / 2, 0, screenHeight) + 'px';
                break;
            case 'auto':
            case 'center':
                x = '50%';
                y = '50%';
                break;
        }

        return [x, y, realPosition];
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
                {this.mask && (
                <Mask
                    targets={this.elementsBox as BoxNotEmpty[]}
                    maskMargin={this.maskMargin}
                />
                )}
                {!this.hasNoPointer && (
                <SVG
                    width="15"
                    height="15"
                    viewBox="0 0 30 30"
                    path="M0,0L0,15L5,5L25,30L25,25L30,25L5,5L15,0L0,0Z"
                    style={this.stylePosition}
                    class={[
                        'vue3-tutorial__window-arrow',
                        'position-' + position,
                        this.arrowAnimation ? 'animation' : '',
                    ]}
                />
                )}
                {!!this.getScrollPosition && (
                <SVG
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    path="M0,0L0,15L7,7L10,30L30,10L7,7L15,0L0,0Z"
                    style={this.styleScrollPosition}
                    class={[
                        'vue3-tutorial__window-scroll-arrow',
                        'position-' + this.getScrollPosition[2],
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
