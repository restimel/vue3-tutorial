import { Prop, Component, Vue, h, Watch, Emits } from 'vtyx';
import { reactive, watch } from 'vue';

/** File purpose:
 * Manage errors that can happens anywhere in the library
 */
let errorCallback = null;
const errorMap = {
    /* 0xx : debug */
    0: 'Tutorial mounted',
    1: 'Tutorial unmounted',
    2: 'Tutorial started',
    3: 'Tutorial stopped',
    20: 'Step mounted',
    21: 'Step unmounted',
    22: 'Step changed',
    25: 'Target elements change',
    26: 'DOM elements targeted',
    27: 'No elements found',
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
    324: 'Timeout: some targets have not been found in the allowing time',
    325: 'Timeout: some target elements are still hidden in the allowing time',
};
const MESSAGE_LOG = 'vue3-tutorial [%d]: %s';
function error(code, details) {
    const message = errorMap[code];
    if (!message) {
        error(200, { code: code, details: details });
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
function errorStatus(code) {
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
function debug(code, options, details = {}) {
    const debug = options.debug;
    if (!debug) {
        return;
    }
    if (debug === true || debug.includes(code)) {
        const dbgDetails = Object.assign({ options: options }, details);
        error(code, dbgDetails);
    }
}
function registerError(callback) {
    errorCallback = callback;
}
function unRegisterError() {
    errorCallback = null;
}

/* File Purpose:
 * Display a modal box on the screen depending on a position.
 */
var __decorate$5 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Markdown_1;
/* {{{ Regexp to extract Markdown tags */
/** Detect any characters (non greedy) */
const anyChar = '[\\s\\S]*?';
/** Detect characters that can follow or precede bold or italic style */
const isTxtChar = (char) => `[^\\s${char}]`;
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
let mdRegExp;
let linkImageRegExp;
try {
    linkImageRegExp = new RegExp(linkImageCapture);
    mdRegExp = new RegExp(`(${mdRules.join('|')})`);
}
catch (err) {
    /* The issue is probably due to look behind assertion.
     * So fallback to simpler rules (format will not be correct)
     */
    error(230, { error: err });
    mdRegExp = new RegExp(`(${mdSimpleRules.join('|')})`);
}
/* }}} */
function addTableChunk(text) {
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
let Markdown = Markdown_1 = class Markdown extends Vue {
    /* }}} */
    /* {{{ computed */
    get chunkedSource() {
        const source = this.source;
        const splitSource = source.split(mdRegExp);
        const chunks = [];
        function addText(text) {
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const chunkTrim = chunk === null || chunk === void 0 ? void 0 : chunk.replace(/^[ \t]+|[ \t]+$/g, '');
            if (!chunkTrim) {
                /* Remove empty strings and undefined values */
                return;
            }
            switch (chunkTrim[0]) {
                case '\n':
                    if (chunk.length === 1) {
                        addText(' ');
                    }
                    else {
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
                        }
                        else {
                            chunks.push({
                                type: 'italic',
                                value: chunkTrim.slice(1, -1),
                            });
                        }
                    }
                    else if (chunkTrim[1] === ' ') {
                        chunks.push({
                            type: 'ulist',
                            value: chunk,
                        });
                    }
                    else {
                        addText(chunk);
                    }
                    break;
                case '_':
                    if (/^_+$/.test(chunkTrim)) {
                        chunks.push({
                            type: 'hr',
                            value: '',
                        });
                    }
                    else if (chunkTrim.endsWith('_')) {
                        if (chunkTrim[1] === '_') {
                            chunks.push({
                                type: 'bold',
                                value: chunkTrim.slice(2, -2),
                            });
                        }
                        else {
                            chunks.push({
                                type: 'italic',
                                value: chunkTrim.slice(1, -1),
                            });
                        }
                    }
                    else {
                        addText(chunk);
                    }
                    break;
                case '-':
                    if (/^-+$/.test(chunkTrim)) {
                        chunks.push({
                            type: 'hr',
                            value: '',
                        });
                    }
                    else if (chunkTrim[1] === ' ') {
                        chunks.push({
                            type: 'ulist',
                            value: chunk,
                        });
                    }
                    else {
                        addText(chunk);
                    }
                    break;
                case '[': {
                    const extract = chunkTrim.match(linkImageRegExp);
                    const { txt, url } = (_a = extract === null || extract === void 0 ? void 0 : extract.groups) !== null && _a !== void 0 ? _a : {};
                    if (url) {
                        chunks.push({
                            type: 'link',
                            value: url,
                            extra: txt !== null && txt !== void 0 ? txt : '',
                        });
                    }
                    else {
                        addText(chunk);
                    }
                    break;
                }
                case '!': {
                    const extract = chunkTrim.match(linkImageRegExp);
                    const { txt, url } = (_b = extract === null || extract === void 0 ? void 0 : extract.groups) !== null && _b !== void 0 ? _b : {};
                    if (url) {
                        chunks.push({
                            type: 'image',
                            value: url,
                            extra: txt,
                        });
                    }
                    else {
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
                    }
                    else {
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
                                    value: ((_c = rslt.groups) === null || _c === void 0 ? void 0 : _c.code) || '',
                                    extra: (_d = rslt.groups) === null || _d === void 0 ? void 0 : _d.type,
                                });
                            }
                            else {
                                chunks.push({
                                    type: 'strike',
                                    value: chunkTrim.slice(2, -2),
                                });
                            }
                        }
                        else {
                            chunks.push({
                                type: 'strike',
                                value: chunkTrim.slice(2, -2),
                            });
                        }
                    }
                    else { // ~
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
                                value: ((_e = rslt.groups) === null || _e === void 0 ? void 0 : _e.code) || '',
                                extra: (_f = rslt.groups) === null || _f === void 0 ? void 0 : _f.type,
                            });
                        }
                        else {
                            addText(chunk);
                        }
                    }
                    else if (chunkTrim.endsWith('`')) {
                        const value = chunkTrim.replace(/^`+|`+$/g, '');
                        chunks.push({
                            type: 'inlineCode',
                            value: value,
                        });
                    }
                    else {
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
                    const classNames = (_h = (_g = chunkTrim.match(/^>:([^\n:]+):/)) === null || _g === void 0 ? void 0 : _g[1]) !== null && _h !== void 0 ? _h : '';
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
                    const pattern = (_j = chunkTrim.match(/@([^@]+)@/)) === null || _j === void 0 ? void 0 : _j[1];
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
                    const className = (_k = chunkTrim.match(/^:(\w[\w ]*):$/)) === null || _k === void 0 ? void 0 : _k[1];
                    if (className) {
                        chunks.push({
                            type: 'icon',
                            value: className,
                        });
                    }
                    else {
                        addText(chunk);
                    }
                    break;
                }
                case '{': {
                    const rslt = chunkTrim.match(/^\{(?<color>[^:\n;]*):(?<text>[^}\n]+)\}$/);
                    if (rslt === null || rslt === void 0 ? void 0 : rslt.groups) {
                        chunks.push({
                            type: 'color',
                            value: rslt.groups.text,
                            /* XXX: ; is forbidden to avoid escaping style */
                            extra: rslt.groups.color,
                        });
                    }
                    else {
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
                    }
                    else {
                        addText(chunk);
                    }
            }
        });
        return chunks;
    }
    /* }}} */
    /* {{{ methods */
    renderChunks() {
        return this.chunkedSource.map((chunk) => {
            var _a, _b, _c;
            switch (chunk.type) {
                case 'text':
                    return (chunk.value);
                case 'bold':
                    return (h("span", { class: "vue3-tutorial-md-bold" },
                        h(Markdown_1, { source: chunk.value })));
                case 'header': {
                    const level = chunk.extra;
                    return h('h' + level, {
                        class: `vue3-tutorial-md-h${level}`
                    }, [chunk.value]);
                }
                case 'hr': {
                    return (h("hr", { class: "vue3-tutorial-md-hr" }));
                }
                case 'image':
                    return (h("img", { class: "vue3-tutorial-md-image", src: chunk.value, alt: chunk.extra }));
                case 'italic':
                    return (h("span", { class: "vue3-tutorial-md-italic" },
                        h(Markdown_1, { source: chunk.value })));
                case 'lineFeed':
                    return ([h("br", null), h("br", null)]);
                case 'newLine':
                    return (h("br", null));
                case 'link':
                    return (h("a", { class: "vue3-tutorial-md-link", href: chunk.value, target: "_blank" },
                        h(Markdown_1, { source: chunk.extra })));
                case 'strike':
                    return (h("span", { class: "vue3-tutorial-md-strike" },
                        h(Markdown_1, { source: chunk.value })));
                case 'inlineCode':
                    return (h("code", { class: "vue3-tutorial-md-inline-code" }, chunk.value));
                case 'multilineCode':
                    return (h("pre", { class: "vue3-tutorial-md-multiline-code" },
                        h("code", { class: {
                                ['language-' + chunk.extra]: !!chunk.extra,
                            }, "data-language": chunk.extra }, chunk.value)));
                case 'sup':
                    return (h("sup", { class: "vue3-tutorial-md-sup" },
                        h(Markdown_1, { source: chunk.value })));
                case 'sub':
                    return (h("sub", { class: "vue3-tutorial-md-sub" },
                        h(Markdown_1, { source: chunk.value })));
                case 'quote':
                    return (h("blockquote", { class: ['vue3-tutorial-md-quote', (_a = chunk.extra) !== null && _a !== void 0 ? _a : ''] },
                        h(Markdown_1, { source: chunk.value })));
                case 'olist': {
                    const search = /^( *)\d+\. /.exec(chunk.value);
                    if (!search) {
                        //invalid markdown
                        return;
                    }
                    const [pattern, indent] = search;
                    const items = chunk.value.slice(pattern.length).split(new RegExp(`\n${indent}\\d+\\. `));
                    return (h("ol", { class: "vue3-tutorial-md-ol" }, items.map((item) => {
                        if (item) {
                            return (h("li", { class: "vue3-tutorial-md-li" },
                                h(Markdown_1, { source: item })));
                        }
                        return;
                    })));
                }
                case 'ulist': {
                    const itemMarker = (_b = /^ *[*-] /.exec(chunk.value)) === null || _b === void 0 ? void 0 : _b[0];
                    if (!itemMarker) {
                        //invalid markdown
                        return;
                    }
                    const items = chunk.value.slice(itemMarker.length).split('\n' + itemMarker);
                    return (h("ul", { class: "vue3-tutorial-md-ul" }, items.map((item) => {
                        if (item) {
                            return (h("li", { class: "vue3-tutorial-md-li" },
                                h(Markdown_1, { source: item })));
                        }
                        return;
                    })));
                }
                case 'indentation': {
                    return (h("span", { class: "vue3-tutorial-md-indent" }));
                }
                case 'icon': {
                    return (h("span", { class: chunk.value }));
                }
                case 'color': {
                    return (h("span", { style: `--color: ${(_c = chunk.extra) === null || _c === void 0 ? void 0 : _c.replaceAll(';', '')}`, class: "vue3-tutorial-md-color" },
                        h(Markdown_1, { source: chunk.value })));
                }
                case 'table': {
                    const rows = chunk.value.split('\n');
                    const nbColumns = rows[1].split('|').length;
                    const headers = rows[0].split('|').slice(0, nbColumns);
                    const data = rows.slice(2).map((row) => {
                        return row.split('|').slice(0, nbColumns);
                    });
                    return (h("table", { class: "vue3-tutorial-md-table" },
                        h("thead", null,
                            h("tr", { class: "vue3-tutorial-md-tr" }, headers.map((header) => (h("th", { class: "vue3-tutorial-md-th" },
                                h(Markdown_1, { source: header })))))),
                        h("tbody", null, data.map((row) => (h("tr", { class: "vue3-tutorial-md-tr" }, row.map((item) => (h("td", { class: "vue3-tutorial-md-td" },
                            h(Markdown_1, { source: item }))))))))));
                }
            }
        });
    }
    /* }}} */
    render() {
        return (h("span", { class: "vue3-tutorial-md-chunk" }, this.renderChunks()));
    }
};
__decorate$5([
    Prop({ default: () => '' })
], Markdown.prototype, "source", void 0);
Markdown = Markdown_1 = __decorate$5([
    Component
], Markdown);
var Markdown$1 = Markdown;

