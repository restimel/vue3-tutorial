
/** File purpose:
 * Return strings depending on dictionary
 */

import { reactive } from 'vue';
import { DEFAULT_DICTIONARY } from '../tools/defaultValues';
import { Dictionary } from '../types.d';
import error from './errors';

const dictionary: Dictionary = reactive(Object.assign({}, DEFAULT_DICTIONARY));

export default function label(
    key: keyof Dictionary,
    replacement?: Record<string, string | number>
) {
    let text: string;

    if (typeof dictionary[key] === 'undefined') {
        error(201, { label: key });
        text = key;
    } else {
        text = dictionary[key];
    }

    if (replacement) {
        text = text.replace(/%\(([^)]+)\)s/g, (_p, name) => replacement[name]?.toString() ?? '');
    }

    return text;
}

export function changeTexts(dic?: Partial<Dictionary>) {
    if (!dic) {
        return;
    }

    Object.assign(dictionary, dic);
}
