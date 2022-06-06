/* File Purpose:
 * Propose different common tools to help other components
 */

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
