/* File Purpose:
 * Propose different common tools to help other components
 */

import error from './errors';

import {
    ErrorDetails,
    ErrorSelectorPurpose,
    SelectorElement,
} from '../types.d';

/** merge deeply an object in another one. */
export function merge<A extends object, B extends object>(target: A, source: B, list = new Map()): A & B {
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

/** Return a value which should be included between min and max */
export function minMaxValue(value: number, min: number, max: number): number {
    if (min > max) {
        return min;
    }
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}

type GetElementSyncOptions = {
    purpose: ErrorSelectorPurpose;
    timeoutError?: (details: ErrorDetails) => void;
};

type GetElementAsyncOptions = GetElementSyncOptions & {
    timeout: number;
    refTime?: number;
};

export type GetElementOptions = GetElementSyncOptions | GetElementAsyncOptions;

export function getElement(query: string, options: GetElementSyncOptions): SelectorElement;
export function getElement(query: string, options: GetElementAsyncOptions): Promise<SelectorElement>;
export function getElement(query: string, options: GetElementOptions): SelectorElement | Promise<SelectorElement> {
    const {
        purpose,
        timeout,
        timeoutError,
        refTime = performance.now(),
    } = options as GetElementAsyncOptions;

    try {
        const element = document.querySelector(query) as SelectorElement;
        if (typeof timeout === 'number') {
            if (element) {
                return Promise.resolve(element);
            }

            /* Timeout have ben reached */
            if (performance.now() - refTime > timeout) {
                const details = {
                    timeout,
                    selector: query,
                    purpose,
                };

                if (typeof timeoutError === 'function') {
                    timeoutError(details);
                } else {
                    error(324, details);
                }

                return Promise.resolve(null);
            }

            /* If timeout is not reached then search again */
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(getElement(query, { purpose, timeout, refTime, timeoutError }));
                }, 50);
            });
        }
        return element;
    } catch(err) {
        error(300, { selector: query, purpose, error: err as Error });
    }

    if (typeof timeout === 'number') {
        return Promise.resolve(null);
    }
    return null;
}
