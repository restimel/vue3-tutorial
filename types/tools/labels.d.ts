/** File purpose:
 * Return strings depending on dictionary
 */
import { Dictionary, Options } from '../types.d';
export default function label(options: Options, key: keyof Dictionary, replacement?: Record<string, string | number>): string;
export declare function changeTexts(dic?: Partial<Dictionary>): void;
