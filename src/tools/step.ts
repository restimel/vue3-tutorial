
/** File purpose:
 * Handle step relative methods
 */

import {
    ActionType,
    CheckExpression,
    ErrorDetails,
    ErrorSelectorPurpose,
    Options,
    Step,
    StepDescription,
    TutorialInformation,
    ValueExpression,
} from '../types';

import error from './errors';
import { getElement } from './tools';

import {
    mergeStepOptions,
} from './defaultValues';

import {
    reactive,
    watch,
} from 'vue';

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

export function checkExpression(expr: CheckExpression, targetEl: HTMLElement, purpose: ErrorSelectorPurpose, options: Options): boolean {
    /* XXX: This type assignation is only to avoid telling all possible HTML cases */
    const targetElement = targetEl as HTMLInputElement;
    const checkOperation = expr.check || 'is';
    const prop = expr.property ?? 'value';
    const refValue: string | undefined = (expr as ValueExpression).value;
    const value = targetElement[prop];

    switch (checkOperation) {
        case 'is':
            return value == refValue;
        case 'is not':
            return value != refValue;
        case 'contains':
            return !!(value as any)?.includes?.(refValue);
        case 'do not contain':
        case 'does not contain':
            return !(value as any)?.includes?.(refValue);
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

    error(301, options, { operation: checkOperation, purpose });
    return false;
}

async function skipCurrentStep(step: Step, info: TutorialInformation, options: Options): Promise<boolean> {
    const stepDesc = step.desc;
    const skipStep = stepDesc?.skipStep;

    if (!skipStep) {
        return false;
    }

    if (typeof skipStep === 'boolean') {
        return skipStep;
    }
    if (typeof skipStep === 'function') {
        return skipStep(info.currentIndex);
    }

    const operator = skipStep.check;
    const isOperatorNotRendered = operator === 'is not rendered';
    const isOperatorRender = isOperatorNotRendered || operator === 'is rendered';
    const targetSelector = skipStep.target;
    const targetElement = await getElement(targetSelector, {
        purpose: 'skipStep',
        timeout: skipStep.timeout ?? step.options.timeout,
        timeoutError: (details: ErrorDetails) => {
            if (isOperatorRender) {
                return;
            }
            error(224, options, details);
        },
        options: options,
    });

    if (!targetElement) {
        /* If the element has not been found return false only if it is
         * not the purpose of the operator */
        if (!isOperatorNotRendered) {
            return false;
        }
        return true;
    }

    return checkExpression(skipStep, targetElement, 'skipStep', options);
}

export function getStep(stepDesc: StepDescription, tutorialOptions: Options, info: TutorialInformation): Step {
    const step: Step = reactive({
        desc: stepDesc,
        status: {
            isActionNext: true,
            skipped: null,
            index: info.currentIndex,
        },

        /* will be filled immediately */
        options: {} as any,

        async checkSkipped() {
            /* recompute the skip status */
            const skipped = await skipCurrentStep(step, info, tutorialOptions);
            step.status.skipped = skipped;
            return skipped;
        },
    });

    /* handle options */
    watch(() => [stepDesc, tutorialOptions], () => {
        step.options = mergeStepOptions(tutorialOptions, stepDesc.options || {});
    }, {immediate: true, deep: true});

    /* handle status.isActionNext */
    watch(() => stepDesc.actionNext, () => {
        const nextActionType = getActionType(stepDesc);
        step.status.isActionNext = !isStepSpecialAction(nextActionType);
    }, { immediate: true, deep: true });

    step.checkSkipped();

    return step;
}

/* test */
