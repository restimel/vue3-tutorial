/** File purpose:
 * Manage key binding and interaction with keyboard
 */
import { Binding, BindingAction } from '../types';
export declare type KeyboardEventCallback = (action: BindingAction) => void;
export declare function resetBindings(binding: false | Partial<Binding>): void;
export declare function startListening(callback: KeyboardEventCallback): void;
export declare function stopListening(): void;
