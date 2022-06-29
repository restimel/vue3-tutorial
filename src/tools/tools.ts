/* File Purpose:
 * Propose different common tools to help other components
 */

import error from './errors';

import {
    BoxNotEmpty,
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
    errorIsWarning?: boolean;
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
        errorIsWarning,
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
                } else if (errorIsWarning) {
                    error(224, details);
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

export function getBox(el: HTMLElement, memo: WeakMap<HTMLElement, BoxNotEmpty>, isParent = false): BoxNotEmpty {
    /* Check if result is already in memory */
    if (isParent && memo.has(el)) {
        return memo.get(el)!;
    }

    /* Check if this element is a root element */
    const parentEl = el.parentElement;
    if (!parentEl) {
        const rect = el.getBoundingClientRect();
        const box: BoxNotEmpty = [rect.left, rect.top, rect.right, rect.bottom, 'visible'];
        memo.set(el, box);
        return box;
    }

    /* Now we want to check if current element is visible in parent element
     * (due to scroll) */
    const parentBox = getBox(parentEl, memo, true);

    /* parent is itself not visible */
    if (parentBox[4] !== 'visible') {
        memo.set(el, parentBox);
        return parentBox;
    }

    /* Check if current element never scrolls, in such case, we keep the
     * parentElement box size */
    if (isParent) {
        const currentOverflow = getComputedStyle(el).overflow;
        if (currentOverflow === 'visible') {
            memo.set(el, parentBox);
            return parentBox;
        }
    }

    /* compare position with the parent scroll status */
    const rect = el.getBoundingClientRect();
    const [parentLeft, parentTop, parentRight, parentBottom] = parentBox;
    const {
        left: currentLeft,
        top: currentTop,
        right: currentRight,
        bottom: currentBottom,
    } = rect;
    const min = Math.min;
    const max = Math.max;

    let box: BoxNotEmpty;
    if (currentTop > parentBottom) {
        box = [
            max(currentLeft, parentLeft),
            parentBottom,
            min(currentRight, parentRight),
            parentBottom,
            'bottom',
        ];
    } else if (currentBottom < parentTop) {
        box = [
            max(currentLeft, parentLeft),
            parentTop,
            min(currentRight, parentRight),
            parentTop,
            'top',
        ];
    } else if (currentLeft > parentRight) {
        box = [
            parentRight,
            max(currentTop, parentTop),
            parentRight,
            min(currentBottom, parentBottom),
            'right',
        ];
    } else if (currentRight < parentLeft) {
        box = [
            parentLeft,
            max(currentTop, parentTop),
            parentLeft,
            min(currentBottom, parentBottom),
            'left',
        ];
    } else {
        box = [
            max(currentLeft, parentLeft),
            max(currentTop, parentTop),
            min(currentRight, parentRight),
            min(currentBottom, parentBottom),
            'visible',
        ];
    }

    memo.set(el, box);
    return box;
}
