/* {{{ Not specific to Vue3-tutorial */

export type SelectorElement = HTMLElement | null;

/* }}} */
/* {{{ Generic */

export type Dictionary = {
    finishButton: string;
    nextButton: string;
    previousButton: string;
    skipButtonTitle: string;
    skipConfirm: string;
    stepState: string;
}

export type Placement = 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center';

export type BindingAction = 'next' | 'previous' | 'skip';
export type Binding = {
    [key in BindingAction]: string | string[];
}

export type HiddenPosition = 'visible' | 'top' | 'bottom' | 'left' | 'right';

/** [x1, y1, x2, y2, hiddenPosition] */
export type BoxNotEmpty = [number, number, number, number, HiddenPosition];
export type Box = BoxNotEmpty | [];

/* {{{ Expression */

export type ExpressionValueOperation = 'is' | 'is not' | 'contains' |
    'do not contain' | 'does not contain';
export type ExpressionUnaryOperation = 'is empty' | 'is not empty' |
    'is checked' | 'is not checked' | 'is disabled' | 'is not disabled' |
    'is rendered' | 'is not rendered';

type TargetExpression = {
    target: string;
    timeout?: number;
};
type OptionalTargetExpression = Partial<TargetExpression>;

type UnaryExpression = {
    check: ExpressionUnaryOperation;
    property?: keyof HTMLElement;
};

type ValueExpression = {
    check?: ExpressionValueOperation;
    value: string;
    property?: keyof HTMLElement;
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

type SimpleEventName = 'click' | 'mousedown' | 'mouseup' | 'mouseover';
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
/* }}} */
/* {{{ Errors */

export type TutorialError = {
    code: number;
    message: string;
    details?: ErrorDetails;
};

export type TutorialEmittedError = TutorialError & {
    tutorialName: string;
    stepIndex: number;
};

export type ErrorDetails = { [key in string ]: any };

export type TutorialErrorStatus = 'log' | 'info' | 'warning' | 'error';

/** Structure describing each error code */
export type TutorialErrorCodes = {
    [code in number]: string;
};

export type ErrorSelectorPurpose = 'targets' | 'nextAction' | 'focus' | 'skipStep' | 'scroll';

/* }}} */
/* {{{ Focus */

export type FocusBehavior = 'no-focus' | 'keep' | 'main-target' | {
    target: string;
};

/* }}} */
/* {{{ scroll */

type ScrollKind = 'no-scroll' | 'scroll-to';
export type ScrollBehavior = ScrollKind | {
    target: string;
    timeout?: number;
};

/* }}} */
/* {{{ Steps */

export interface StepOptions {
    /** Position of the pop-up window related to the main target element */
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

    /** Manage how to set focus when step is changing */
    focus: boolean | FocusBehavior;

    /** Manage how to scroll when target is not in view */
    scroll: boolean | ScrollBehavior;

    /** Change texts that are used in the tutorial */
    texts: Partial<Dictionary>;

    /** Timeout (in ms) after that the target is considered as "not found" */
    timeout: number;
}

export interface StepDescription {
    /** Selector to the main element(s). */
    target?: string | string[];

    /** Title of the step. */
    title?: string;

    /** Text content of the step. */
    content: string;

    /** Specific options for this step */
    options?: Options;

    /** Check if this step should be skipped.  */
    skipStep?: Verification;

    /** Define the action to go to the next step. */
    actionNext?: ActionNext;

    /** Disable the "next" button if this condition expression returns false. */
    checkBeforeNext?: CheckBeforeNext;
}

interface StepStatus {
    /* reactive value about if the step should be skipped */
    skipped: boolean;
    /* reactive value about if the step displays the next button (and so
     * does not have special actions) */
    isActionNext: boolean;
    /* The index of the step. It is more for information */
    index: number;
}

export interface Step {
    desc: StepDescription;
    status: StepStatus;
    options: StepOptions;
    checkSkipped: () => Promise<boolean>;
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
