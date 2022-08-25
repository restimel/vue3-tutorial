/* File Purpose:
 * Handle geometry manipulations (shape transformation and intersection)
 */

import {
    Rect,
} from '../types.d';


function getRectIntersection(rect1: Rect, rect2: Rect): Rect | null {
    const [x11, y11, x21, y21] = rect1;
    const [x12, y12, x22, y22] = rect2;

    const x1 = Math.max(x11, x12);
    const x2 = Math.min(x21, x22);
    const y1 = Math.max(y11, y12);
    const y2 = Math.min(y21, y22);

    if (x1 < x2 && y1 < y2) {
        return [x1, y1, x2, y2];
    }

    return null;
}

function getRectOverlap(rectRef: Rect, rects: Rect[]): Rect[] {
    return rects.reduce((overlaps, rect) => {
        const rectOverlap = getRectIntersection(rectRef, rect);
        if (rectOverlap) {
            overlaps.push(rectOverlap);
        }
        return overlaps;
    }, [] as Rect[]);
}

export function getRectOverlaps(rects: Rect[]): Rect[] {
    const length = rects.length;
    if (length === 0) {
        return [];
    }
    const allRects: Rect[] = [rects[0]];
    const overlaps: Rect[] = [];

    for (let refIdx = 1; refIdx < length; refIdx++) {
        const rectRef = rects[refIdx];
        const rectOverlaps = getRectOverlap(rectRef, allRects);
        allRects.push(rectRef, ...rectOverlaps);
        overlaps.push(...rectOverlaps);
    }

    return overlaps;
}
