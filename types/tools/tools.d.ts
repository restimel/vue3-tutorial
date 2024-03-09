import { AbsolutePlacement, BoxNotEmpty, Dimension, ErrorDetails, ErrorSelectorPurpose, Placement, PlacementDimension, Position, Rect, SelectorElement, SelectorElements } from '../types.d';
export declare const BOX_MARGIN = 25;
/** merge deeply an object in another one. */
export declare function merge<A extends object, B extends object>(target: A, source: B, list?: Map<any, any>): A & B;
/** Copy Set values into another Set */
export declare function shallowSetCopy<T = any>(origin: Set<T>, copy?: Set<T>): Set<T>;
declare type SyncOptions = {
    purpose: ErrorSelectorPurpose;
    timeoutError?: (details: ErrorDetails) => void;
    errorIsWarning?: boolean;
};
declare type AsyncOptions = SyncOptions & {
    timeout: number;
    refTime?: number;
};
declare type GetElementSyncOptions = SyncOptions & {
    all?: false;
    cache?: Map<string, HTMLElement>;
};
declare type GetAllElements = {
    all: true;
    cache?: Map<string, HTMLElement[]>;
};
export declare const emptyArray: any[];
declare type GetElementAsyncOptions = GetElementSyncOptions & AsyncOptions;
declare type GetElementsSyncOptions = SyncOptions & GetAllElements;
export declare type GetElementsAsyncOptions = GetElementsSyncOptions & AsyncOptions;
export declare type GetElementOptions = GetElementSyncOptions | GetElementAsyncOptions | GetElementsSyncOptions | GetElementsAsyncOptions;
/** GetElement is to retrieve 1 element from the DOM and may await this
 * element to be in the DOM (depending on options).
 * Results are stored in cache to avoid waiting again for the next similar
 * request. Cache should be reset if DOM is changed.*/
export declare function getElement(query: string, options: GetElementSyncOptions): SelectorElement;
export declare function getElement(query: string, options: GetElementAsyncOptions): Promise<SelectorElement>;
export declare function getElement(query: string, options: GetElementsSyncOptions): SelectorElements;
export declare function getElement(query: string, options: GetElementsAsyncOptions): Promise<SelectorElements>;
/** Compute the visible box of the element.
 * If the element is not visible, the box is the parent box (and the 5th index
 * indicate where is the element from the parent box) */
export declare function getBox(el: HTMLElement, memo: WeakMap<HTMLElement, BoxNotEmpty>, { isParent, getParentBox, }?: {
    isParent?: boolean | undefined;
    getParentBox?: boolean | undefined;
}): BoxNotEmpty;
/** Check if the element is visible. */
export declare function isElementVisible(box: BoxNotEmpty): boolean;
/** Coordinates of the anchor related to the target */
export declare function getAnchorPoint(box: BoxNotEmpty, realPosition: Placement): Position;
/** Replace the 'auto' value with a better placement */
export declare function getAutoPlacement(targetBox: BoxNotEmpty, elementSize: Dimension, placementSize: PlacementDimension): AbsolutePlacement;
/** Move position to keep element inside the screen */
export declare function keepInsideScreen(position: Position, elementSize: Dimension): Position;
export declare function getDirection(targetBox: Rect, refBox?: Rect): Placement;
/** Add all Parent nodes of an element into a Set.
 *
 * The element itself is also added.
 * If a parent node is already in the Set, stop the loop because we expect
 * that all its parent are already in the Set.
 */
export declare function addParents(el: HTMLElement, list: Set<HTMLElement>): void;
/** Returns a number which is a positive Integer
 */
export declare function getPositiveInteger(value: number, minValue?: number): number;
export {};
