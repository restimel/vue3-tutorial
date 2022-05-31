
/** File purpose:
 * Manage key binding and interaction with keyboard
 */

import { DEFAULT_BINDING } from '../tools/defaultValues';
import {
    Binding,
    BindingAction,
} from '../types';

export type KeyboardEventCallback = (action: BindingAction) => void;

const mapBinding: Map<string, BindingAction> = new Map();
let eventCallback: KeyboardEventCallback | null = null;
let isListening = false;

export function resetBindings(binding: false | Partial<Binding>) {
    mapBinding.clear();
    if (binding === false) {
        return;
    }
    for (const [action, keyBindings] of Object.entries(binding)) {
        if (Array.isArray(keyBindings)) {
            keyBindings.forEach((keyBind) => {
                mapBinding.set(keyBind, action as BindingAction);
            });
        } else {
            mapBinding.set(keyBindings, action as BindingAction);
        }
    }
}

function onKeyup(evt: KeyboardEvent) {
    const key = evt.key;
    const focusedElement = evt.target;

    if (focusedElement !== document.body) {
        /* Avoid triggering tasks when keyboard may be used by another element */
        return;
    }

    if (mapBinding.has(key) && eventCallback) {
        eventCallback(mapBinding.get(key)!);
    }
}

export function startListening(callback: KeyboardEventCallback) {
    eventCallback = callback;
    if (isListening) {
        return;
    }
    document.addEventListener('keyup', onKeyup);
    isListening = true;
}

export function stopListening() {
    if (!isListening) {
        return;
    }
    isListening = false;
    document.removeEventListener('keyup', onKeyup);
    eventCallback = null;
}
