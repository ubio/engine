import diacritics from 'diacritics';
import levenshtein from 'fast-levenshtein';
import moment from 'moment';
import htmlSanitizer from 'sanitize-html';

export { levenshtein };

export const sanitizeOptions = {
    allowedTags: [
        'address',
        'article',
        'aside',
        'footer',
        'header',
        'hgroup',
        'nav',
        'section',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'dd',
        'dir',
        'div',
        'dl',
        'dt',
        'figcaption',
        'figure',
        'hr',
        'li',
        'main',
        'ol',
        'p',
        'pre',
        'ul',
        'a',
        'abbr',
        'b',
        'bdi',
        'bdo',
        'br',
        'cite',
        'code',
        'data',
        'dfn',
        'em',
        'i',
        'kbd',
        'mark',
        'q',
        'rb',
        'rp',
        'rt',
        'rtc',
        'ruby',
        's',
        'samp',
        'small',
        'span',
        'strong',
        'sub',
        'sup',
        'time',
        'tt',
        'u',
        'var',
        'wbr',
        'img',
        'caption',
        'col',
        'colgroup',
        'table',
        'tbody',
        'td',
        'tfoot',
        'th',
        'thead',
        'tr',
        'label',
    ],
    allowedAttributes: {
        '*': ['colspan', 'rowspan', 'align'],
        a: ['href'],
        img: ['src'],
    },
};

export function calcAge(dateOfBirth: any, presentMoment: Date = new Date()) {
    const to = moment.utc(dateOfBirth);
    const from = moment.utc(presentMoment);
    return from.diff(to, 'years');
}

export function sanitizeHtml(html: string, options: any = sanitizeOptions) {
    return htmlSanitizer(html, options);
}

export function serializeError(err: any): any {
    return {
        name: err.name,
        code: err.code,
        message: err.message,
        details: err.details,
    };
}

export function removeDiacritics(str: string) {
    return diacritics.remove(str);
}

// TODO remove
export function lowercaseKeys(object: any): any {
    return JSON.parse(
        JSON.stringify(object, (key, val) => {
            if (val && typeof val === 'object') {
                const newObj: any = {};
                for (const [k, v] of Object.entries(val)) {
                    newObj[k.toLowerCase()] = v;
                }
                return newObj;
            }
            return val;
        }),
    );
}
