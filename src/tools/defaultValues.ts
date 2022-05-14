/** File purpose:
 * It contains all default values and function to merge them.
 */

import {
    Binding,
    Dictionary,
    Options,
    StepOptions,
} from '../types.d';

function merge<A extends object, B extends object>(target: A, source: B, list = new Map()): A & B {
    if (typeof source !== 'object') {
        return source;
    }
    if (typeof target !== 'object') {
        if (Array.isArray(source)) {
            target = [] as A;
        } else {
            target = {} as A;
        }
    }

    for (const key of Object.keys(source)) {
        const val = (source as any)[key];

        if (list.has(val)) {
            (target as any)[key] = list.get(val);
            continue;
        }
        const tgtValue = (target as any)[key];

        if (typeof val === 'object') {
            if (Array.isArray(val)) {
                const valTarget = Array.isArray(tgtValue) ? tgtValue : [];
                list.set(val, valTarget);
                val.forEach((sourceVal, index) => {
                    valTarget[index] = merge(valTarget[index], sourceVal, list);
                });
                (target as any)[key] = valTarget;
                continue;
            }
            const valTarget = typeof tgtValue === 'object' ? tgtValue : {};
            list.set(val, valTarget);
            (target as any)[key] = merge(valTarget, val, list);
        } else {
            (target as any)[key] = val;
        }
    }

    return target as A & B;
}

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
    classTheme: '',
    position: 'auto',
    highlight: true,
    arrowAnimation: true,
    mask: true,
    maskMargin: 0,
    bindings: DEFAULT_BINDING,
    texts: DEFAULT_DICTIONARY,
    timeout: 3000,
};

export function mergeStepOptions(...options: Options[]): StepOptions {
    return options.reduce((merged, option) => merge(merged, option), {}) as StepOptions;
}
