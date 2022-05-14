/* File Purpose:
 * It handles the display for one step
 */


import {Vue, Component, Emits, Prop, Watch, h} from 'vtyx';
import Window, { Box } from './components/Window';
import {
    mergeStepOptions,
} from './tools/defaultValues';
import {
    Options,
    StepDescription,
    StepOptions,
    TutorialInformation,
} from './types';
import label, { changeTexts } from './tools/labels';
import { resetBindings } from './tools/keyBinding';

export interface Props {
    step: StepDescription;
    options: Options;
    tutorialInformation: TutorialInformation;
}

@Component
export default class VStep extends Vue<Props> {
    /* {{{ props */

    @Prop()
    private step: StepDescription;

    @Prop()
    private options: Options;

    @Prop()
    private tutorialInformation: TutorialInformation;

    /* }}} */
    /* {{{ data */

    private forceRecompute = 1;

    /* }}} */
    /* {{{ computed */

    get elements(): HTMLElement[] {
        const target = this.step.target;

        if (this.forceRecompute === 0 || !target) {
            return [];
        }

        const elementList: Set<HTMLElement> = new Set();
        const targets = Array.isArray(target) ? target : [target];

        targets.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            if (elements) {
                for (const el of Array.from(elements)) {
                    elementList.add(el as HTMLElement);
                }
            }
        });

        return Array.from(elementList);
    }

    get mainElement(): HTMLElement | null {
        const element = this.elements[0];

        return element || null;
    }

    get fullOptions(): StepOptions {
        return mergeStepOptions(this.options, this.step.options || {});
    }

    get elementsBox(): Box[] {
        const elements = this.elements;

        return elements.map((element) => {
            const rect = element.getBoundingClientRect();

            return [rect.left, rect.top, rect.right, rect.bottom];
        });
    }

    /* {{{ buttons */

    get displayPreviousButton(): boolean {
        const info = this.tutorialInformation;

        if (info.currentIndex <= 0) {
            return false;
        }
        console.log('TODO: check that previous step is reachable');
        return true;
    }

    get displayNextButton(): boolean {
        const info = this.tutorialInformation;

        if (info.currentIndex >= info.nbTotalSteps - 1) {
            return false;
        }
        console.log('TODO: check that there is no special action');
        return true;
    }

    get displayFinishButton(): boolean {
        const info = this.tutorialInformation;

        console.log('TODO: check that there is no special action');
        if (info.currentIndex >= info.nbTotalSteps - 1) {
            return true;
        }
        return false;
    }

    get displaySkipButton(): boolean {
        return true;
    }

    /* }}} */
    /* }}} */
    /* {{{ methods */

    private recompute() {
        this.forceRecompute++;
    }

    private addClass(newTargets: HTMLElement[]) {
        const options = this.fullOptions;

        /* add vue3-tutorial class */
        newTargets.forEach((el) => {
            el.classList.remove(
                'vue3-tutorial__target',
            );
        });
        const mainEl = newTargets[0];
        if (mainEl) {
            mainEl.classList.add('vue3-tutorial__main-target');
            if (options.classTheme) {
                mainEl.classList.add(options.classTheme);
            }
            if (options.highlight) {
                mainEl.classList.add('vue3-tutorial-highlight');
            }
        }
    }
    private removeClass(oldTargets: HTMLElement[]) {
        const options = this.fullOptions;

        /* remove previous vue3-tutorial class */
        oldTargets.forEach((el) => {
            el.classList.remove(
                'vue3-tutorial-highlight',
                'vue3-tutorial__target',
                'vue3-tutorial__main-target'
            );
            if (options.classTheme) {
                el.classList.remove(options.classTheme);
            }
        });
    }

    /* }}} */
    /* {{{ watch */

    @Watch('fullOptions.texts')
    protected onTextsChange() {
        changeTexts(this.fullOptions.texts);
    }

    @Watch('fullOptions.bindings')
    protected onBindingsChange() {
        resetBindings(this.fullOptions.bindings);
    }

    @Watch('elements', { deep: true })
    protected onElementsChange(newElements: HTMLElement[], oldElements: HTMLElement[]) {
        if (oldElements) {
            this.removeClass(oldElements);
        }
        if (newElements) {
            this.addClass(newElements);
        }
    }

    /* }}} */
    /* {{{ Life cycle */

    public created() {
        setTimeout(() => this.recompute(), 100);
    }

    /* }}} */

    public unmounted() {
        this.removeClass(this.elements);
    }

    @Emits(['finish', 'next', 'previous', 'skip'])
    public render() {
        const options = this.fullOptions;
        const step = this.step;
        const information = this.tutorialInformation;

        return (
            <Window
                elementsBox={this.elementsBox}
                position={options.position}
                arrowAnimation={options.arrowAnimation}
            >
                <aside slot="content"
                    class="vue3-tutorial-step"
                >
                    <header
                        class="vue3-tutorial-step__header"
                    >
                        <div
                            class="vue3-tutorial-step__header__title"
                        >
                            {step.title}
                        </div>
                        <div
                            class="vue3-tutorial-step__header__status"
                        >
                            {label('stepState', {
                                currentStep: information.currentIndex + 1,
                                totalStep: information.nbTotalSteps,
                            })}
                        </div>
                    </header>
                    <div
                        class="vue3-tutorial-step__content"
                    >
                        {step.content}
                    </div>
                    <nav
                        class="vue3-tutorial-step__commands"
                    >
                        {this.displayPreviousButton && (
                        <button
                            class="vue3-tutorial-step__btn vue3-tutorial-step__btn-previous"
                            on={{
                                click: () => this.$emit('previous'),
                            }}
                        >
                            {label('previousButton')}
                        </button>
                        )}
                        {this.displaySkipButton && (
                        <button
                            class="vue3-tutorial-step__btn vue3-tutorial-step__btn-skip"
                            on={{
                                click: () => this.$emit('skip'),
                            }}
                            title={label('skipButtonTitle') as unknown as string}
                        >
                            ×
                        </button>
                        )}
                        {this.displayNextButton && (
                        <button
                            class="vue3-tutorial-step__btn vue3-tutorial-step__btn-next"
                            on={{
                                click: () => this.$emit('next'),
                            }}
                        >
                            {label('nextButton')}
                        </button>
                        )}
                        {this.displayFinishButton && (
                        <button
                            class="vue3-tutorial-step__btn vue3-tutorial-step__btn-finish"
                            on={{
                                click: () => this.$emit('finish'),
                            }}
                        >
                            {label('finishButton')}
                        </button>
                        )}
                    </nav>
                </aside>
            </Window>
        );
    }
}
