/** File purpose:
 * Handle step check
 */
import { ActionType, CheckExpression, StepDescription } from '../types';
export declare function getActionType(step: StepDescription): ActionType;
export declare function isStepSpecialAction(step: StepDescription): boolean;
export declare function isStepSpecialAction(actionType: ActionType): boolean;
export declare function checkExpression(expr: CheckExpression, targetEl: HTMLElement): boolean;
