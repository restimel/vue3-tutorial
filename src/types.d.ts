/* {{{ Generic */

export type Dictionary = {
    finishButton: string;
    nextButton: string;
    previousButton: string;
    skipButtonTitle: string;
    skipConfirm: string;
    stepState: string;
}

/* {{{ Expression */

export type ExpressionValueOperation = 'is' | 'is not' | 'contains' | 'do not contain';
export type ExpressionUnaryOperation = 'is empty' | 'is not empty' |
    'is checked' | 'is not checked' | 'is disabled' | 'is not disabled' |
    'is rendered' | 'is not rendered';

type TargetExpression = {
    target: string;
};
type OptionalTargetExpression = Partial<TargetExpression>;

type UnaryExpression = {
    check: ExpressionUnaryOperation;
};

type ValueExpression = {
    check?: ExpressionValueOperation;
    value: string;
};

export type CheckExpression = UnaryExpression | ValueExpression;

/* }}} */
/* {{{ Verification */

type VerificationValueDescription = TargetExpression & ValueExpression;
type VerificationUnaryDescription = TargetExpression & UnaryExpression;

export type VerificationDescription = VerificationValueDescription | VerificationUnaryDescription;

export type Verification = boolean | ((stepIdx: number) => boolean | Promise<boolean>) | VerificationDescription;

export interface CheckBeforeNextDescription extends VerificationUnaryDescription {
    errorMessage: string;
}

export type CheckBeforeNext = false | ((stepIdx: number) => string | Promise<string>) | CheckBeforeNextDescription;

/* }}} */
/* {{{ Action Next */

type SimpleEventName = 'click' | 'mousedown' | 'mouseup' | 'hover';
type ValueEventName = 'input' | 'change';
type EventName = SimpleEventName | ValueEventName;

type SimpleAction = OptionalTargetExpression & {
    action: SimpleEventName;
};
type UnaryAction = OptionalTargetExpression & {
    action: ValueEventName;
} & UnaryExpression;
type ValueAction = OptionalTargetExpression & {
    action: ValueEventName;
} & ValueExpression;


export type Action = SimpleAction | UnaryAction | ValueAction;

export type EventAction = UnaryAction | ValueAction;
export type ActionType = 'next' | SimpleEventName | ValueEventName;

export type ActionNext = '' | 'next' | SimpleEventName | Action;

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
    previousStepIsSpecial: boolean;
}

export interface Tutorial {
    name?: string;
    steps: StepDescription[];
    options?: Options;
}

/* }}} */
