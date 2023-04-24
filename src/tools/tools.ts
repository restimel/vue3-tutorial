/* File Purpose:
 * Propose different common tools to help other components
 */

import error from './errors';

import {
    BoxNotEmpty,
    ErrorDetails,
    ErrorSelectorPurpose,
    Placement,
    Position,
    Rect,
    SelectorElement,
    SelectorElements,
} from '../types.d';
import { getRectCenter } from './geometry';

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

/** Copy Set values into another Set */
export function shallowSetCopy<T = any>(origin: Set<T>, copy?: Set<T>): Set<T> {
    const clone = copy ?? new Set<T>();
    clone.clear();
    for (const item of origin) {
        clone.add(item);
    }

    return clone;
}

/** Return a value which should be included between min and max */
function minMaxValue(value: number, min: number, max: number): number {
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

type SyncOptions = {
    purpose: ErrorSelectorPurpose;
    timeoutError?: (details: ErrorDetails) => void;
    errorIsWarning?: boolean;
};

type AsyncOptions = SyncOptions & {
    timeout: number;
    refTime?: number;
};

type GetElementSyncOptions = SyncOptions & {
    all?: false;
    cache?: Map<string, HTMLElement>;
};

type GetAllElements = {
    all: true;
    cache?: Map<string, HTMLElement[]>;
};

/* This reference is only to return a common reference for an empty array.
 * This should avoid triggering changes when only providing a new empty array */
export const emptyArray: any[] = [];

type GetElementAsyncOptions = GetElementSyncOptions & AsyncOptions;

type GetElementsSyncOptions = SyncOptions & GetAllElements
export type GetElementsAsyncOptions = GetElementsSyncOptions & AsyncOptions

export type GetElementOptions = GetElementSyncOptions | GetElementAsyncOptions
    | GetElementsSyncOptions | GetElementsAsyncOptions;

export function getElement(query: string, options: GetElementSyncOptions): SelectorElement;
export function getElement(query: string, options: GetElementAsyncOptions): Promise<SelectorElement>;
export function getElement(query: string, options: GetElementsSyncOptions): SelectorElements;
export function getElement(query: string, options: GetElementsAsyncOptions): Promise<SelectorElements>;
export function getElement(query: string, options: GetElementOptions): SelectorElement | SelectorElements | Promise<SelectorElement | SelectorElements> {
    const {
        purpose,
        timeout,
        timeoutError,
        errorIsWarning,
        cache,
        all = false,
        refTime = performance.now(),
    } = options as GetElementAsyncOptions;

    try {
        let element: SelectorElement | SelectorElements;
        let isEmpty: boolean = false;

        if (cache?.has(query)) {
            element = cache.get(query)!;
        } else if (all) {
            const elements = document.querySelectorAll(query);
            element = !elements ? null : Array.from(elements) as SelectorElements;
            isEmpty = !element?.length;
        } else {
            element = document.querySelector(query) as SelectorElement;
            isEmpty = !element;
        }

        /* manage cache */
        if (!isEmpty && cache) {
            cache.set(query, element as any);
        }

        if (typeof timeout === 'number') {
            if (!isEmpty) {
                return Promise.resolve(element);
            }

            /* Timeout have been reached */
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
                    resolve(getElement(query, {
                        purpose,
                        timeout,
                        timeoutError,
                        errorIsWarning,
                        cache,
                        all,
                        refTime,
                    }));
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

function isHidden(rect: DOMRect): 'visible' | 'hidden' {
    const {x, y, width, height} = rect;

    if (!x && !y && !width && !height) {
        return 'hidden';
    }
    return 'visible';
}

export function getBox(el: HTMLElement, memo: WeakMap<HTMLElement, BoxNotEmpty>, {
    isParent = false,
    getParentBox = false,
} = {}): BoxNotEmpty {
    /* Check if result is already in memory */
    if (isParent && memo.has(el)) {
        return memo.get(el)!;
    }

    /* Check if this element is a root element */
    const parentEl = el.parentElement;
    if (!parentEl) {
        const rect = el.getBoundingClientRect();
        const box: BoxNotEmpty = [rect.left, rect.top, rect.right, rect.bottom, isHidden(rect)];
        memo.set(el, box);
        return box;
    }

    /* Now we want to check if current element is visible in parent element
     * (due to scroll) */
    const parentBox = getBox(parentEl, memo, {isParent: true, getParentBox});

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
    if (isHidden(rect) === 'hidden') {
        // the element is hidden (like display:none)
        return [0, 0, 0, 0, 'hidden'];
    }
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
    if (getParentBox && (
        currentTop > parentBottom || currentBottom < parentTop ||
        currentLeft > parentRight || currentRight < parentLeft
    )) {
        // element is not visible inside parent
        box = [
            parentLeft,
            parentTop,
            parentRight,
            parentBottom,
            'visible', // TODO use a better hidden position
        ];
    } else if (currentTop > parentBottom) {
        // element is at bottom
        box = [
            max(currentLeft, parentLeft),
            parentBottom,
            min(currentRight, parentRight),
            parentBottom,
            'bottom',
        ];
    } else if (currentBottom < parentTop) {
        // element is at top
        box = [
            max(currentLeft, parentLeft),
            parentTop,
            min(currentRight, parentRight),
            parentTop,
            'top',
        ];
    } else if (currentLeft > parentRight) {
        // element is at right
        box = [
            parentRight,
            max(currentTop, parentTop),
            parentRight,
            min(currentBottom, parentBottom),
            'right',
        ];
    } else if (currentRight < parentLeft) {
        // element is at left
        box = [
            parentLeft,
            max(currentTop, parentTop),
            parentLeft,
            min(currentBottom, parentBottom),
            'left',
        ];
    } else {
        // element is visible (at least partially)
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

export function getPosition(box: BoxNotEmpty, realPosition: Placement): Position {
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
        case 'hidden':
        default:
            x = '50%';
            y = '50%';
            break;
    }

    return [x, y, realPosition];
}

export function getPlacement(targetBox: Rect, refBox?: Rect): Placement {
    /* The placement is the direction from the refBox to the targetBox
     */

    if (!refBox) {
        refBox = [0, 0, innerWidth, innerHeight];
    }

    /* Compare center of rects */
    const [targetX, targetY] = getRectCenter(targetBox);
    const [refX, refY] = getRectCenter(refBox);

    if (targetX === refX) {
        if (refY > targetY) {
            return 'top';
        } else {
            /* this is also the case if points are the same (default value) */
            return 'bottom';
        }
    }

    const isRight = refX > targetX;
    const deviation = (refY - targetY) / (refX - targetX);

    if (isRight) {
        if (deviation < -1) {
            return 'top';
        }
        if (deviation < 1) {
            return 'right';
        }
        return 'bottom';
    }
    if (deviation < -1) {
        return 'bottom';
    }
    if (deviation < 1) {
        return 'left';
    }
    return 'top';
}

/** Add all Parent nodes of an element into a Set.
 *
 * The element itself is also added.
 * If a parent node is already in the Set, stop the loop because we expect
 * that all its parent are already in the Set.
 */
export function addParents(el: HTMLElement, list: Set<HTMLElement>) {
    let node: HTMLElement | null = el;
    while (node) {
        if (list.has(node)) {
            break;
        }
        list.add(node);
        node = node.parentElement;
    }
}