/* File Purpose:
 * It displays an SVG content
 */
var __decorate$4 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let SVG$1 = class SVG extends Vue {
    /* }}} */
    /* {{{ data */
    /* }}} */
    /* {{{ computed */
    /* }}} */
    /* {{{ methods */
    /* }}} */
    /* {{{ watch */
    /* }}} */
    /* {{{ Life cycle */
    /* }}} */
    render() {
        return h('svg', {
            style: this.style,
            height: this.height,
            width: this.width,
            viewbox: this.viewBox,
        }, [
            h('path', {
                d: this.path,
            }),
        ]);
    }
};
__decorate$4([
    Prop()
], SVG$1.prototype, "path", void 0);
__decorate$4([
    Prop({ default: 32 })
], SVG$1.prototype, "width", void 0);
__decorate$4([
    Prop({ default: 32 })
], SVG$1.prototype, "height", void 0);
__decorate$4([
    Prop({ default: '0 0 100 100' })
], SVG$1.prototype, "viewBox", void 0);
__decorate$4([
    Prop()
], SVG$1.prototype, "style", void 0);
SVG$1 = __decorate$4([
    Component
], SVG$1);
var SVG$2 = SVG$1;

/* File Purpose:
 * Handle geometry manipulations (shape transformation and intersection)
 */
function getRectIntersection(rect1, rect2) {
    const [x11, y11, x21, y21] = rect1;
    const [x12, y12, x22, y22] = rect2;
    const x1 = Math.max(x11, x12);
    const x2 = Math.min(x21, x22);
    const y1 = Math.max(y11, y12);
    const y2 = Math.min(y21, y22);
    if (x1 < x2 && y1 < y2) {
        return [x1, y1, x2, y2];
    }
    return null;
}
function getRectOverlap(rectRef, rects) {
    return rects.reduce((overlaps, rect) => {
        const rectOverlap = getRectIntersection(rectRef, rect);
        if (rectOverlap) {
            overlaps.push(rectOverlap);
        }
        return overlaps;
    }, []);
}
function getRectOverlaps(rects) {
    const length = rects.length;
    if (length === 0) {
        return [];
    }
    const allRects = [rects[0]];
    const overlaps = [];
    for (let refIdx = 1; refIdx < length; refIdx++) {
        const rectRef = rects[refIdx];
        const rectOverlaps = getRectOverlap(rectRef, allRects);
        allRects.push(rectRef, ...rectOverlaps);
        overlaps.push(...rectOverlaps);
    }
    return overlaps;
}
function getRectCenter(rect) {
    return [
        (rect[0] + rect[2]) / 2,
        (rect[1] + rect[3]) / 2,
    ];
}

/* File Purpose:
 * It displays an SVG content
 */
var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let SVG = class SVG extends Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.forceUpdate = 0;
    }
    /* }}} */
    /* {{{ computed */
    get width() {
        const width = self.innerWidth;
        this.forceUpdate; /* for reactivity */
        return width;
    }
    get height() {
        const height = self.innerHeight;
        this.forceUpdate; /* for reactivity */
        return height;
    }
    get viewBox() {
        const width = this.width;
        const height = this.height;
        return `0 0 ${width} ${height}`;
    }
    get cacheForceUpdate() {
        return () => {
            this.forceUpdate++;
        };
    }
    get targetsWithMargin() {
        const margin = this.maskMargin;
        return this.targets.map((target) => {
            const [x1, y1, x2, y2] = target;
            return [x1 - margin, y1 - margin, x2 + margin, y2 + margin];
        });
    }
    get path() {
        const width = this.width;
        const height = this.height;
        const rect = `M0,0 H${width} V${height} H0 z`;
        const targets = this.targetsWithMargin;
        /* rotate in the opposite rotation direction to create holes */
        const holes = targets.map((target) => {
            const [x1, y1, x2, y2] = target;
            return `M${x1},${y1} V${y2} H${x2} V${y1} z`;
        });
        /* and rotate again in the opposite direction, to nullify holes overlapping */
        const overlapHoles = getRectOverlaps(targets).map((target) => {
            const [x1, y1, x2, y2] = target;
            return `M${x1},${y1} H${x2} V${y2} H${x1} z`;
        });
        return [rect, ...holes, ...overlapHoles].join(' ');
    }
    /* }}} */
    /* {{{ Life cycle */
    mounted() {
        addEventListener('resize', this.cacheForceUpdate);
    }
    unmounted() {
        removeEventListener('resize', this.cacheForceUpdate);
    }
    /* }}} */
    render() {
        return h('svg', {
            style: this.style,
            height: this.height,
            width: this.width,
            viewbox: this.viewBox,
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            class: 'vue3-tutorial__svg-mask',
        }, [
            h('path', {
                d: this.path,
                style: this.maskStyle,
                class: 'vue3-tutorial__mask',
            }),
        ]);
    }
};
__decorate$3([
    Prop()
], SVG.prototype, "style", void 0);
__decorate$3([
    Prop()
], SVG.prototype, "maskStyle", void 0);
__decorate$3([
    Prop({ default: 0 })
], SVG.prototype, "maskMargin", void 0);
__decorate$3([
    Prop()
], SVG.prototype, "targets", void 0);
SVG = __decorate$3([
    Component
], SVG);
var Mask = SVG;

/* File Purpose:
 * Propose different common tools to help other components
 */
/** merge deeply an object in another one. */
function merge(target, source, list = new Map()) {
    if (typeof source !== 'object') {
        return source;
    }
    if (typeof target !== 'object') {
        if (Array.isArray(source)) {
            target = [];
        }
        else {
            target = {};
        }
    }
    for (const key of Object.keys(source)) {
        const val = source[key];
        if (list.has(val)) {
            target[key] = list.get(val);
            continue;
        }
        const tgtValue = target[key];
        if (typeof val === 'object') {
            if (Array.isArray(val)) {
                const valTarget = Array.isArray(tgtValue) ? tgtValue : [];
                list.set(val, valTarget);
                val.forEach((sourceVal, index) => {
                    valTarget[index] = merge(valTarget[index], sourceVal, list);
                });
                target[key] = valTarget;
                continue;
            }
            const valTarget = typeof tgtValue === 'object' ? tgtValue : {};
            list.set(val, valTarget);
            target[key] = merge(valTarget, val, list);
        }
        else {
            target[key] = val;
        }
    }
    return target;
}
/** Copy Set values into another Set */
function shallowSetCopy(origin, copy) {
    const clone = copy !== null && copy !== void 0 ? copy : new Set();
    clone.clear();
    for (const item of origin) {
        clone.add(item);
    }
    return clone;
}
/** Return a value which should be included between min and max */
function minMaxValue(value, min, max) {
    if (min > max) {
        return min;
    }
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}
/* This reference is only to return a common reference for an empty array.
 * This should avoid triggering changes when only providing a new empty array */
