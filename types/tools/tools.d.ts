/** merge deeply an object in another one. */
export declare function merge<A extends object, B extends object>(target: A, source: B, list?: Map<any, any>): A & B;
/** Return a value which should be included between min and max */
export declare function minMaxValue(value: number, min: number, max: number): number;
