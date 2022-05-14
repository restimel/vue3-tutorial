/** File purpose:
 * It contains all default values and function to merge them.
 */
import { Dictionary, Options, StepOptions } from './types.d';
export declare const DEFAULT_DICTIONARY: Dictionary;
export declare const DEFAULT_STEP_OPTIONS: StepOptions;
export declare function mergeStepOptions(...options: Options[]): StepOptions;