const emptyArray = [];
function getElement(query, options) {
    const { purpose, timeout, timeoutError, errorIsWarning, cache, all = false, refTime = performance.now(), } = options;
    try {
        let element;
        let isEmpty = false;
        if (cache === null || cache === void 0 ? void 0 : cache.has(query)) {
            element = cache.get(query);
        }
        else if (all) {
            const elements = document.querySelectorAll(query);
            element = !elements ? null : Array.from(elements);
            isEmpty = !(element === null || element === void 0 ? void 0 : element.length);
        }
        else {
            element = document.querySelector(query);
            isEmpty = !element;
        }
        /* manage cache */
        if (!isEmpty && cache) {
            cache.set(query, element);
        }
        if (typeof timeout === 'number') {
            if (!isEmpty) {
                return Promise.resolve(element);
            }
            /* Timeout have been reached */
            if (performance.now() - refTime > timeout) {
                const details = {
                    timeout,
                    selector: query,
                    purpose,
                };
                if (typeof timeoutError === 'function') {
                    timeoutError(details);
                }
                else if (errorIsWarning) {
                    error(224, details);
                }
                else {
                    error(324, details);
                }
                return Promise.resolve(null);
            }
            /* If timeout is not reached then search again */
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(getElement(query, {
                        purpose,
                        timeout,
                        timeoutError,
                        errorIsWarning,
                        cache,
                        all,
                        refTime,
                    }));
                }, 50);
            });
        }
        return element;
    }
    catch (err) {
        error(300, { selector: query, purpose, error: err });
    }
    if (typeof timeout === 'number') {
        return Promise.resolve(null);
    }
    return null;
}
function isHidden(rect) {
    const { x, y, width, height } = rect;
    if (!x && !y && !width && !height) {
        return 'hidden';
    }
    return 'visible';
}
function getBox(el, memo, { isParent = false, getParentBox = false, } = {}) {
    /* Check if result is already in memory */
    if (isParent && memo.has(el)) {
        return memo.get(el);
    }
    /* Check if this element is a root element */
    const parentEl = el.parentElement;
    if (!parentEl) {
        const rect = el.getBoundingClientRect();
        const box = [rect.left, rect.top, rect.right, rect.bottom, isHidden(rect)];
        memo.set(el, box);
        return box;
    }
    /* Now we want to check if current element is visible in parent element
     * (due to scroll) */
    const parentBox = getBox(parentEl, memo, { isParent: true, getParentBox });
    /* parent is itself not visible */
    if (parentBox[4] !== 'visible') {
        memo.set(el, parentBox);
        return parentBox;
    }
    /* Check if current element never scrolls, in such case, we keep the
     * parentElement box size */
    if (isParent) {
        const currentOverflow = getComputedStyle(el).overflow;
        if (currentOverflow === 'visible') {
            memo.set(el, parentBox);
            return parentBox;
        }
    }
    /* compare position with the parent scroll status */
    const rect = el.getBoundingClientRect();
    if (isHidden(rect) === 'hidden') {
        // the element is hidden (like display:none)
        return [0, 0, 0, 0, 'hidden'];
    }
    const [parentLeft, parentTop, parentRight, parentBottom] = parentBox;
    const { left: currentLeft, top: currentTop, right: currentRight, bottom: currentBottom, } = rect;
    const min = Math.min;
    const max = Math.max;
    let box;
    if (getParentBox && (currentTop > parentBottom || currentBottom < parentTop ||
        currentLeft > parentRight || currentRight < parentLeft)) {
        // element is not visible inside parent
        box = [
            parentLeft,
            parentTop,
            parentRight,
            parentBottom,
            'visible', // TODO use a better hidden position
        ];
    }
    else if (currentTop > parentBottom) {
        // element is at bottom
        box = [
            max(currentLeft, parentLeft),
            parentBottom,
            min(currentRight, parentRight),
            parentBottom,
            'bottom',
        ];
    }
    else if (currentBottom < parentTop) {
        // element is at top
        box = [
            max(currentLeft, parentLeft),
            parentTop,
            min(currentRight, parentRight),
            parentTop,
            'top',
        ];
    }
    else if (currentLeft > parentRight) {
        // element is at right
        box = [
            parentRight,
            max(currentTop, parentTop),
            parentRight,
            min(currentBottom, parentBottom),
            'right',
        ];
    }
    else if (currentRight < parentLeft) {
        // element is at left
        box = [
            parentLeft,
            max(currentTop, parentTop),
            parentLeft,
            min(currentBottom, parentBottom),
            'left',
        ];
    }
    else {
        // element is visible (at least partially)
        box = [
            max(currentLeft, parentLeft),
            max(currentTop, parentTop),
            min(currentRight, parentRight),
            min(currentBottom, parentBottom),
            'visible',
        ];
    }
    memo.set(el, box);
    return box;
}
function getPosition(box, realPosition) {
    const screenHeight = innerHeight;
    const screenWidth = innerWidth;
    let x;
    let y;
    switch (realPosition) {
        case 'bottom':
            x = minMaxValue((box[0] + box[2]) / 2, 0, screenWidth) + 'px';
            y = minMaxValue(box[3], 0, screenHeight) + 'px';
            break;
        case 'top':
            x = minMaxValue((box[0] + box[2]) / 2, 0, screenWidth) + 'px';
            y = minMaxValue(box[1], 0, screenHeight) + 'px';
            break;
        case 'left':
            x = minMaxValue(box[0], 0, screenWidth) + 'px';
            y = minMaxValue((box[1] + box[3]) / 2, 0, screenHeight) + 'px';
            break;
        case 'right':
            x = minMaxValue(box[2], 0, screenWidth) + 'px';
            y = minMaxValue((box[1] + box[3]) / 2, 0, screenHeight) + 'px';
            break;
        case 'auto':
        case 'center':
        case 'hidden':
        default:
            x = '50%';
            y = '50%';
            break;
    }
    return [x, y, realPosition];
}
function getPlacement(targetBox, refBox) {
    /* The placement is the direction from the refBox to the targetBox
     */
    if (!refBox) {
        refBox = [0, 0, innerWidth, innerHeight];
    }
    /* Compare center of rects */
    const [targetX, targetY] = getRectCenter(targetBox);
    const [refX, refY] = getRectCenter(refBox);
    if (targetX === refX) {
        if (refY > targetY) {
            return 'top';
        }
        else {
            /* this is also the case if points are the same (default value) */
            return 'bottom';
        }
    }
    const isRight = refX > targetX;
    const deviation = (refY - targetY) / (refX - targetX);
    if (isRight) {
        if (deviation < -1) {
            return 'top';
        }
        if (deviation < 1) {
            return 'right';
        }
        return 'bottom';
    }
    if (deviation < -1) {
        return 'bottom';
    }
    if (deviation < 1) {
        return 'left';
    }
    return 'top';
}
/** Add all Parent nodes of an element into a Set.
 *
 * The element itself is also added.
 * If a parent node is already in the Set, stop the loop because we expect
 * that all its parent are already in the Set.
 */
function addParents(el, list) {
    let node = el;
    while (node) {
        if (list.has(node)) {
            break;
        }
        list.add(node);
        node = node.parentElement;
    }
}

/* File Purpose:
 * Display a modal box on the screen depending on a position.
 */
var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const BOX_MARGIN = 25;
let Window = class Window extends Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.elementSize = [0, 0];
        this.timerSizeRefresh = 0;
    }
    /* }}} */
    /* {{{ computed */
    get mainBoxElement() {
        return this.elementsBox[0];
    }
    get realPosition() {
        const position = this.position;
        if (position !== 'auto' && position !== 'hidden') {
            return position;
        }
        const box = this.mainBoxElement;
        if (!(box === null || box === void 0 ? void 0 : box.length)) {
            return 'center';
        }
        /* check where there are enough spaces */
        const [elWidth, elHeight] = this.elementSize;
        const screenHeight = innerHeight;
        const screenWidth = innerWidth;
        const worstPosition = {
            bottom: 0,
            top: 1,
            right: 2,
            left: 3,
        };
        if (box[3] + BOX_MARGIN + elHeight > screenHeight) {
            worstPosition.bottom += 100;
        }
        if (box[1] - BOX_MARGIN - elHeight < 0) {
            worstPosition.top += 100;
        }
        if (box[2] + BOX_MARGIN + elWidth > screenWidth) {
            worstPosition.right += 100;
        }
        if (box[0] - BOX_MARGIN - elWidth < 0) {
            worstPosition.left += 100;
        }
        /* TODO check superposition with other target */
        let choice = 'bottom';
        let currentValue = worstPosition.bottom;
        if (worstPosition.top < currentValue) {
            currentValue = worstPosition.top;
            choice = 'top';
        }
        if (worstPosition.right < currentValue) {
            currentValue = worstPosition.right;
            choice = 'right';
        }
        if (worstPosition.left < currentValue) {
            currentValue = worstPosition.left;
            choice = 'left';
        }
        return choice;
    }
    get hasNoPointer() {
        const arrow = this.arrow;
        if (arrow === false) {
            return true;
        }
        if (arrow === true) {
            const boxes = this.elementsBox;
            return !(boxes === null || boxes === void 0 ? void 0 : boxes.length) || !boxes[0].length || !!this.getScrollPosition || this.realPosition === 'center';
        }
        return false;
    }
    get computePosition() {
        const box = this.mainBoxElement;
        const realPosition = this.realPosition;
        const preferredPosition = !box || box[4] !== 'visible' ? 'center' : realPosition;
        return getPosition(box, preferredPosition);
    }
    get realWindowPosition() {
        if (this.position === 'hidden') {
            return 'hidden';
        }
        return this.computePosition[2];
    }
    get stylePosition() {
        let [x, y, placement] = this.computePosition;
        const [elWidth, elHeight] = this.elementSize;
        switch (placement) {
            case 'center':
            case 'hidden':
                break;
            case 'bottom':
            case 'top':
                const valX = parseInt(x, 10);
                if (valX < elWidth / 2) {
                    x = elWidth / 2 + 'px';
                }
                break;
            case 'left':
            case 'right':
                const valY = parseInt(y, 10);
                if (valY < elHeight / 2) {
                    y = elHeight / 2 + 'px';
                }
                break;
        }
        return `--vue3-tutorial-x: ${x}; --vue3-tutorial-y: ${y};`;
    }
    /* XXX: This is only to create a reference to the same function */
    get refUpdateSize() {
        return this.updateSize.bind(this);
    }
    get teleportContainer() {
        let el = this.teleport;
        if (typeof el === 'boolean') {
            if (el) {
                return document.body;
            }
            return null;
        }
        return el;
    }
    /* {{{ scroll */
    get getScrollPosition() {
        const box = this.mainBoxElement;
        const hiddenPosition = box === null || box === void 0 ? void 0 : box[4];
        if (!hiddenPosition || hiddenPosition === 'visible' || hiddenPosition === 'hidden') {
            return;
        }
        return getPosition(box, hiddenPosition);
    }
    get styleScrollPosition() {
        const [x, y,] = this.getScrollPosition || [];
        return `left: ${x}; top: ${y};`;
    }
    get arrowsPosition() {
        const arrow = this.arrow;
        if (!arrow || this.hasNoPointer) {
            return emptyArray;
        }
        if (arrow === true) {
            const [x, y, position] = this.computePosition;
            return [{ x, y, position }];
        }
        return arrow;
    }
    /* }}} */
    /* }}} */
    /* {{{ watch */
    onElementBoxChange() {
        setTimeout(this.refUpdateSize, 10);
    }
    onTeleportChange() {
        this.useTeleport();
    }
    /* }}} */
    /* {{{ methods */
    updateSize() {
        const el = this.$refs.modalWindow;
        if (!el) {
            // it could be because the component has been removed (async call)
            return;
        }
        const rect = el.getBoundingClientRect();
        // XXX: Avoid this.elementSize = [rect.width, rect.height];
        // because it creates a new reference (and so it renders continually)
        this.elementSize[0] = rect.width;
        this.elementSize[1] = rect.height;
    }
    useTeleport() {
        const containerElement = this.teleportContainer;
        const el = this.$el;
        if (containerElement && el) {
            containerElement.appendChild(el);
        }
    }
    removeTeleport() {
        const el = this.$el;
        const containerElement = el === null || el === void 0 ? void 0 : el.parentNode;
        containerElement === null || containerElement === void 0 ? void 0 : containerElement.removeChild(this.$el);
    }
    /* }}} */
    /* {{{ Life cycle */
    mounted() {
        this.useTeleport();
        this.updateSize();
        addEventListener('resize', this.refUpdateSize);
    }
    updated() {
        // call updateSize after all changes in render (debounce)
        clearTimeout(this.timerSizeRefresh);
        this.timerSizeRefresh = setTimeout(this.updateSize.bind(this), 50);
    }
    unmounted() {
        removeEventListener('resize', this.refUpdateSize);
        this.removeTeleport();
    }
    /* }}} */
    render() {
        var _a, _b;
        const arrowAnimation = this.arrowAnimation;
        return (h("div", { class: "vue3-tutorial__window-container" },
            this.mask && (h(Mask, { targets: this.masksBox, maskMargin: this.maskMargin })),
            this.arrowsPosition.map((arrow) => (h(SVG$2, { width: "15", height: "15", viewBox: "0 0 30 30", path: "M0,0L0,15L5,5L25,30L25,25L30,25L5,5L15,0L0,0Z", style: `left: ${arrow.x}; top: ${arrow.y};`, class: [
                    'vue3-tutorial__window-arrow',
                    'position-' + arrow.position,
                    arrowAnimation ? 'animation' : '',
                ] }))),
            !!this.getScrollPosition && (h(SVG$2, { width: "30", height: "30", viewBox: "0 0 30 30", path: "M0,0L0,15L7,7L10,30L30,10L7,7L15,0L0,0Z", style: this.styleScrollPosition, class: [
                    'vue3-tutorial__window-scroll-arrow',
                    'position-' + this.getScrollPosition[2],
                    this.arrowAnimation ? 'animation' : '',
                ] })),
            h("div", { style: this.stylePosition, class: [
                    'vue3-tutorial__window',
                    'position-' + this.realWindowPosition,
                ], ref: "modalWindow" }, (_b = (_a = this.$slots).content) === null || _b === void 0 ? void 0 : _b.call(_a))));
    }
};
__decorate$2([
    Prop({ default: () => [] })
], Window.prototype, "elementsBox", void 0);
__decorate$2([
    Prop({ default: () => [] })
], Window.prototype, "masksBox", void 0);
__decorate$2([
    Prop({ default: 'auto' })
], Window.prototype, "position", void 0);
__decorate$2([
    Prop({ default: true })
], Window.prototype, "arrow", void 0);
__decorate$2([
    Prop({ default: true })
], Window.prototype, "arrowAnimation", void 0);
__decorate$2([
    Prop({ default: true })
], Window.prototype, "mask", void 0);
__decorate$2([
    Prop({ default: 0 })
], Window.prototype, "maskMargin", void 0);
__decorate$2([
    Prop({ default: true })
], Window.prototype, "teleport", void 0);
__decorate$2([
    Watch('elementsBox', { deep: true })
], Window.prototype, "onElementBoxChange", null);
__decorate$2([
    Watch('teleport')
], Window.prototype, "onTeleportChange", null);
Window = __decorate$2([
    Component
], Window);
var Window$1 = Window;

