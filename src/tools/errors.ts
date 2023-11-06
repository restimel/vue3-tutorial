
/** File purpose:
 * Manage errors that can happens anywhere in the library
 */

import {
    ErrorDetails,
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

const MESSAGE_LOG = 'vue3-tutorial [%d]: %s';

export default function error(code: number, details?: ErrorDetails) {
    const message = errorMap[code];

    if (!message) {
        error(200, {code: code, details: details});
    }

    switch (errorStatus(code)) {
        case 'log':
            console.log(MESSAGE_LOG, code, message, details);
            break;
        case 'info':
            console.log(MESSAGE_LOG, code, message, details);
            break;
        case 'warning':
            console.warn(MESSAGE_LOG, code, message, details);
            break;
        case 'error':
            console.error(MESSAGE_LOG, code, message, details);
            break;
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

export function debug(code: number, options: Options, details: ErrorDetails = {}) {
    const debug = options.debug;

    if (!debug) {
        return;
    }

    if (debug === true || debug.includes(code)) {
        const dbgDetails = {
            options: options,
            ...details,
        };
        error(code, dbgDetails);
    }
}

export function registerError(callback: Callback) {
    errorCallback = callback;
}
export function unRegisterError() {
    errorCallback = null;
}
