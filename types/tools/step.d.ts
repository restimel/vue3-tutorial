/** File purpose:
 * Handle step relative methods
 */
import { ActionType, CheckExpression, ErrorSelectorPurpose, Options, Step, StepDescription, TutorialInformation } from '../types';
export declare function getActionType(step: StepDescription): ActionType;
export declare function isStepSpecialAction(step: StepDescription): boolean;
export declare function isStepSpecialAction(actionType: ActionType): boolean;
export declare function checkExpression(expr: CheckExpression, targetEl: HTMLElement, purpose: ErrorSelectorPurpose, options: Options): boolean;
export declare function getStep(stepDesc: StepDescription, tutorialOptions: Options, info: TutorialInformation): Step;
