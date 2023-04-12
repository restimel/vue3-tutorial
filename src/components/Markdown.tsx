/* File Purpose:
 * Display a modal box on the screen depending on a position.
 */

import {Vue, Component, Prop, h} from 'vtyx';
import error from '../tools/errors';

type TextType = 'bold' | 'color' | 'header' | 'hr' | 'icon'
    | 'image' | 'inlineCode' | 'indentation' | 'italic'
    | 'lineFeed' | 'link' | 'multilineCode' | 'newLine' | 'olist'
    | 'quote' | 'strike' | 'sub' | 'sup' | 'table' | 'text' | 'ulist';

type Chunk = {
    type: TextType;
    value: string;
    extra?: string;
};

export interface Props {
    source: string;
}

/* {{{ Regexp to extract Markdown tags */

/** Detect any characters (non greedy) */
const anyChar = '[\\s\\S]*?';
/** Detect characters that can follow or precede bold or italic style */
const isTxtChar = (char: string) => `[^\\s${char}]`;
/** Text inside link */
const txtLink = '[^\\n\\]]*';
/** url inside link */
const urlLink = '[^\\n)]+';
/** Detect the start of a line */
const lineStart = '(?<=^|\n) *';
/** Detect the end of a line */
const lineEnd = ' *(?=\n|$)';
/** Retrieve all chars until the end of line */
const untilEnd = '[^\n]*(?:\n|$)';

const newLine = '\\n+';
const italic1 = `_${isTxtChar('_')}${anyChar}(?<=${isTxtChar('_')})_`;
const italic2 = `\\*${isTxtChar('*')}${anyChar}(?<=${isTxtChar('*')})\\*`;
const bold1 = `__${isTxtChar('_')}${anyChar}(?<=${isTxtChar('_')})__`;
const bold2 = `\\*{2}${isTxtChar('*')}${anyChar}(?<=${isTxtChar('*')})\\*{2}`;
const strike = `~{2}${isTxtChar('~')}${anyChar}(?<=${isTxtChar('~')})~{2}`;
const sub = `~${isTxtChar('~')}${anyChar}(?<=${isTxtChar('~')})~`;
const sup = `\\^${isTxtChar('^')}${anyChar}(?<=${isTxtChar('^')})\\^`;
const linkImage = `!?\\[${txtLink}\\]\\(${urlLink}\\)`;
const linkImageCapture = `!?\\[(?<txt>${txtLink})\\]\\((?<url>${urlLink})\\)`;
const header = `${lineStart}#+[^\\n]+${lineEnd}`;
const horizontalLine = `${lineStart}(?:-{3,}|_{3,})${lineEnd}`;
const inlineCode1 = '(?<!\\\\)`(?:[^`\\n]|\\\\`)+`';
const inlineCode2 = '(?<!\\\\)``[^`\\n].*``';
const multilineCode1 = `${lineStart}\`{3,}.*\\n[\\s\\S]*?\`{3,}${lineEnd}`;
const multilineCode2 = `${lineStart}~{3,}.*\\n[\\s\\S]*?~{3,}${lineEnd}`;
const quote = `(?:${lineStart}>${untilEnd})+`;
const list1 = `(?:${lineStart}\\* ${untilEnd})+`;
const list2 = `(?:${lineStart}- ${untilEnd})+`;
const list3 = `(?:${lineStart}\\d+\\. ${untilEnd})+`;
const spanClass = ':\\w[\\w ]*:';
const color = '\\{[#\\w(),]+:[^}\\n]+\\}';
const special = '@[^ @]+@';
const table = `${lineStart}.*\\|.*\\n[- \t]+\\|[- \t|]+\n(?:.*\\|${untilEnd})*`;

const mdRules = [
    newLine,
    italic1,
    italic2,
    bold1,
    bold2,
    linkImage,
    header,
    horizontalLine,
    strike,
    sub,
    sup,
    inlineCode1,
    inlineCode2,
    multilineCode1,
    multilineCode2,
    quote,
    list1,
    list2,
    list3,
    spanClass,
    color,
    special,
    table,
];
const mdSimpleRules = [
    newLine,
    linkImage,
    spanClass,
    color,
    special,
];

let mdRegExp: RegExp;
let linkImageRegExp: RegExp;