/** File purpose:
 * It contains all default values and function to merge them.
 */
const DEFAULT_DICTIONARY = {
    finishButton: 'Finish',
    nextButton: 'Next',
    previousButton: 'Previous',
    skipButtonTitle: 'Skip tutorial',
    skipConfirm: 'Do you want to quit the tutorial?',
    stepState: 'step %(currentStep)s / %(totalStep)s',
};
const DEFAULT_BINDING = {
    next: ['ArrowRight', 'Enter'],
    previous: 'ArrowLeft',
    skip: 'Escape',
};
const DEFAULT_STEP_OPTIONS = {
    position: 'auto',
    highlight: true,
    classForTargets: '',
    arrowAnimation: true,
    mask: true,
    arrow: true,
    maskMargin: 0,
    bindings: DEFAULT_BINDING,
    focus: 'no-focus',
    muteElements: false,
    texts: DEFAULT_DICTIONARY,
    scroll: 'scroll-to',
    timeout: 3000,
    teleport: true,
    debug: false,
};
function mergeStepOptions(...options) {
    return options.reduce((merged, option) => merge(merged, option), {});
}

/** File purpose:
 * Handle step relative methods
 */
function getActionType(step) {
    const action = step.actionNext;
    if (!action) {
        return 'next';
    }
    if (typeof action === 'string') {
        return action;
    }
    return action.action;
}
function isStepSpecialAction(arg) {
    const actionType = typeof arg === 'string' ? arg : getActionType(arg);
    return actionType !== 'next';
}
function checkExpression(expr, targetEl, purpose) {
    var _a, _b, _c;
    /* XXX: This type assignation is only to avoid telling all possible HTML cases */
    const targetElement = targetEl;
    const checkOperation = expr.check || 'is';
    const prop = (_a = expr.property) !== null && _a !== void 0 ? _a : 'value';
    const refValue = expr.value;
    const value = targetElement[prop];
    switch (checkOperation) {
        case 'is':
            return value == refValue;
        case 'is not':
            return value != refValue;
        case 'contains':
            return !!((_b = value === null || value === void 0 ? void 0 : value.includes) === null || _b === void 0 ? void 0 : _b.call(value, refValue));
        case 'do not contain':
        case 'does not contain':
            return !((_c = value === null || value === void 0 ? void 0 : value.includes) === null || _c === void 0 ? void 0 : _c.call(value, refValue));
        case 'is empty':
            return !value;
        case 'is not empty':
            return !!value;
        case 'is checked':
            return !!targetElement.checked;
        case 'is not checked':
            return !targetElement.checked;
        case 'is disabled':
            return !!targetElement.disabled;
        case 'is not disabled':
            return !targetElement.disabled;
        case 'is rendered':
            return document.body.contains(targetElement);
        case 'is not rendered':
            return !document.body.contains(targetElement);
    }
    error(301, { operation: checkOperation, purpose });
    return false;
}
async function skipCurrentStep(step, info) {
    var _a;
    const stepDesc = step.desc;
    const skipStep = stepDesc === null || stepDesc === void 0 ? void 0 : stepDesc.skipStep;
    if (!skipStep) {
        return false;
    }
    if (typeof skipStep === 'boolean') {
        return skipStep;
    }
    if (typeof skipStep === 'function') {
        return skipStep(info.currentIndex);
    }
    const operator = skipStep.check;
    const isOperatorNotRendered = operator === 'is not rendered';
    const isOperatorRender = isOperatorNotRendered || operator === 'is rendered';
    const targetSelector = skipStep.target;
    const targetElement = await getElement(targetSelector, {
        purpose: 'skipStep',
        timeout: (_a = skipStep.timeout) !== null && _a !== void 0 ? _a : step.options.timeout,
        timeoutError: (details) => {
            if (isOperatorRender) {
                return;
            }
            error(224, details);
        },
    });
    if (!targetElement) {
        /* If the element has not been found return false only if it is
         * not the purpose of the operator */
        if (!isOperatorNotRendered) {
            return false;
        }
        return true;
    }
    return checkExpression(skipStep, targetElement, 'skipStep');
}
function getStep(stepDesc, tutorialOptions, info) {
    const step = reactive({
        desc: stepDesc,
        status: {
            isActionNext: true,
            skipped: false,
            index: info.currentIndex,
        },
        /* will be filled immediately */
        options: {},
        async checkSkipped() {
            /* recompute the skip status */
            const skipped = await skipCurrentStep(step, info);
            step.status.skipped = skipped;
            return skipped;
        },
    });
    /* handle options */
    watch(() => [stepDesc, tutorialOptions], () => {
        step.options = mergeStepOptions(tutorialOptions, stepDesc.options || {});
    }, { immediate: true, deep: true });
    /* handle status.isActionNext */
    watch(() => stepDesc.actionNext, () => {
        const nextActionType = getActionType(stepDesc);
        step.status.isActionNext = !isStepSpecialAction(nextActionType);
    }, { immediate: true, deep: true });
    step.checkSkipped();
    return step;
}
/* test */

/** File purpose:
 * Return strings depending on dictionary
 */
const dictionary = reactive(Object.assign({}, DEFAULT_DICTIONARY));
function label(key, replacement) {
    let text;
    if (typeof dictionary[key] === 'undefined') {
        error(201, { label: key });
        text = key;
    }
    else {
        text = dictionary[key];
    }
    if (replacement) {
        text = text.replace(/%\(([^)]+)\)s/g, (_p, name) => { var _a, _b; return (_b = (_a = replacement[name]) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ''; });
    }
    return text;
}
function changeTexts(dic) {
    if (!dic) {
        return;
    }
    Object.assign(dictionary, dic);
}

/** File purpose:
 * Manage key binding and interaction with keyboard
 */
const mapBinding = new Map();
let eventCallback = null;
let isListening = false;
let currentBindingSignature = '';
function resetBindings(binding) {
    const signature = JSON.stringify(binding);
    if (currentBindingSignature === signature) {
        return;
    }
    currentBindingSignature = signature;
    mapBinding.clear();
    if (binding === false) {
        return;
    }
    for (const [action, keyBindings] of Object.entries(binding)) {
        if (Array.isArray(keyBindings)) {
            keyBindings.forEach((keyBind) => {
                mapBinding.set(keyBind, action);
            });
        }
        else {
            mapBinding.set(keyBindings, action);
        }
    }
}
function onKeyup(evt) {
    const key = evt.key;
    const focusedElement = evt.target;
    if (!isListening || focusedElement !== document.body) {
        /* Avoid triggering tasks when keyboard may be used by another element */
        return;
    }
    if (mapBinding.has(key) && eventCallback) {
        eventCallback(mapBinding.get(key));
    }
}
function startListening(callback) {
    eventCallback = callback;
    if (isListening) {
        return;
    }
    document.addEventListener('keyup', onKeyup);
    isListening = true;
}
function stopListening() {
    if (!isListening) {
        return;
    }
    isListening = false;
    document.removeEventListener('keyup', onKeyup);
    eventCallback = null;
}

/* File Purpose:
 * It handles the display for one step
 */
