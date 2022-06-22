import { ErrorDetails, ErrorSelectorPurpose, SelectorElement } from '../types.d';
/** merge deeply an object in another one. */
export declare function merge<A extends object, B extends object>(target: A, source: B, list?: Map<any, any>): A & B;
/** Return a value which should be included between min and max */
export declare function minMaxValue(value: number, min: number, max: number): number;
declare type GetElementSyncOptions = {
    purpose: ErrorSelectorPurpose;
    timeoutError?: (details: ErrorDetails) => void;
};
declare type GetElementAsyncOptions = GetElementSyncOptions & {
    timeout: number;
    refTime?: number;
};
export declare type GetElementOptions = GetElementSyncOptions | GetElementAsyncOptions;
export declare function getElement(query: string, options: GetElementSyncOptions): SelectorElement;
export declare function getElement(query: string, options: GetElementAsyncOptions): Promise<SelectorElement>;
export {};
