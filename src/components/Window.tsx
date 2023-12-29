/* File Purpose:
 * Display a modal box on the screen depending on a position.
 */

import {Vue, Component, Prop, h, Watch} from 'vtyx';
import SVG from './SVG';
import Mask from './SVGmask';
import {
    emptyArray,
    getAutoPlacement,
    getPosition,
} from '../tools/tools';
import {
    AbsolutePlacement,
    ArrowPosition,
    Box,
    BoxNotEmpty,
    Placement,
    Position,
} from '../types.d';

export interface Props {
    elementsBox?: Box[];
    masksBox?: Box[];
    position?: Placement;
    arrow?: boolean | ArrowPosition[];
    arrowAnimation?: boolean;
    mask?: boolean;
    maskMargin?: number;
    teleport?: HTMLElement | boolean
}

@Component
export default class Window extends Vue<Props> {
    /* {{{ props */

    @Prop({ default: () => [] })
    private elementsBox: Box[];
    @Prop({ default: () => [] })
    private masksBox: Box[];
    @Prop({ default: 'auto' })
    private position: Placement;
    @Prop({ default: true })
    private arrow: boolean | ArrowPosition[];
    @Prop({ default: true })
    private arrowAnimation: boolean;
    @Prop({ default: true })
    private mask: boolean;
    @Prop({ default: 0 })
    private maskMargin: number;
    @Prop({ default: true })
    private teleport: HTMLElement | boolean;

    /* }}} */
    /* {{{ data */

    /** The dimension of the window element */
    private elementSize: [number, number] = [0, 0];
    private timerSizeRefresh = 0;

    /* }}} */
    /* {{{ computed */

    get mainBoxElement(): Box {
        return this.elementsBox[0];
    }

    /** Transform 'auto' into a Placement value */
    get realPosition(): AbsolutePlacement {
        const position = this.position;

        if (position !== 'auto' && position !== 'hidden') {
            return position;
        }

        const box = this.mainBoxElement;
        if (!box?.length) {
            return 'center';
        }

        return getAutoPlacement(box, this.elementSize);
    }

    get hasNoPointer(): boolean {
        const arrow = this.arrow;
        if (arrow === false) {
            return true;
        }

        if (arrow === true) {
            const boxes = this.elementsBox;
            return !boxes?.length || !boxes[0].length || !!this.scrollPosition || this.realPosition === 'center';
        }

        return false;
    }

    get computePosition(): Position {
        const box = this.mainBoxElement as BoxNotEmpty;
        const realPosition = this.realPosition;
        const preferredPosition = !box || box[4] !== 'visible' ? 'center' : realPosition;

        return getPosition(box, preferredPosition);
    }

    get windowPlacement(): Placement {
        if (this.position === 'hidden') {
            return 'hidden';
        }
        return this.computePosition[2];
    }

    get styleWindowCoords(): string {
        let [x, y, placement] = this.computePosition;
        const [elWidth, elHeight] = this.elementSize;

        switch (placement) {
            case 'center':
            case 'hidden':
                break;
            case 'bottom':
            case 'top':
                const valX = parseInt(x, 10);
                if (valX < elWidth / 2) {
                    x = elWidth / 2 + 'px';
                }
                break;
            case 'left':
            case 'right':
                const valY = parseInt(y, 10);
                if (valY < elHeight / 2) {
                    y = elHeight / 2 + 'px';
                }
                break;
        }

        return `--vue3-tutorial-x: ${x}; --vue3-tutorial-y: ${y};`;
    }

    /* XXX: This is only to create a reference to the same function */
    get refUpdateSize() {
        return this.updateSize.bind(this);
    }

    get teleportContainer(): HTMLElement | null {
        let el = this.teleport;
        if (typeof el === 'boolean') {
            if (el) {
                return document.body;
            }
            return null;
        }
        return el;
    }

    /* {{{ scroll */