try {
    linkImageRegExp = new RegExp(linkImageCapture);
    mdRegExp = new RegExp(`(${mdRules.join('|')})`);
} catch (err) {
    /* The issue is probably due to look behind assertion.
     * So fallback to simpler rules (format will not be correct)
     */
    error(230, { error: err });
    mdRegExp = new RegExp(`(${mdSimpleRules.join('|')})`);
}

/* }}} */

function addTableChunk(text: string): Chunk {
    const rows = text.split('\n');
    if (rows.length < 2) {
        return {
            type: 'text',
            value: text,
        };
    }
    return {
        type: 'table',
        value: text,
    };
}

@Component
export default class Markdown extends Vue<Props> {
    /* {{{ props */

    @Prop({ default: () => '' })
    source: string;

    /* }}} */
    /* {{{ computed */

    get chunkedSource(): Chunk[] {
        const source = this.source;
        const splitSource = source.split(mdRegExp);
        const chunks: Chunk[] = [];

        function addText(text: string) {
            if (/^.*\|/.test(text)) {
                chunks.push(addTableChunk(text));
                return;
            }
            chunks.push({
                type: 'text',
                value: text,
            });
        }

        splitSource.forEach((chunk) => {
            const chunkTrim = chunk?.replace(/^[ \t]+|[ \t]+$/g, '');
            if (!chunkTrim) {
                /* Remove empty strings and undefined values */
                return;
            }

            switch (chunkTrim[0]) {
                case '\n':
                    if (chunk.length === 1) {
                        addText(' ');
                    } else {
                        chunks.push({
                            type: 'lineFeed',
                            value: '',
                        });
                    }
                    break;
                case '*':
                    if (chunkTrim.endsWith('*')) {
                        if (chunkTrim[1] === '*') {
                            chunks.push({
                                type: 'bold',
                                value: chunkTrim.slice(2, -2),
                            });
                        } else {
                            chunks.push({
                                type: 'italic',
                                value: chunkTrim.slice(1, -1),
                            });
                        }
                    } else if (chunkTrim[1] === ' ') {
                        chunks.push({
                            type: 'ulist',
                            value: chunk,
                        });
                    } else {
                        addText(chunk);
                    }
                    break;
                case '_':
                    if (/^_+$/.test(chunkTrim)) {
                        chunks.push({
                            type: 'hr',
                            value: '',
                        });
                    } else
                    if (chunkTrim.endsWith('_')) {
                        if (chunkTrim[1] === '_') {
                            chunks.push({
                                type: 'bold',
                                value: chunkTrim.slice(2, -2),
                            });
                        } else {
                            chunks.push({
                                type: 'italic',
                                value: chunkTrim.slice(1, -1),
                            });
                        }
                    } else {
                        addText(chunk);
                    }
                    break;
                case '-':
                    if (/^-+$/.test(chunkTrim)) {
                        chunks.push({
                            type: 'hr',
                            value: '',
                        });
                    } else if (chunkTrim[1] === ' ') {
                        chunks.push({
                            type: 'ulist',
                            value: chunk,
                        });
                    } else {
                        addText(chunk);
                    }
                    break;
                case '[': {
                    const extract = chunkTrim.match(linkImageRegExp);
                    const {txt, url} = extract?.groups ?? {};
                    if (url) {
                        chunks.push({
                            type: 'link',
                            value: url,
                            extra: txt ?? '',
                        });
                    } else {
                        addText(chunk);
                    }
                    break;
                }
                case '!': {
                    const extract = chunkTrim.match(linkImageRegExp);
                    const {txt, url} = extract?.groups ?? {};
                    if (url) {
                        chunks.push({
                            type: 'image',
                            value: url,
                            extra: txt,
                        });
                    } else {
                        addText(chunk);
                    }
                    break;
                }
                case '#': {
                    let level = 0;
                    while (chunkTrim[level] === '#') {
                        level++;
                    }
                    if (level > 0 && level < 7) {
                        const title = chunkTrim.slice(level).trimStart();
                        chunks.push({
                            type: 'header',
                            value: title,
                            extra: level.toString(10),
                        });
                    } else {
                        addText(chunk);
                    }
                    break;
                }
                case '~': {
                    if (chunkTrim[1] === '~') { // ~~
                        if (chunkTrim[2] === '~') { // ~~~
                            const rslt = chunkTrim.match(/^~+(?<type>[^\n]*)\n(?<code>[\s\S]*?)~+$/);
                            if (rslt) {
                                chunks.push({
                                    type: 'multilineCode',
                                    value: rslt.groups?.code || '',
                                    extra: rslt.groups?.type,
                                })
                            } else {
                                chunks.push({
                                    type: 'strike',
                                    value: chunkTrim.slice(2, -2),
                                });
                            }
                        } else {
                            chunks.push({
                                type: 'strike',
                                value: chunkTrim.slice(2, -2),
                            });
                        }
                    } else { // ~
                        chunks.push({
                            type: 'sub',
                            value: chunkTrim.slice(1, -1),
                        });
                    }
                    break;
                }
                case '`': {
                    if (chunkTrim.slice(0, 3) === '```') {
                        const rslt = chunkTrim.match(/^`+(?<type>[^\n]*)\n(?<code>[\s\S]*?)`+$/);
                        if (rslt) {
                            chunks.push({
                                type: 'multilineCode',
                                value: rslt.groups?.code || '',
                                extra: rslt.groups?.type,
                            })
                        } else {
                            addText(chunk);
                        }
                    } else if (chunkTrim.endsWith('`')) {
                        const value = chunkTrim.replace(/^`+|`+$/g, '');
                        chunks.push({
                            type: 'inlineCode',
                            value: value,
                        });
                    } else {
                        addText(chunk);
                    }
                    break;
                }
                case '^':
                    chunks.push({
                        type: 'sup',
                        value: chunkTrim.slice(1, -1),
                    });
                    break;
                case '>': {
                    const classNames = chunkTrim.match(/^>:([^\n:]+):/)?.[1] ?? '';
                    const nbSlice = classNames.length ? classNames.length + 3 : 1;
                    const lines = chunkTrim.slice(nbSlice).split(/\n *>/);
                    chunks.push({
                        type: 'quote',
                        value: lines.join('@\n@').trim(),
                        extra: classNames,
                    });
                    break;
                }
                case '@': {
                    const pattern = chunkTrim.match(/@([^@]+)@/)?.[1];
                    switch (pattern) {
                        case '\\n':
                        case '\n':
                            chunks.push({
                                type: 'newLine',
                                value: pattern,
                            });
                            break;
                        case '\\t':
                        case '\t':
                            chunks.push({
                                type: 'indentation',
                                value: pattern,
                            });
                            break;
                        default:
                            addText(chunk);
                    }
                    break;
                }
                case ':': {
                    const className = chunkTrim.match(/^:(\w[\w ]*):$/)?.[1];
                    if (className) {
                        chunks.push({
                            type: 'icon',
                            value: className,
                        });
                    } else {
                        addText(chunk);
                    }
                    break;
                }
                case '{': {
                    const rslt = chunkTrim.match(/^\{(?<color>[^:\n;]*):(?<text>[^}\n]+)\}$/);
                    if (rslt?.groups) {
                        chunks.push({
                            type: 'color',
                            value: rslt.groups.text,
                            /* XXX: ; is forbidden to avoid escaping style */
                            extra: rslt.groups.color,
                        });
                    } else {
                        addText(chunk);
                    }
                    break;
                }
                default:
                    if (/^\d+\. /.test(chunkTrim)) {
                        chunks.push({
                            type: 'olist',
                            value: chunk,
                        });
                    } else {
                        addText(chunk);
                    }
            }
        });

