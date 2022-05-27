
/** File purpose:
 * Handle step check
 */

import {
    ActionType,
    CheckExpression,
    StepDescription,
    ValueExpression,
} from '../types';

export function getActionType(step: StepDescription): ActionType {
    const action = step.actionNext;

    if (!action) {
        return 'next';
    }

    if (typeof action === 'string') {
        return action;
    }

    return action.action;
}

export function isStepSpecialAction(step: StepDescription): boolean;
export function isStepSpecialAction(actionType: ActionType): boolean;
export function isStepSpecialAction(arg: StepDescription | ActionType): boolean {
    const actionType = typeof arg === 'string' ? arg : getActionType(arg);

    return actionType !== 'next';
}

export function checkExpression(expr: CheckExpression, targetEl: HTMLElement): boolean {
    /* XXX: This type assignation is only to avoid telling all possible HTML cases */
    const targetElement = targetEl as HTMLInputElement;
    const checkOperation = expr.check || 'is';
    const refValue: string | undefined = (expr as ValueExpression).value;
    const value: string | undefined = targetElement.value;

    switch (checkOperation) {
        case 'is':
            return value === refValue;
        case 'is not':
            return value !== refValue;
        case 'contains':
            return !!value?.includes(refValue);
        case 'do not contain':
            return !!value && !value.includes(refValue);
        case 'is not':
            return value !== refValue;
        case 'is empty':
            return !value;
        case 'is not empty':
            return !!value;
        case 'is checked':
            return !!targetElement.checked;
        case 'is not checked':
            return !targetElement.checked;
        case 'is disabled':
            return !!targetElement.disabled;
        case 'is not disabled':
            return !targetElement.disabled;
        case 'is rendered':
            return document.body.contains(targetElement);
        case 'is not rendered':
            return !document.body.contains(targetElement);
    }

    console.log('Vue3-tutorial: Unknown operation "%s" has been encountered.', checkOperation);
}