var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const noop = function () { };
const mutationConfig = { childList: true, subtree: true };
let VStep = class VStep extends Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ Next action */
        this.removeActionListener = noop;
        /* }}} */
        /* {{{ Scroll */
        this.scrollElements = new Set();
        /* }}} */
        /* }}} */
        /* {{{ Elements workflow */
        this.cacheElements = new Map();
        this.boxCache = new WeakMap();
        this.startTime = 0;
        this.timerGetAllElements = 0;
        this.working = new Map();
        /* This property is updated anytime elements are refetch. It helps to show
         *  when an asynchronous request is deprecated. */
        this.requestRef = 0;
        /* This property is only to force recompute Boxes and re-rendering */
        this.updateBox = 0;
        /* {{{ Targets */
        this.mainElement = null;
        this.targetElements = new Set();
        /* }}} */
        /* {{{ Highlight & class */
        this.highlightElements = new Set();
        this.oldHighlightElements = new Set();
        /* }}} */
        /* {{{ Mask */
        this.maskElements = new Set();
        /* }}} */
        /* {{{ Arrows */
        this.arrowElements = new Set();
        /* }}} */
        /* {{{ Muted */
        /* [Element, tabIndex it had before mute ] */
        this.mutedElements = new Map();
        /* }}} */
        /* {{{ Focus */
        this.timerSetFocus = 0;
        this.stopWatchForFocus = noop;
    }
    /* }}} */
    /* {{{ data */
    /* XXX: some data are configured in elements Workflow */
    /* }}} */
    /* {{{ computed */
    get fullOptions() {
        const options = this.step.options;
        if (options.position === 'hidden') {
            if (this.needsNextButton) {
                /* If there are no other possibility to go to "next" action
                 * then redisplay the step.
                 */
                return Object.assign(Object.assign({}, options), { position: 'center' });
            }
        }
        return options;
    }
    /* {{{ buttons */
    get displayPreviousButton() {
        const info = this.tutorialInformation;
        if (info.previousStepIsSpecial || info.currentIndex <= 0) {
            return false;
        }
        return true;
    }
    get displayNextButton() {
        const info = this.tutorialInformation;
        if (info.currentIndex >= info.nbTotalSteps - 1) {
            return false;
        }
        return this.needsNextButton;
    }
    get displayFinishButton() {
        const info = this.tutorialInformation;
        if (info.currentIndex >= info.nbTotalSteps - 1) {
            return this.needsNextButton;
        }
        return false;
    }
    get displaySkipButton() {
        return true;
    }
    /* }}} */
    /* }}} */
    /* {{{ watch */
    onTextsChange() {
        /* Update labels */
        changeTexts(this.fullOptions.texts);
    }
    onBindingsChange() {
        /* update key bindings */
        resetBindings(this.fullOptions.bindings);
    }
    get nextActionType() {
        return getActionType(this.step.desc);
    }
    /* Target the element where we expect user to interact with */
    get nextActionTarget() {
        const type = this.nextActionType;
        if (type === 'next') {
            return null;
        }
        const action = this.step.desc.actionNext;
        if (typeof action === 'string') {
            return this.mainElement;
        }
        const target = action === null || action === void 0 ? void 0 : action.target;
        if (typeof target !== 'string') {
            return this.mainElement;
        }
        /* XXX: only for reactivity, to force to get the correct element */
        this.targetElements;
        return getElement(target, { purpose: 'nextAction' });
    }
    get needsNextButton() {
        return this.step.status.isActionNext;
    }
    actionListener() {
        const type = this.nextActionType;
        const valueEventName = ['input', 'change'];
        if (valueEventName.includes(type)) {
            const action = this.step.desc.actionNext;
            const targetElement = this.nextActionTarget;
            if (!checkExpression(action, targetElement, 'nextAction')) {
                return;
            }
        }
        this.$emit('next');
    }
    addActionListener() {
        const eventName = this.nextActionType;
        const el = this.nextActionTarget;
        this.removeActionListener();
        if (!el || eventName === 'next') {
            return;
        }
        const listener = this.actionListener;
        el.addEventListener(eventName, listener, { capture: true });
        this.removeActionListener = () => {
            el.removeEventListener(eventName, listener, { capture: true });
            this.removeActionListener = noop;
        };
    }
    onActionTypeChange() {
        this.addActionListener();
    }
    /* }}} */
    /* {{{ Events */
    /* {{{ Resize */
    addResizeListener() {
        const callback = this.recomputeBox;
        window.addEventListener('resize', callback);
    }
    removeResizeListener() {
        const callback = this.recomputeBox;
        window.removeEventListener('resize', callback);
    }
    addScrollListener() {
        const callback = this.recomputeBox;
        const scrollElements = this.scrollElements;
        for (const el of scrollElements) {
            el.addEventListener('scroll', callback);
        }
    }
    clearScrollListener() {
        const callback = this.recomputeBox;
        const elements = this.scrollElements;
        for (const el of elements) {
            el.removeEventListener('scroll', callback);
        }
        this.scrollElements.clear();
    }
    onPositionElementsChange() {
        const scrollElements = this.scrollElements;
        this.clearScrollListener();
        scrollElements.add(window);
        for (const el of this.targetElements) {
            addParents(el, scrollElements);
        }
        for (const el of this.maskElements) {
            addParents(el, scrollElements);
        }
        for (const el of this.arrowElements) {
            addParents(el, scrollElements);
        }
        this.addScrollListener();
    }
    /* }}} */
    /* {{{ Mutation */
    get mutationObserver() {
        return new MutationObserver((mutationList) => {
            const el = this.nextActionTarget;
            if (!el) {
                return;
            }
            for (const mutation of mutationList) {
                if (mutation.type === 'childList'
                    && mutation.removedNodes.length
                    && el.getRootNode() !== document) {
                    /* On DOM change refetch all elements */
                    this.debounceGetAllElement();
                }
            }
        });
    }
    /** list of target elements.
     *
     * Convert the Set in Array.
     * The Set is used to avoid duplications.
     * The Array is used to keep elements in the same order as boxes.
     */
    get targetElementsOrdered() {
        const list = Array.from(this.targetElements);
        const mainElement = this.mainElement;
        const index = list.indexOf(mainElement);
        if (index === -1) {
            list.unshift(mainElement);
        }
        else if (index > 0) {
            list.splice(index, 1);
            list.unshift(mainElement);
        }
        return list;
    }
    get isMainElementHidden() {
        const mainBox = this.targetBoxes[0];
        if (mainBox && mainBox[4] !== 'visible') {
            return true;
        }
        return false;
    }
    get targetBoxes() {
        const elements = this.targetElements;
        /* XXX: only for reactivity, to force to recompute box coordinates */
        this.updateBox;
        const memo = this.boxCache;
        return Array.from(elements, (element) => {
            if (element) {
                return getBox(element, memo);
            }
            return [0, 0, 0, 0, 'hidden'];
        });
    }
    getTargetElements() {
        const targetElements = this.targetElements;
        this.getElements({
            selectors: this.step.desc.target,
            elements: targetElements,
            timeout: this.fullOptions.timeout,
            purpose: 'targets',
            errorIsWarning: false,
            thenCb: (elements, selector, index) => {
                if (elements === null || elements === void 0 ? void 0 : elements.length) {
                    debug(26, this.fullOptions, {
                        elements,
                        selector,
                    });
                    if (index === 1) {
                        this.mainElement = elements[0];
                    }
                    elements.forEach((el) => targetElements.add(el));
                }
                else {
                    /* No elements have been found */
                    debug(27, this.fullOptions, {
                        selector,
                    });
                }
            },
        });
    }
    onElementsBoxChange() {
        const boxes = this.targetBoxes;
        const hasHiddenElement = boxes.some((box) => box[4] === 'hidden');
        const elements = this.targetElementsOrdered;
        debug(25, this.fullOptions, {
            elementsBox: boxes,
            elements: elements,
            tutorialInformation: this.tutorialInformation,
            hasHiddenElement,
        });
        if (hasHiddenElement) {
            const timeout = this.fullOptions.timeout;
            this.startTime + timeout;
            const hiddenElements = boxes.reduce((list, box, idx) => {
                if (box[4] === 'hidden') {
                    list.push(elements[idx]);
                }
                return list;
            }, []);
            const hasVisibleElement = hiddenElements.length < boxes.length;
            /* force to recompute */
            const ref = this.requestRef;
            setTimeout(() => this.getAllElements({
                ref,
                timeout,
                purpose: 'targets',
                elements: hiddenElements,
                error: !hasVisibleElement,
            }), 50);
        }
    }
    getHighlightElements() {
        const highlight = this.fullOptions.highlight;
        const highlightElements = this.highlightElements;
        highlightElements.clear();
        if (!highlight || highlight === true) {
            return;
        }
        this.getElements({
            selectors: highlight,
            elements: highlightElements,
            timeout: this.fullOptions.timeout,
            purpose: 'highlight',
            errorIsWarning: true,
            thenCb: (elements) => {
                if (elements) {
                    elements.forEach((el) => highlightElements.add(el));
                }
            },
        });
    }
    addHighlightClass() {
        const highlight = this.fullOptions.highlight;
        if (!highlight) {
            return;
        }
        const highlightElements = this.highlightElements;
        for (const el of highlightElements) {
            el.classList.add('vue3-tutorial-highlight');
        }
    }
    addClass(newTargets) {
        const options = this.fullOptions;
        const classForTargets = options.classForTargets;
        /* add vue3-tutorial class */
        newTargets.forEach((el) => {
            if (!el) {
                return;
            }
            el.classList.add('vue3-tutorial__target');
            if (classForTargets) {
                el.classList.add(classForTargets);
            }
        });
        const mainEl = newTargets[0];
        if (mainEl) {
            mainEl.classList.add('vue3-tutorial__main-target');
        }
    }
    removeClass(elements) {
        const options = this.fullOptions;
        const classForTargets = options.classForTargets;
        /* remove previous vue3-tutorial class */
        elements.forEach((el) => {
            if (!el) {
                return;
            }
            el.classList.remove('vue3-tutorial-highlight', 'vue3-tutorial__target', 'vue3-tutorial__main-target');
            if (classForTargets) {
                el.classList.remove(classForTargets);
            }
        });
        if (elements instanceof Set) {
            elements.clear();
        }
    }
    onElementsChange(oldList) {
        /* cleanup previous elements */
        this.removeClass(oldList);
        /* add class to elements */
        const newList = this.targetElementsOrdered;
        this.addClass(newList);
        this.addHighlightClass();
    }
    onHighlightElementsChange() {
        const oldList = this.oldHighlightElements;
        /* cleanup previous elements */
        this.removeClass(oldList);
        shallowSetCopy(this.highlightElements, oldList);
        /* add class to elements */
        this.addHighlightClass();
    }
    onMainElementChange() {
        const highlight = this.fullOptions.highlight;
        if (highlight === true) {
            const highlightElements = this.highlightElements;
            const mainElement = this.mainElement;
            if (mainElement) {
                highlightElements.clear();
                highlightElements.add(mainElement);
            }
        }
    }
    get masksBox() {
        const { mask } = this.fullOptions;
        if (!mask) {
            return emptyArray;
        }
        const cache = this.boxCache;
        const mainElement = this.mainElement;
        if (mask === true) {
            const elementsBox = this.targetBoxes;
            if (mainElement && this.isMainElementHidden) {
                /* Add the parent box, if element is not visible. This is
                * to have a visible box to scroll */
                return [
                    ...elementsBox,
                    getBox(mainElement, cache, { getParentBox: true }),
                ];
            }
            else {
                return elementsBox;
            }
        }
        /* XXX: only for reactivity, to force to recompute box coordinates */
        this.updateBox;
        const listElements = this.maskElements;
        const boxList = [];
        for (const element of listElements) {
            boxList.push(getBox(element, cache));
        }
        /* Add the parent box, if element is not visible. This is to have a
        * visible box to scroll */
        if (mainElement && this.isMainElementHidden) {
            boxList.push(getBox(mainElement, cache, { getParentBox: true }));
        }
        return boxList;
    }
    getMaskElements() {
        const mask = this.fullOptions.mask;
        if (typeof mask === 'boolean') {
            this.working.set('mask', false);
            return;
        }
        const maskElements = this.maskElements;
        this.getElements({
            selectors: mask,
            elements: maskElements,
            timeout: this.fullOptions.timeout,
            purpose: 'mask',
            errorIsWarning: true,
            thenCb: (elements) => {
                if (elements === null || elements === void 0 ? void 0 : elements.length) {
                    elements.forEach((el) => maskElements.add(el));
                }
            },
        });
    }
    get arrowsPosition() {
        const arrow = this.fullOptions.arrow;
        if (typeof arrow === 'boolean') {
            return arrow;
        }
        /* XXX: only for reactivity, to force to recompute box coordinates */
        this.updateBox;
        const memo = this.boxCache;
        const listElements = this.arrowElements;
        const positionList = [];
        for (const element of listElements) {
            const box = getBox(element, memo);
            const placement = getPlacement(box);
            const [x, y, position] = getPosition(box, placement);
            positionList.push({ x, y, position });
        }
        return positionList;
    }
    getArrowElements() {
        const arrow = this.fullOptions.arrow;
        if (typeof arrow === 'boolean') {
            this.working.set('arrow', false);
            return;
        }
        const arrowElements = this.arrowElements;
        this.getElements({
            selectors: arrow,
            elements: arrowElements,
            timeout: this.fullOptions.timeout,
            purpose: 'arrow',
            errorIsWarning: true,
            thenCb: (elements) => {
                if (elements === null || elements === void 0 ? void 0 : elements.length) {
                    elements.forEach((el) => arrowElements.add(el));
                }
            },
        });
    }
    getMutedElements() {
        this.resetMutedElements();
        const mutedSelectors = this.fullOptions.muteElements;
        const mutedElements = this.mutedElements;
        if (!mutedSelectors) {
            return;
        }
        this.getElements({
            selectors: mutedSelectors,
            elements: mutedElements,
            timeout: this.fullOptions.timeout,
            purpose: 'mute',
            errorIsWarning: true,
            thenCb: (elements) => {
                if (elements) {
                    elements.forEach((el) => {
                        if (!mutedElements.has(el)) {
                            mutedElements.set(el, el.tabIndex);
                            el.classList.add('vue3-tutorial-muted');
                            el.tabIndex = -1;
                        }
                    });
                }
            },
        });
    }
    resetMutedElements() {
        const elements = this.mutedElements;
        for (const [element, tabindex] of elements) {
            element.tabIndex = tabindex;
            element.classList.remove('vue3-tutorial-muted');
        }
        elements.clear();
    }
    setFocus() {
        var _a;
        const fullOptions = this.fullOptions;
        const focusCfg = fullOptions.focus;
        this.stopWatchForFocus();
        this.timerSetFocus++;
        switch (focusCfg) {
            case false:
            case 'false':
            case 'no-focus': {
                /* Remove focus from any element */
                const el = document.activeElement;
                el === null || el === void 0 ? void 0 : el.blur();
                break;
            }
            case 'keep':
                /* Do not change any focus */
                return;
            case true:
            case 'true':
            case 'main-target': {
                /* set focus to the main target */
                const timeout = fullOptions.timeout;
                /* Timer is to stop the watch after timeout. */
                this.timerSetFocus = setTimeout(() => {
                    stopWatch();
                    error(324, { timeout, selector: '{main-target}', purpose: 'focus' });
                }, timeout || 10);
                const refTimer = this.timerSetFocus;
                const stopWatch = watch(() => this.mainElement, () => {
                    const timerSetFocus = this.timerSetFocus;
                    /* check that function is not outdated */
                    if (refTimer !== timerSetFocus) {
                        clearTimeout(timerSetFocus);
                        stopWatch();
                        return;
                    }
                    /* Check if mainElement is defined in order to set focus */
                    const mainElement = this.mainElement;
                    if (mainElement) {
                        mainElement.focus();
                        clearTimeout(timerSetFocus);
                        /* defer stopWatch in order to be sure that the value exists (due to immediate option) */
                        setTimeout(() => stopWatch(), 0);
                        return;
                    }
                }, { immediate: true });
                this.stopWatchForFocus = () => {
                    stopWatch();
                    clearTimeout(this.timerSetFocus);
                    this.stopWatchForFocus = noop;
                };
                break;
            }
            default: {
                /* Set focus to given target */
                const target = focusCfg.target;
                const refTimer = this.timerSetFocus;
                const timeout = (_a = focusCfg.timeout) !== null && _a !== void 0 ? _a : fullOptions.timeout;
                getElement(target, {
                    purpose: 'focus',
                    timeout: timeout,
                }).then((el) => {
                    if (el && refTimer === this.timerSetFocus) {
                        el.focus();
                    }
                });
                break;
            }
        }
    }
    /* }}} */
    /* {{{ Scroll To */
    async scrollTo() {
        var _a, _b;
        const options = this.fullOptions;
        let scroll = options.scroll;
        let behavior;
        let target;
        if (typeof scroll === 'boolean') {
            const targetWorking = this.working.get('targets');
            if (targetWorking instanceof Promise) {
                await targetWorking;
            }
            behavior = scroll ? 'scroll-to' : 'no-scroll';
            target = this.mainElement;
        }
        else if (typeof scroll === 'string') {
            if (scroll === 'true') {
                scroll = 'scroll-to';
            }
            else if (scroll === 'false') {
                scroll = 'no-scroll';
            }
            const targetWorking = this.working.get('targets');
            if (targetWorking instanceof Promise) {
                await targetWorking;
            }
            behavior = scroll;
            target = this.mainElement;
        }
        else {
            behavior = (_a = scroll.scrollKind) !== null && _a !== void 0 ? _a : 'scroll-to';
            target = await getElement(scroll.target, {
                purpose: 'scroll',
                timeout: (_b = scroll.timeout) !== null && _b !== void 0 ? _b : options.timeout,
                errorIsWarning: true,
            });
        }
        if (target && behavior === 'scroll-to') {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
    /* }}} */
    /* {{{ global */
    get isStepReady() {
        const working = this.working;
        if (working.size === 0) {
            return false;
        }
        for (const isWorking of working.values()) {
            if (isWorking) {
                return false;
            }
        }
        return true;
    }
    recomputeBox() {
        this.updateBox++;
        this.boxCache = new WeakMap();
    }
    debounceGetAllElement(info, timer = 10) {
        this.timerGetAllElements = setTimeout(() => {
            this.getAllElements(info);
        }, timer);
    }
    /** Fetch all elements needed for the step.
     *
     * @param ref {number} this is to check if the query is deprecated.
     *                     if 0, a new query is done.
     */
    getAllElements(info) {
        const { ref = 0, timeout = this.fullOptions.timeout, purpose, elements, error: sendError, } = info !== null && info !== void 0 ? info : {};
        const currentTime = performance.now();
        /* Check if timeout is reached */
        if (ref) {
            if (ref !== this.requestRef) {
                /* A newer query has already been requested */
                return;
            }
            const duration = currentTime - this.startTime;
            if (duration > timeout) {
                const details = {
                    timeout,
                    elements,
                    purpose,
                };
                if (sendError) {
                    error(325, details);
                }
                else {
                    error(225, details);
                }
                return;
            }
        }
        /* Reinitialize */
        this.requestRef++;
        this.cacheElements.clear();
        this.boxCache = new WeakMap();
        if (!ref) {
            this.startTime = currentTime;
        }
        /* fetch elements */
        this.getTargetElements();
        this.getMaskElements();
        this.getArrowElements();
        this.getHighlightElements();
        this.getMutedElements();
        /* Apply effects */
        this.scrollTo();
        this.setFocus();
        debug(24, this.fullOptions, {
            ref: this.requestRef,
            startTime: this.startTime,
            currentTime,
        });
        /* TODO: check that it is ok (no hidden element) */
    }
    getElements(arg) {
        const { selectors, elements, timeout, purpose, errorIsWarning, thenCb, } = arg;
        const ref = this.requestRef;
        elements.clear();
        const querySelectors = Array.isArray(selectors) ? selectors : [selectors];
        if (!selectors || !querySelectors.length) {
            this.working.set(purpose, false);
            return;
        }
        const isDeprecated = this.isDeprecated;
        const cache = this.cacheElements;
        const promises = [];
        querySelectors.forEach(async (selector) => {
            const promise = getElement(selector, {
                timeout,
                all: true,
                purpose,
                cache,
                errorIsWarning,
            });
            const index = promises.push(promise);
            const elements = await promise;
            if (isDeprecated(ref)) {
                return;
            }
            thenCb(elements, selector, index);
        });
        const allPromises = Promise.all(promises).then(() => {
            if (isDeprecated(ref)) {
                return false;
            }
            this.working.set(purpose, false);
            return true;
        });
        this.working.set(purpose, allPromises);
    }
    isDeprecated(ref) {
        return ref !== this.requestRef;
    }
    onStepTargetChange() {
        /* Step changed */
        debug(22, this.fullOptions, {
            step: this.step,
            tutorialInformation: this.tutorialInformation,
        });
        /* Fetch elements for this step */
        this.getAllElements();
    }
    onReadyChange() {
        this.mutationObserver.disconnect();
        if (this.isStepReady) {
            this.mutationObserver.observe(document.body, mutationConfig);
        }
    }
    /* }}} */
    /* }}} */
    /* {{{ Life cycle */
    /* }}} */
    mounted() {
        this.addResizeListener();
        debug(20, this.fullOptions, {
            step: this.step,
            tutorialInformation: this.tutorialInformation,
        });
    }
    unmounted() {
        this.removeClass(this.targetElements);
        this.removeClass(this.oldHighlightElements);
        this.removeClass(this.highlightElements);
        this.resetMutedElements();
        this.stopWatchForFocus();
        this.removeActionListener();
        this.clearScrollListener();
        this.removeResizeListener();
        this.mutationObserver.disconnect();
        this.cacheElements.clear();
        /* Ensure that all asynchronous request will be deprecated */
        this.requestRef++;
        debug(21, this.fullOptions, {
            step: this.step,
            tutorialInformation: this.tutorialInformation,
        });
    }
    render() {
        const options = this.fullOptions;
        const stepDesc = this.step.desc;
        const information = this.tutorialInformation;
        return (h(Window$1, { elementsBox: this.targetBoxes, masksBox: this.masksBox, position: options.position, arrow: this.arrowsPosition, arrowAnimation: options.arrowAnimation, mask: !!options.mask, maskMargin: options.maskMargin, teleport: options.teleport },
            h("aside", { slot: "content", class: "vue3-tutorial__step" },
                h("header", { class: "vue3-tutorial__step__header" },
                    h("div", { class: "vue3-tutorial__step__header__title" }, stepDesc.title),
                    h("div", { class: "vue3-tutorial__step__header__status" }, label('stepState', {
                        currentStep: information.currentIndex + 1,
                        totalStep: information.nbTotalSteps,
                    }))),
                h("div", { class: "vue3-tutorial__step__content" },
                    h(Markdown$1, { source: stepDesc.content })),
                h("nav", { class: "vue3-tutorial__step__commands" },
                    this.displayPreviousButton && (h("button", { class: "vue3-tutorial__step__btn vue3-tutorial__step__btn-previous", on: {
                            click: () => this.$emit('previous'),
                        } }, label('previousButton'))),
                    this.displaySkipButton && (h("button", { class: "vue3-tutorial__step__btn vue3-tutorial__step__btn-skip", on: {
                            click: () => this.$emit('skip'),
                        }, title: label('skipButtonTitle') }, "\u00D7")),
                    this.displayNextButton && (h("button", { class: "vue3-tutorial__step__btn vue3-tutorial__step__btn-next", on: {
                            click: () => this.$emit('next'),
                        } }, label('nextButton'))),
                    this.displayFinishButton && (h("button", { class: "vue3-tutorial__step__btn vue3-tutorial__step__btn-finish", on: {
                            click: () => this.$emit('finish'),
                        } }, label('finishButton')))))));
    }
};
__decorate$1([
    Prop()
], VStep.prototype, "step", void 0);
__decorate$1([
    Prop()
], VStep.prototype, "tutorialInformation", void 0);
__decorate$1([
    Watch('fullOptions.texts')
], VStep.prototype, "onTextsChange", null);
__decorate$1([
    Watch('fullOptions.bindings', { immediate: true, deep: true })
], VStep.prototype, "onBindingsChange", null);
__decorate$1([
    Watch('nextActionTarget'),
    Watch('nextActionType', { immediate: true })
], VStep.prototype, "onActionTypeChange", null);
__decorate$1([
    Watch('targetElements', { deep: true }),
    Watch('maskElements', { deep: true }),
    Watch('arrowElements', { deep: true })
], VStep.prototype, "onPositionElementsChange", null);
__decorate$1([
    Watch('targetBoxes')
], VStep.prototype, "onElementsBoxChange", null);
__decorate$1([
    Watch('targetElementsOrdered')
], VStep.prototype, "onElementsChange", null);
__decorate$1([
    Watch('highlightElements', { deep: true })
], VStep.prototype, "onHighlightElementsChange", null);
__decorate$1([
    Watch('mainElement')
], VStep.prototype, "onMainElementChange", null);
__decorate$1([
    Watch('step.desc.target', { immediate: true, deep: true })
], VStep.prototype, "onStepTargetChange", null);
__decorate$1([
    Watch('isStepReady')
], VStep.prototype, "onReadyChange", null);
__decorate$1([
    Emits(['finish', 'next', 'previous', 'skip'])
], VStep.prototype, "render", null);
VStep = __decorate$1([
    Component
], VStep);
var VStep$1 = VStep;

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "/* {{{ variables */\n\n:root {\n    /** Main color used for component */\n    --vue3-tutorial-brand-primary: #42b883;\n\n    /** Secondary color used for contrast */\n    --vue3-tutorial-brand-secondary: #2c3e50;\n\n    /** zIndex used by popup window for the tips. It should be higher than\n     * your other components\n     * The mask will use this value.\n     * The arrow will use this value + 10;\n     * The pop-up window will use this value + 20;\n     */\n    --vue3-tutorial-zindex: 1000;\n\n    /** The background color of the step window */\n    --vue3-tutorial-step-bg-color: var(--vue3-tutorial-brand-primary);\n    /** The text color of step window */\n    --vue3-tutorial-step-text-color: white;\n\n    /** The background color of the header of step window */\n    --vue3-tutorial-step-header-bg-color: var(--vue3-tutorial-brand-secondary);\n    /** The text color of the header of step window */\n    --vue3-tutorial-step-header-text-color: var(--vue3-tutorial-step-text-color);\n\n    /** The shadow style of the popup-window */\n    --vue3-tutorial-window-shadow: 2px 5px 15px black;\n\n    /** The shadow style of the highlighted element */\n    --vue3-tutorial-highlight-shadow: 0 0 10px var(--vue3-tutorial-brand-primary), inset 0 0 10px var(--vue3-tutorial-brand-primary);\n\n    /** The mask fill color */\n    --vue3-tutorial-mask-color: #c8c8c8bb;\n\n    /** Text color of the \"info\" quote */\n    --vue3-tutorial-info-text-color: #000000;\n\n    /** Border color of the \"info\" quote */\n    --vue3-tutorial-info-border-color: #759fcd;\n\n    /** Background color of the \"info\" quote */\n    --vue3-tutorial-info-bg-color: #b4c8ed;\n\n    /** Text color of the \"warning\" quote */\n    --vue3-tutorial-warning-text-color: #000000;\n\n    /** Border color of the \"warning\" quote */\n    --vue3-tutorial-warning-border-color: #f5b95c;\n\n    /** Background color of the \"warning\" quote */\n    --vue3-tutorial-warning-bg-color: #fff7e6;\n\n    /** Text color of the \"danger\" quote */\n    --vue3-tutorial-danger-text-color: #000000;\n\n    /** Border color of the \"danger\" quote */\n    --vue3-tutorial-danger-border-color: #ff4949;\n\n    /** Background color of the \"danger\" quote */\n    --vue3-tutorial-danger-bg-color: #fde2e2;\n}\n\n/* }}} */\n/* {{{ animations */\n\n@keyframes v3-tutorial-verticalWave {\n    from {margin-top: -3px;}\n    to {margin-top: 3px;}\n}\n\n@keyframes v3-tutorial-horizontalWave {\n    from {margin-left: -3px;}\n    to {margin-left: 3px;}\n}\n\n/* }}} */\n/* {{{ Window */\n\n.vue3-tutorial__window {\n    position: fixed;\n    left: var(--vue3-tutorial-x, 50%);\n    top: var(--vue3-tutorial-y, 50%);\n    z-index: calc(var(--vue3-tutorial-zindex) + 20);\n    box-shadow: var(--vue3-tutorial-window-shadow);\n    border-radius: 3px;\n    --vue3-tutorial-priv-window-margin: 20px;\n\n    min-width: 150px;\n\n    transition-property: top, left;\n    transition-duration: 250ms;\n}\n.vue3-tutorial__window.position-top {\n    transform: translate(-50%, calc(-100% - var(--vue3-tutorial-priv-window-margin)));\n}\n.vue3-tutorial__window.position-bottom {\n    transform: translate(-50%, var(--vue3-tutorial-priv-window-margin));\n}\n.vue3-tutorial__window.position-left {\n    transform: translate(calc(-100% - var(--vue3-tutorial-priv-window-margin)), -50%);\n}\n.vue3-tutorial__window.position-right {\n    transform: translate(var(--vue3-tutorial-priv-window-margin), -50%);\n}\n.vue3-tutorial__window.position-center {\n    transform: translate(-50%, -50%);\n}\n.vue3-tutorial__window.position-hidden {\n    display: none;\n}\n\n.vue3-tutorial__window-arrow,\n.vue3-tutorial__window-scroll-arrow {\n    position: fixed;\n    z-index: calc(var(--vue3-tutorial-zindex) + 10);\n    fill: var(--vue3-tutorial-brand-primary);\n    stroke: var(--vue3-tutorial-brand-secondary);\n}\n.vue3-tutorial__window-arrow.animation,\n.vue3-tutorial__window-scroll-arrow.animation {\n    animation-timing-function: ease-in-out;\n    animation-duration: 0.75s;\n    animation-iteration-count: infinite;\n    animation-direction: alternate;\n}\n.vue3-tutorial__window-arrow.position-top {\n    transform: translate(-50%, -100%)  rotate(-135deg);\n    animation-name: v3-tutorial-verticalWave;\n}\n.vue3-tutorial__window-arrow.position-bottom {\n    transform: translate(-50%) rotate(45deg);\n    animation-name: v3-tutorial-verticalWave;\n}\n.vue3-tutorial__window-arrow.position-left {\n    transform: translate(-100%, -50%) rotate(135deg);\n    animation-name: v3-tutorial-horizontalWave;\n}\n.vue3-tutorial__window-arrow.position-right {\n    transform: translate(0, -50%) rotate(-45deg);\n    animation-name: v3-tutorial-horizontalWave;\n}\n.vue3-tutorial__window-arrow.position-center {\n    display: none;\n}\n\n.vue3-tutorial__window-scroll-arrow.position-top {\n    transform: translate(-50%) rotate(45deg);\n    animation-name: v3-tutorial-verticalWave;\n}\n.vue3-tutorial__window-scroll-arrow.position-bottom {\n    transform: translate(-50%, -100%)  rotate(-135deg);\n    animation-name: v3-tutorial-verticalWave;\n}\n.vue3-tutorial__window-scroll-arrow.position-left {\n    transform: translate(0, -50%) rotate(-45deg);\n    animation-name: v3-tutorial-horizontalWave;\n}\n.vue3-tutorial__window-scroll-arrow.position-right {\n    transform: translate(-100%, -50%) rotate(135deg);\n    animation-name: v3-tutorial-horizontalWave;\n}\n.vue3-tutorial__window-scroll-arrow.position-center,\n.vue3-tutorial__window-scroll-arrow.position-visible {\n    display: none;\n}\n\n.vue3-tutorial__svg-mask {\n    position: fixed;\n    top: 0;\n    left: 0;\n    bottom: 100%;\n    right: 100%;\n    z-index: var(--vue3-tutorial-zindex);\n    pointer-events: none;\n}\n.vue3-tutorial__mask {\n    fill: var(--vue3-tutorial-mask-color);\n    stroke: none;\n    pointer-events: fill;\n}\n\n/* }}} */\n/* {{{ Step */\n\n.vue3-tutorial__step {\n    background-color: var(--vue3-tutorial-step-bg-color);\n    background-image: radial-gradient( 70% 50% at 50% 42px, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100% );\n    color: var(--vue3-tutorial-step-text-color);\n    padding: 1rem;\n    border-radius: 3px;\n}\n\n.vue3-tutorial__step__header {\n    background-color: var(--vue3-tutorial-step-header-bg-color);\n    color: var(--vue3-tutorial-step-header-text-color);\n    background-image: radial-gradient( 70% 50% at 50% 100%, rgba(255, 255, 255, 0.2) 0%, rgba(200, 200, 200, 0) 100% );\n    text-align: center;\n    padding: 0.5rem;\n    margin-top: -1rem;\n    margin-left: -1rem;\n    margin-right: -1rem;\n    border-radius: 3px;\n}\n\n.vue3-tutorial__step__header__title {\n    font-weight: 300;\n}\n\n.vue3-tutorial__step__header__status {\n    font-size: 0.7em;\n    font-style: italic;\n    opacity: 0.8;\n}\n\n.vue3-tutorial__step__content {\n    margin: 1rem 0 1rem 0;\n}\n\n.vue3-tutorial__step__btn {\n    background: transparent;\n    border: 0.05rem solid var(--vue3-tutorial-step-text-color);\n    border-radius: 0.1rem;\n    color: var(--vue3-tutorial-step-text-color);\n    cursor: pointer;\n    display: inline-block;\n    font-size: 0.8rem;\n    height: 1.8rem;\n    line-height: 1rem;\n    outline: none;\n    margin: 0 0.2rem;\n    padding: 0.35rem 0.4rem;\n    text-align: center;\n    text-decoration: none;\n    transition: all 0.2s ease;\n    vertical-align: middle;\n    white-space: nowrap;\n}\n\n.vue3-tutorial__step__btn-skip {\n    position: absolute;\n    top: 1px;\n    right: 1px;\n    font-size: 32px;\n    width: 32px;\n    height: 32px;\n    border-radius: 32px;\n    padding: 0 3px 0 3px;\n    transform: translate(calc(50% - 5px), calc(-50% + 9px)) scale(0.4);\n    transition: transform 600ms;\n}\n.vue3-tutorial__step__btn-skip:hover {\n    transform: translate(calc(50% - 5px), calc(-50% + 9px)) scale(0.7);\n}\n\n/* }}} */\n/* {{{ Markdown */\n\n.vue3-tutorial-md-bold {\n    font-weight: bold;\n}\n.vue3-tutorial-md-italic {\n    font-style: italic;\n}\n.vue3-tutorial-md-strike {\n    text-decoration: line-through;\n}\n\n.vue3-tutorial-md-multiline-code {\n    background-color: var(--vue3-tutorial-brand-secondary);\n    color:white;\n    padding: 0.5em;\n}\n\n.vue3-tutorial-md-indent {\n    display: inline-block;\n    width: 2em;\n}\n\n.vue3-tutorial-md-color {\n    color: var(--color);\n}\n\n/* {{{ Quotes */\n\n.vue3-tutorial-md-quote {\n    border-left: 2px solid;\n    padding-left: 1em;\n    margin-left: 0;\n}\n\n.vue3-tutorial-md-quote.danger,\n.vue3-tutorial-md-quote.warning,\n.vue3-tutorial-md-quote.info {\n    position: relative;\n    /* XXX: colors will be overridden by next rules */\n    border: 1px solid #000000;\n    border-left: 8px solid #000000;\n    color: var(--vue3-tutorial-step-text-color);\n    padding: 0.5em;\n    padding-left: 2em;\n}\n.vue3-tutorial-md-quote.danger:before,\n.vue3-tutorial-md-quote.warning:before,\n.vue3-tutorial-md-quote.info:before {\n    position: absolute;\n    left: 0.5em;\n    top: 50%;\n    transform: translateY(-50%);\n}\n\n.vue3-tutorial-md-quote.info {\n    color: var(--vue3-tutorial-info-text-color, inherit);\n    border-color: var(--vue3-tutorial-info-border-color);\n    background-color: var(--vue3-tutorial-info-bg-color);\n}\n.vue3-tutorial-md-quote.info:before {\n    content: '💡';\n}\n.vue3-tutorial-md-quote.warning {\n    color: var(--vue3-tutorial-warning-text-color, inherit);\n    border-color: var(--vue3-tutorial-warning-border-color);\n    background-color: var(--vue3-tutorial-warning-bg-color);\n}\n.vue3-tutorial-md-quote.warning:before {\n    content: '⚠️';\n}\n.vue3-tutorial-md-quote.danger {\n    color: var(--vue3-tutorial-danger-text-color, inherit);\n    border-color: var(--vue3-tutorial-danger-border-color);\n    background-color: var(--vue3-tutorial-danger-bg-color);\n}\n.vue3-tutorial-md-quote.danger:before {\n    content: '⛔';\n}\n\n/* }}} */\n/* {{{ Table */\n\n.vue3-tutorial-md-table {\n    width: 100%;\n    border-collapse: collapse;\n}\n.vue3-tutorial-md-th {\n    border-bottom-width: 1px;\n    border-bottom-style: solid;\n    text-align: start;\n}\n.vue3-tutorial-md-td {\n    text-align: start;\n}\n\n/* }}} */\n/* }}} */\n/* {{{ External elements */\n\n.vue3-tutorial-highlight {\n    box-shadow: var(--vue3-tutorial-highlight-shadow);\n}\n\n.vue3-tutorial-muted {\n    pointer-events: none;\n}\n\n/* }}} */\n";
styleInject(css_248z);

/* Component Purpose:
 * vue3-tutorial is a component to indicate to user which actions may
 * be done. User may do the action in order to go to the next step.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let VTutorial = class VTutorial extends Vue {
    constructor() {
        /* {{{ props */
        super(...arguments);
        /* }}} */
        /* {{{ data */
        this.currentIndex = 0;
        this.isRunning = false;
    }
    /* }}} */
    /* {{{ computed */
    get steps() {
        var _a;
        const steps = (_a = this.tutorial) === null || _a === void 0 ? void 0 : _a.steps;
        if (!steps) {
            return emptyArray;
        }
        const tutorialOptions = this.tutorialOptions;
        const length = steps.length;
        return steps.map((step, index) => {
            return getStep(step, tutorialOptions, {
                currentIndex: index,
                nbTotalSteps: length,
                previousStepIsSpecial: false,
            });
        });
    }
    get nbTotalSteps() {
        return this.steps.length;
    }
    get currentStep() {
        const step = this.steps[this.currentIndex];
        if (!step) {
            if (this.isRunning) {
                error(302, {
                    nbTotalSteps: this.nbTotalSteps,
                    index: this.currentIndex,
                });
            }
            return;
        }
        return step;
    }
    get tutorialOptions() {
        var _a;
        return mergeStepOptions(DEFAULT_STEP_OPTIONS, this.options || {}, ((_a = this.tutorial) === null || _a === void 0 ? void 0 : _a.options) || {});
    }
    get currentStepIsSpecial() {
        const step = this.currentStep;
        return !!step && !step.status.isActionNext;
    }
    get previousStepIsSpecial() {
        let step;
        let index = this.currentIndex;
        do {
            index--;
            step = this.steps[index];
        } while (step === null || step === void 0 ? void 0 : step.status.skipped);
        if (!step) {
            return true;
        }
        return !step.status.isActionNext;
    }
    /* }}} */
    /* {{{ watch */
    onOpenChange() {
        if (this.open) {
            this.start();
        }
    }
    onStepsChange() {
        if (!this.tutorial) {
            this.stop();
            return;
        }
        this.start();
    }
    /* }}} */
    /* {{{ methods */
    /* {{{ navigation */
    async findStep(oldIndex, upDirection = true) {
        let newIndex = oldIndex;
        const nbTotalSteps = this.nbTotalSteps;
        const steps = this.steps;
        let step;
        try {
            let isSkipped;
            do {
                if (upDirection) {
                    if (newIndex >= nbTotalSteps - 1) {
                        this.stop(nbTotalSteps > 0);
                        return -1;
                    }
                    newIndex++;
                }
                else {
                    if (newIndex <= 0) {
                        error(204);
                        return -1;
                    }
                    newIndex--;
                }
                step = steps[newIndex];
                if (upDirection) {
                    /* When moving forward, we check the skipped status */
                    isSkipped = await step.checkSkipped();
                }
                else {
                    /* When moving backward, we reuse the previous skipped status */
                    isSkipped = step.status.skipped;
                }
            } while (isSkipped);
        }
        catch (err) {
            error(202, {
                index: this.currentIndex,
                fromIndex: oldIndex,
                error: err,
            });
            return -1;
        }
        return newIndex;
    }
    async start() {
        if (!this.tutorial) {
            error(303);
            this.stop(false);
            return;
        }
        if (this.isRunning) {
            /* The tutorial is already started */
            return;
        }
        this.isRunning = true;
        const currentIndex = await this.findStep(-1, true);
        this.currentIndex = currentIndex;
        if (currentIndex === -1) {
            error(203);
            this.isRunning = false;
            return;
        }
        this.$emit('start', currentIndex);
        startListening(this.onKeyEvent.bind(this));
        debug(2, this.tutorialOptions, { currentIndex });
    }
    async nextStep(forceNext = false) {
        if (!this.isRunning) {
            return;
        }
        if (!forceNext && this.currentStepIsSpecial) {
            return;
        }
        const oldIndex = this.currentIndex;
        const currentIndex = await this.findStep(oldIndex, true);
        if (currentIndex > -1) {
            this.currentIndex = currentIndex;
            this.$emit('nextStep', currentIndex, oldIndex);
            this.$emit('changeStep', currentIndex, oldIndex);
        }
    }
    async previousStep(forcePrevious = false) {
        if (!this.isRunning) {
            return;
        }
        if (!forcePrevious && this.previousStepIsSpecial) {
            return;
        }
        const oldIndex = this.currentIndex;
        const currentIndex = await this.findStep(oldIndex, false);
        if (currentIndex > -1) {
            this.currentIndex = currentIndex;
            this.$emit('previousStep', currentIndex, oldIndex);
            this.$emit('changeStep', currentIndex, oldIndex);
        }
    }
    /** isFinished is true if the tutorial is completed */
    stop(isFinished = false) {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        this.$emit('stop', isFinished);
        stopListening();
        debug(3, this.tutorialOptions, { currentIndex: this.currentIndex });
    }
    skip() {
        if (!confirm(label('skipConfirm'))) {
            return;
        }
        this.stop();
    }
    /* }}} */
    onKeyEvent(action) {
        switch (action) {
            case 'next':
                this.nextStep();
                break;
            case 'previous':
                this.previousStep();
                break;
            case 'skip':
                this.skip();
                break;
        }
    }
    /* }}} */
    /* {{{ Life cycle */
    mounted() {
        registerError((err) => {
            var _a, _b;
            const errEmitted = Object.assign({
                tutorialName: (_b = (_a = this.tutorial) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '',
                stepIndex: this.currentIndex,
            }, err);
            this.$emit('error', errEmitted);
        });
        debug(0, this.tutorialOptions, {
            open: this.open,
            tutorial: this.tutorial,
        });
    }
    unmounted() {
        unRegisterError();
        debug(1, this.tutorialOptions, {
            open: this.open,
            tutorial: this.tutorial,
        });
    }
    /* }}} */
    render() {
        const step = this.currentStep;
        if (!this.isRunning || !step) {
            return;
        }
        return (h(VStep$1, { step: step, tutorialInformation: {
                currentIndex: this.currentIndex,
                nbTotalSteps: this.nbTotalSteps,
                previousStepIsSpecial: this.previousStepIsSpecial,
            }, on: {
                previous: () => this.previousStep(true),
                next: () => this.nextStep(true),
                finish: () => this.nextStep(true),
                skip: () => this.skip(),
            } }));
    }
};
__decorate([
    Prop()
], VTutorial.prototype, "tutorial", void 0);
__decorate([
    Prop()
], VTutorial.prototype, "options", void 0);
__decorate([
    Prop({ default: false })
], VTutorial.prototype, "open", void 0);
__decorate([
    Watch('open', { immediate: true })
], VTutorial.prototype, "onOpenChange", null);
__decorate([
    Watch('steps')
], VTutorial.prototype, "onStepsChange", null);
__decorate([
    Emits(['changeStep', 'error', 'nextStep', 'previousStep', 'start', 'stop'])
], VTutorial.prototype, "render", null);
VTutorial = __decorate([
    Component
], VTutorial);
var VTutorial$1 = VTutorial;

export { VTutorial$1 as default, errorStatus };