        return chunks;
    }

    /* }}} */
    /* {{{ methods */

    private renderChunks() {
        return this.chunkedSource.map((chunk) => {
            switch (chunk.type) {
                case 'text':
                    return (
                        chunk.value
                    );
                case 'bold':
                    return (
                        <span class="vue3-tutorial-md-bold">
                            <Markdown source={chunk.value} />
                        </span>
                    );
                case 'header': {
                    const level = chunk.extra;
                    return h('h' + level, {
                        class: `vue3-tutorial-md-h${level}`
                    }, [chunk.value]);
                    break;
                }
                case 'hr': {
                    return (
                        <hr class="vue3-tutorial-md-hr" />
                    );
                }
                case 'image':
                    return (
                        <img class="vue3-tutorial-md-image" src={chunk.value} alt={chunk.extra} />
                    );
                case 'italic':
                    return (
                        <span class="vue3-tutorial-md-italic">
                            <Markdown source={chunk.value} />
                        </span>
                    );
                case 'lineFeed':
                        return ([<br />, <br />]);
                case 'newLine':
                        return (<br />);
                case 'link':
                    return (
                        <a class="vue3-tutorial-md-link" href={chunk.value} target="_blank">
                            <Markdown source={chunk.extra!} />
                        </a>
                    );
                case 'strike':
                    return (
                        <span class="vue3-tutorial-md-strike">
                            <Markdown source={chunk.value} />
                        </span>
                    );
                case 'inlineCode':
                    return (
                        <code class="vue3-tutorial-md-inline-code">
                            {chunk.value}
                        </code>
                    );
                case 'multilineCode':
                    return (
                        <pre class="vue3-tutorial-md-multiline-code">
                            <code
                                class={{
                                    ['language-' + chunk.extra]: !!chunk.extra,
                                }}
                                data-language={chunk.extra}
                            >
                                {chunk.value}
                            </code>
                        </pre>
                    );
                case 'sup':
                    return (
                        <sup class="vue3-tutorial-md-sup">
                            <Markdown source={chunk.value} />
                        </sup>
                    );
                case 'sub':
                    return (
                        <sub class="vue3-tutorial-md-sub">
                            <Markdown source={chunk.value} />
                        </sub>
                    );
                case 'quote':
                    return (
                        <blockquote class={['vue3-tutorial-md-quote', chunk.extra ?? '' ]}>
                            <Markdown source={chunk.value} />
                        </blockquote>
                    );
                case 'olist': {
                    const search = /^( *)\d+\. /.exec(chunk.value);
                    if (!search) {
                        //invalid markdown
                        return;
                    }
                    const [pattern, indent] = search;
                    const items = chunk.value.slice(pattern.length).split(new RegExp(`\n${indent}\\d+\\. `));
                    return (
                        <ol class="vue3-tutorial-md-ol">
                            {items.map((item) => {
                                if (item) {
                                    return (
                                        <li class="vue3-tutorial-md-li">
                                            <Markdown source={item} />
                                        </li>
                                    );
                                }
                                return;
                            })}
                        </ol>
                    );
                }
                case 'ulist': {
                    const itemMarker = /^ *[*-] /.exec(chunk.value)?.[0];
                    if (!itemMarker) {
                        //invalid markdown
                        return;
                    }
                    const items = chunk.value.slice(itemMarker.length).split('\n' + itemMarker);
                    return (
                        <ul class="vue3-tutorial-md-ul">
                            {items.map((item) => {
                                if (item) {
                                    return (
                                        <li class="vue3-tutorial-md-li">
                                            <Markdown source={item} />
                                        </li>
                                    );
                                }
                                return;
                            })}
                        </ul>
                    );
                }
                case 'indentation': {
                    return (<span class="vue3-tutorial-md-indent"></span>)
                }
                case 'icon': {
                    return (
                        <span class={chunk.value}></span>
                    );
                }
                case 'color': {
                    return (
                        <span
                            style={`--color: ${chunk.extra?.replaceAll(';', '')}`}
                            class="vue3-tutorial-md-color"
                        >
                            <Markdown source={chunk.value} />
                        </span>
                    );
                }
                case 'table': {
                    const rows = chunk.value.split('\n');
                    const nbColumns = rows[1].split('|').length;
                    const headers = rows[0].split('|').slice(0, nbColumns);
                    const data = rows.slice(2).map((row) => {
                        return row.split('|').slice(0, nbColumns);
                    });
                    return (
                        <table class="vue3-tutorial-md-table">
                            <thead>
                                <tr class="vue3-tutorial-md-tr">
                                    {headers.map((header) => (
                                        <th class="vue3-tutorial-md-th">
                                            <Markdown source={header} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row) => (
                                    <tr class="vue3-tutorial-md-tr">
                                        {row.map((item) => (
                                            <td class="vue3-tutorial-md-td">
                                                <Markdown source={item} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    );
                }
            }
        });
    }

    /* }}} */

    public render() {
        return (
            <span class="vue3-tutorial-md-chunk">
                {this.renderChunks()}
            </span>
        );
    }
}
