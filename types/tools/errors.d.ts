/** File purpose:
 * Manage errors that can happens anywhere in the library
 */
import { ErrorDetails, MessageLog, Options, TutorialError, TutorialErrorStatus } from '../types.d';
type Callback = (err: TutorialError) => void;
export default function error(code: number, options: Options, details?: ErrorDetails): void;
export declare function errorStatus(code: number): TutorialErrorStatus;
export declare function deprecated(oldOptions: string, alternative: string): void;
export declare function debug(code: number, options: Options, details?: ErrorDetails): void;
export declare function registerError(callback: Callback, messageLog?: MessageLog): void;
export declare function unRegisterError(): void;
export {};
