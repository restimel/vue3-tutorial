/** File purpose:
 * It contains all default values and function to merge them.
 */

import {
    Binding,
    Dictionary,
    Options,
    StepOptions,
} from '../types.d';
import { merge } from './tools';

export const DEFAULT_DICTIONARY: Dictionary = {
    finishButton: 'Finish',
    nextButton: 'Next',
    previousButton: 'Previous',
    skipButtonTitle: 'Skip tutorial',
    skipConfirm: 'Do you want to quit the tutorial?',
    stepState: 'step %(currentStep)s / %(totalStep)s',
};

export const DEFAULT_BINDING: Binding = {
    next: ['ArrowRight', 'Enter'],
    previous: 'ArrowLeft',
    skip: 'Escape',
};

export const DEFAULT_STEP_OPTIONS: StepOptions = {
    arrow: true,
    arrowAnimation: true,
    bindings: DEFAULT_BINDING,
    classForTargets: '',
    focus: 'no-focus',
    highlight: true,
    mask: true,
    maskMargin: 0,
    muteElements: false,
    position: 'auto',
    scroll: 'auto-scroll',
    sticky: false,
    teleport: true,
    texts: DEFAULT_DICTIONARY,
    timeout: 3000,
    debug: false,
};

export function mergeStepOptions(...options: Options[]): StepOptions {
    return options.reduce((merged, option) => merge(merged, option), {}) as StepOptions;
}