    get scrollPosition(): Position | undefined {
        const box = this.mainBoxElement;
        const hiddenPosition = box?.[4];

        if (!hiddenPosition || hiddenPosition === 'visible' || hiddenPosition === 'hidden') {
            return;
        }

        return getPosition(box as BoxNotEmpty, hiddenPosition);
    }

    get styleScrollPosition(): string {
        const [x, y, ] = this.scrollPosition || [];

        return `--vue3-tutorial-x: ${x}; --vue3-tutorial-y: ${y};`;
    }

    get arrowsPosition(): ArrowPosition[] {
        const arrow = this.arrow;
        if (!arrow || this.hasNoPointer) {
            return emptyArray;
        }

        if (arrow === true) {
            const [x, y, position] = this.computePosition;
            return [{ x, y, position }];
        }

        return arrow;
    }

    /* }}} */
    /* }}} */
    /* {{{ watch */

    @Watch('elementsBox', { deep: true })
    protected onElementBoxChange() {
        setTimeout(this.refUpdateSize, 10);
    }

    @Watch('teleport')
    protected onTeleportChange() {
        this.useTeleport();
    }

    /* }}} */
    /* {{{ methods */

    private updateSize() {
        const el = this.$refs.modalWindow as HTMLElement;
        if (!el) {
            // it could be because the component has been removed (async call)
            return;
        }
        const rect = el.getBoundingClientRect();

        // XXX: Avoid this.elementSize = [rect.width, rect.height];
        // because it creates a new reference (and so it renders continually)
        this.elementSize[0] = rect.width;
        this.elementSize[1] = rect.height;
    }

    private useTeleport() {
        const containerElement = this.teleportContainer;
        const el = this.$el;
        if (containerElement && el) {
            containerElement.appendChild(el);
        }
    }

    private removeTeleport() {
        const el = this.$el;
        const containerElement = el?.parentNode;

        containerElement?.removeChild(this.$el);
    }

    /* }}} */
    /* {{{ Life cycle */

    public mounted() {
        this.useTeleport();
        this.updateSize();
        addEventListener('resize', this.refUpdateSize);
    }

    public updated() {
        // call updateSize after all changes in render (debounce)
        clearTimeout(this.timerSizeRefresh);
        this.timerSizeRefresh = setTimeout(this.updateSize.bind(this), 50);
    }

    public unmounted() {
        removeEventListener('resize', this.refUpdateSize);
        this.removeTeleport();
    }

    /* }}} */

    public render() {
        const arrowAnimation = this.arrowAnimation;

        return (
            <div class="vue3-tutorial__window-container">
                {this.mask && (
                    <Mask
                        targets={this.masksBox as BoxNotEmpty[]}
                        maskMargin={this.maskMargin}
                    />
                )}
                {this.arrowsPosition.map((arrow) => (
                    <SVG
                        width="15"
                        height="15"
                        viewBox="0 0 30 30"
                        path="M0,0L0,15L5,5L25,30L25,25L30,25L5,5L15,0L0,0Z"
                        style={`--vue3-tutorial-x: ${arrow.x}; --vue3-tutorial-y: ${arrow.y};`}
                        class={[
                            'vue3-tutorial__window-arrow',
                            'position-' + arrow.position,
                            arrowAnimation ? 'animation' : '',
                        ]}
                    />
                ))}
                {!!this.scrollPosition && (
                    <SVG
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        path="M0,0L0,15L7,7L10,30L30,10L7,7L15,0L0,0Z"
                        style={this.styleScrollPosition}
                        class={[
                            'vue3-tutorial__window-scroll-arrow',
                            'position-' + this.scrollPosition[2],
                            this.arrowAnimation ? 'animation' : '',
                        ]}
                    />
                )}

                <div
                    style={this.styleWindowCoords}
                    class={[
                        'vue3-tutorial__window',
                        'position-' + this.windowPlacement,
                    ]}
                    ref="modalWindow"
                >
                    {this.$slots.content?.()}
                </div>
            </div>
        );
    }
}
