/** File purpose:
 * Manage errors that can happens anywhere in the library
 */
import { ErrorDetails, TutorialError, TutorialErrorStatus } from '../types.d';
declare type Callback = (err: TutorialError) => void;
export default function error(code: number, details?: ErrorDetails): void;
export declare function errorStatus(code: number): TutorialErrorStatus;
export declare function registerError(callback: Callback): void;
export declare function unRegisterError(): void;
export {};
