import { BoxNotEmpty, ErrorDetails, ErrorSelectorPurpose, Placement, Position, Rect, SelectorElement, SelectorElements } from '../types.d';
/** merge deeply an object in another one. */
export declare function merge<A extends object, B extends object>(target: A, source: B, list?: Map<any, any>): A & B;
/** Return a value which should be included between min and max */
export declare function minMaxValue(value: number, min: number, max: number): number;
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
export declare function getElement(query: string, options: GetElementSyncOptions): SelectorElement;
export declare function getElement(query: string, options: GetElementAsyncOptions): Promise<SelectorElement>;
export declare function getElement(query: string, options: GetElementsSyncOptions): SelectorElements;
export declare function getElement(query: string, options: GetElementsAsyncOptions): Promise<SelectorElements>;
export declare function getBox(el: HTMLElement, memo: WeakMap<HTMLElement, BoxNotEmpty>, { isParent, getParentBox, }?: {
    isParent?: boolean | undefined;
    getParentBox?: boolean | undefined;
}): BoxNotEmpty;
export declare function getPosition(box: BoxNotEmpty, realPosition: Placement): Position;
export declare function getPlacement(targetBox: Rect, refBox?: Rect): Placement;
export {};
