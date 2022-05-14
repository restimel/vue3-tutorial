
/** File purpose:
 * Return strings depending on dictionary
 */

import { reactive } from 'vue';
import { DEFAULT_DICTIONARY } from '../tools/defaultValues';
import { Dictionary } from '../types.d';


const dictionary: Dictionary = reactive(Object.assign({}, DEFAULT_DICTIONARY));

export default function label(
    key: keyof Dictionary,
    replacement?: Record<string, string | number>
) {
    let text: string;

    if (typeof dictionary[key] === 'undefined') {
        console.warn('Key "%s" is not defined');
        text = key;
    } else {
        text = dictionary[key];
    }

    if (replacement) {
        text = text.replace(/%\(([^)]+)\)s/g, (_p, name) => replacement[name].toString());
    }

    return text;
}

export function changeTexts(dic?: Partial<Dictionary>) {
    if (!dic) {
        return;
    }

    Object.assign(dictionary, dic);
}
