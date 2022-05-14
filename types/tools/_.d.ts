/** File purpose:
 * Return strings depending on dictionary
 */
import { Dictionary } from '../types.d';
export default function label(key: keyof Dictionary): string;
export declare function changeText(dic: Partial<Dictionary>): void;
