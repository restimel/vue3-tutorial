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
    position: 'auto',
    highlight: true,
    classForTargets: '',
    arrowAnimation: true,
    mask: true,
    arrow: true,
    maskMargin: 0,
    bindings: DEFAULT_BINDING,
    focus: 'no-focus',
    muteElements: false,
    texts: DEFAULT_DICTIONARY,
    scroll: 'scroll-to',
    timeout: 3000,
    teleport: true,
    debug: false,
};

export function mergeStepOptions(...options: Options[]): StepOptions {
    return options.reduce((merged, option) => merge(merged, option), {}) as StepOptions;
}
