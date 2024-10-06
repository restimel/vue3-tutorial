
/** File purpose:
 * Manage errors that can happens anywhere in the library
 */

import {
    ErrorDetails,
    MessageLog,
    Options,
    TutorialError,
    TutorialErrorCodes,
    TutorialErrorStatus,
} from '../types.d';

type Callback = (err: TutorialError) => void;

let errorCallback: Callback | null = null;

const errorMap: TutorialErrorCodes = {
    /* 0xx : debug */
    0: 'Tutorial mounted',
    1: 'Tutorial unmounted',
    2: 'Tutorial started',
    3: 'Tutorial stopped',

    20: 'Step mounted',
    21: 'Step unmounted',
    22: 'Step changed',
    24: 'Fetch elements',
    25: 'Target elements change',
    26: 'DOM elements targeted',
    27: 'No elements found',
    28: 'Move to step',

    /* 1xx : info */
    /* 2xx : warning */
    200: 'Unknown error code',
    201: 'Unknown label',
    202: 'Not able to check if step can be skipped',
    203: 'Tutorial has no active steps',
    204: 'There are no previous step',
    224: 'Timeout: some targets have not been found in the allowing time',
    225: 'Timeout: some target elements are still hidden in the allowing time',
    230: 'RegExp for Markdown is not supported by this browser',

    /* 3xx : error */
    300: 'Selector is not valid',
    301: 'Unknown operation',
    302: 'Step not found',
    303: 'Tutorial is not defined',
    305: 'Wrong type',
    324: 'Timeout: some targets have not been found in the allowing time',
    325: 'Timeout: some target elements are still hidden in the allowing time',
};

/* type is MessageLog without boolean */
let MESSAGE_LOG: string | null = 'vue3-tutorial [%d]: %s';

export default function error(code: number, options: Options, details?: ErrorDetails) {
    if (!canTrigger(code, options)) {
        return;
    }

    const message = errorMap[code];

    if (!message) {
        error(200, options, {code: code, details: details});
    }

    const messageLog = options.logs?.messageLog;
    let logMessage: string;

    if (messageLog === false || messageLog === null || MESSAGE_LOG === null) {
        logMessage = '';
    } else {
        logMessage = typeof messageLog === 'string' ? messageLog : MESSAGE_LOG;
    }

    if (logMessage) {
        switch (errorStatus(code)) {
            case 'log':
                console.log(logMessage, code, message, details);
                break;
            case 'info':
                console.log(logMessage, code, message, details);
                break;
            case 'warning':
                console.warn(logMessage, code, message, details);
                break;
            case 'error':
                console.error(logMessage, code, message, details);
                break;
        }
    }

    if (errorCallback) {
        errorCallback({
            code,
            message,
            details,
        });
    }
}

export function errorStatus(code: number): TutorialErrorStatus {
    if (code < 100) {
        return 'log';
    }
    if (code < 200) {
        return 'info';
    }
    if (code < 300) {
        return 'warning';
    }
    return 'error';
}

function minCodeLevel(status?: TutorialErrorStatus | 'none') {
    switch (status) {
        case 'log': return 0;
        case 'debug': return 0;
        case 'info': return 100;
        case 'warning': return 200;
        case 'error': return 300;
        case 'none': return 1000;
    }

    return 200;
}

function canTrigger(code: number, options: Options): boolean {
    const {logLevel, allowCodes = []} = options.logs ?? {};

    if (code >= minCodeLevel(logLevel)) {
        return true;
    }

    if (allowCodes.includes(code)) {
        return true;
    }

    /* Deprecated option: debug */
    const debugLog = options.debug;

    if (!debugLog) {
        return false;
    }

    deprecated('debug', 'Please use `logs.logLevel` or `logs.allowCodes` instead.');

    if (debugLog === true || debugLog.includes(code)) {
        return true;
    }

    return false;
}

const deprecatedLogs = new Map<string, number>();

export function deprecated(oldOptions: string, alternative: string) {
    const logId = `${oldOptions}|${alternative}`;

    const oldTimer = deprecatedLogs.get(logId);
    if (oldTimer) {
        clearTimeout(oldTimer);
    }

    const newTimer = setTimeout(() => {
        deprecatedLogs.delete(logId);

        console.warn(`vue3-tutorial: Deprecated uses of \`${oldOptions}\` option.
${alternative}
This code may not work in a future version.`);
    }, 200);

    deprecatedLogs.set(logId, newTimer);
}

export function debug(code: number, options: Options, details: ErrorDetails = {}) {
    if (canTrigger(code, options)) {
        const dbgDetails = {
            options: options,
            ...details,
        };
        error(code, options, dbgDetails);
    }
}

export function registerError(callback: Callback, messageLog?: MessageLog) {
    errorCallback = callback;


    if (messageLog !== undefined) {
        deprecated('messageLog', 'Please use `logs.messageLog` instead.');

        if (messageLog === false) {
            MESSAGE_LOG = null;
        } else if (messageLog === true) {
            MESSAGE_LOG = 'vue3-tutorial [%d]: %s';
        } else {
            MESSAGE_LOG = messageLog;
        }
    }
}
export function unRegisterError() {
    errorCallback = null;
}
