/* {{{ Generic */

export type Dictionary = {
    finishButton: string;
    nextButton: string;
    previousButton: string;
    skipButtonTitle: string;
    skipConfirm: string;
    stepState: string;
}

/* {{{ Action Next */

type SimpleEventName = 'click' | 'mousedown' | 'mouseup' | 'hover';
type ValueEventName = 'input' | 'change';
type EventName = SimpleEventName | ValueEventName;

interface BaseAction {
    target: string;
}
export interface SimpleAction extends BaseAction {
    action: SimpleEventName;
}
export interface ValueAction extends BaseAction {
    action: ValueEventName;
    value: string;
}
export type Action = SimpleAction | ValueAction;

export type ActionNext = 'none' | SimpleEventName | Action;

/* }}} */
/* {{{ Verification */

export type VerificationValueOperation = 'is' | 'is not';
export type VerificationUnaryOperation = 'is empty' | 'is not empty' |
    'is checked' | 'is not checked' | 'is disabled' | 'is not disabled' |
    'is rendered' | 'is not rendered';

interface VerificationBaseDescription {
    target: string;
}

interface VerificationValueDescription extends VerificationBaseDescription {
    check?: VerificationValueDescription;
    value: string;
}
interface VerificationUnaryDescription extends VerificationBaseDescription {
    check: VerificationUnaryDescription;
}
export type VerificationDescription = VerificationValueDescription | VerificationUnaryDescription;

export type Verification = boolean | ((stepIdx: number) => boolean | Promise<boolean>) | VerificationDescription;

export interface CheckBeforeNextDescription extends VerificationUnaryDescription {
    errorMessage: string;
}

export type CheckBeforeNext = false | ((stepIdx: number) => string | Promise<string>) | CheckBeforeNextDescription;

/* }}} */

export type Placement = 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center';

export type BindingAction = 'next' | 'previous' | 'skip';
export type Binding = {
    [key in BindingAction]: string | string[];
}

/* }}} */
/* {{{ Steps */

export interface StepOptions {
    /** Position of the pop-up window related to the target element */
    position: Placement;

    /** If true the targets are highlighted */
    highlight: boolean;

    /** Class added to the targeted elements */
    classForTargets: string;

    /** If true, the arrow is animate */
    arrowAnimation: boolean;

    /** If true a mask is added over the page except over targets */
    mask: boolean;

    /** Margin (in px) between target elements and mask */
    maskMargin: number;

    /** Keyboard bindings for actions */
    bindings: false | Partial<Binding>;

    /** Timeout (in ms) after that the target is considered as "not found" */
    timeout: number;

    /** Change texts that are used in the tutorial */
    texts: Partial<Dictionary>;
}

export interface StepDescription {
    target?: string | string[];
    title?: string;
    content: string;
    options?: Options;
    skipStep?: Verification;
    actionNext?: ActionNext;
    checkBeforeNext?: CheckBeforeNext;
}

export type Options = Partial<StepOptions>;

/* }}} */
/* {{{ Tutorial */

export interface TutorialInformation {
    currentIndex: number;
    nbTotalSteps: number;
}

export interface Tutorial {
    name?: string;
    steps: StepDescription[];
    options?: Options;
}

/* }}} */
