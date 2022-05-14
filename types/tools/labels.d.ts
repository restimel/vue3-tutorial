/** File purpose:
 * Return strings depending on dictionary
 */
import { Dictionary } from '../types.d';
export default function label(key: keyof Dictionary, replacement?: Record<string, string | number>): string;
export declare function changeTexts(dic?: Partial<Dictionary>): void;
