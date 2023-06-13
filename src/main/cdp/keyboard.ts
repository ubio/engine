export interface KeyCodeInformation {
    key: string;
    chars: string;
    keyCode: number;
    code: string;
}

export const keyDescriptions: Array<KeyCodeInformation> = [
    { key: 'Backspace', chars: '\b', keyCode: 8, code: 'Backspace' },
    { key: 'Tab', chars: '\t', keyCode: 9, code: 'Tab' },
    { key: 'Enter', chars: '\n', keyCode: 13, code: 'Enter' },
    { key: ' ', chars: ' ', keyCode: 32, code: 'Space' },
    { key: '`', chars: '`~', keyCode: 192, code: 'Backquote' },
    { key: '1', chars: '1!¡⁄', keyCode: 49, code: 'Digit1' },
    { key: '2', chars: '2@™€', keyCode: 50, code: 'Digit2' },
    { key: '3', chars: '3#£‹', keyCode: 51, code: 'Digit3' },
    { key: '4', chars: '4$¢›', keyCode: 52, code: 'Digit4' },
    { key: '5', chars: '5%∞ﬁ', keyCode: 53, code: 'Digit5' },
    { key: '6', chars: '6^§ﬂ', keyCode: 54, code: 'Digit6' },
    { key: '7', chars: '7&¶‡', keyCode: 55, code: 'Digit7' },
    { key: '8', chars: '8*•°', keyCode: 56, code: 'Digit8' },
    { key: '9', chars: '9(ª·', keyCode: 57, code: 'Digit9' },
    { key: '0', chars: '0)º‚', keyCode: 48, code: 'Digit0' },
    { key: '-', chars: '-_–—', keyCode: 189, code: 'Minus' },
    { key: '=', chars: '=+≠±', keyCode: 187, code: 'Equal' },
    { key: 'q', chars: 'qQœŒйЙ', keyCode: 81, code: 'KeyQ' },
    { key: 'w', chars: 'wW∑„цЦ', keyCode: 87, code: 'KeyW' },
    { key: 'e', chars: 'eE´´уУ', keyCode: 69, code: 'KeyE' },
    { key: 'r', chars: 'rR®‰кК', keyCode: 82, code: 'KeyR' },
    { key: 't', chars: 'tT†ˇеЕ', keyCode: 84, code: 'KeyT' },
    { key: 'y', chars: 'yY¥ÁнН', keyCode: 89, code: 'KeyY' },
    { key: 'u', chars: 'uU¨¨гГ', keyCode: 85, code: 'KeyU' },
    { key: 'i', chars: 'iIˆˆшШ', keyCode: 73, code: 'KeyI' },
    { key: 'o', chars: 'oOøØщЩ', keyCode: 79, code: 'KeyO' },
    { key: 'p', chars: 'pPπ∏зЗ', keyCode: 80, code: 'KeyP' },
    { key: '[', chars: '[{“”хХ', keyCode: 219, code: 'BracketLeft' },
    { key: ']', chars: ']}‘’ъЪ', keyCode: 221, code: 'BracketRight' },
    { key: '\\', chars: '\\|«»', keyCode: 220, code: 'Backslash' },
    { key: 'a', chars: 'aAåÅфФ', keyCode: 65, code: 'KeyA' },
    { key: 's', chars: 'sSßÍыЫ', keyCode: 83, code: 'KeyS' },
    { key: 'd', chars: 'dD∂ÎвВ', keyCode: 68, code: 'KeyD' },
    { key: 'f', chars: 'fFƒÏаА', keyCode: 70, code: 'KeyF' },
    { key: 'g', chars: 'gG©˝пП', keyCode: 71, code: 'KeyG' },
    { key: 'h', chars: 'hH˙ÓрР', keyCode: 72, code: 'KeyH' },
    { key: 'j', chars: 'jJ∆ÔоО', keyCode: 74, code: 'KeyJ' },
    { key: 'k', chars: 'kK˚лЛ', keyCode: 75, code: 'KeyK' },
    { key: 'l', chars: 'lL¬ÒдД', keyCode: 76, code: 'KeyL' },
    { key: ';', chars: ';:…ÚжЖ', keyCode: 186, code: 'Semicolon' },
    { key: '\'', chars: '\'"æÆэЭ', keyCode: 222, code: 'Quote' },
    { key: 'z', chars: 'zZΩ¸яЯ', keyCode: 90, code: 'KeyZ' },
    { key: 'x', chars: 'xX≈˛чЧ', keyCode: 88, code: 'KeyX' },
    { key: 'c', chars: 'cCçÇсС', keyCode: 67, code: 'KeyC' },
    { key: 'v', chars: 'vV√◊мМ', keyCode: 86, code: 'KeyV' },
    { key: 'b', chars: 'bB∫ıиИ', keyCode: 66, code: 'KeyB' },
    { key: 'n', chars: 'nN˜˜тТ', keyCode: 78, code: 'KeyN' },
    { key: 'm', chars: 'mMµÂьЬ', keyCode: 77, code: 'KeyM' },
    { key: ',', chars: ',<≤¯бБ', keyCode: 188, code: 'Comma' },
    { key: '.', chars: '.>≥˘юЮ', keyCode: 190, code: 'Period' },
    { key: '/', chars: '/?÷¿ёЁ', keyCode: 191, code: 'Slash' },
];

const charToKeySpec = new Map<string, KeySpec>();

for (const keyDescription of keyDescriptions) {
    const { key, chars, keyCode, code } = keyDescription;
    for (const char of chars) {
        charToKeySpec.set(char, {
            text: char,
            key,
            code,
            keyCode,
        });
    }
}

export function lookupKey(char: string): KeySpec {
    return (
        charToKeySpec.get(char) || {
            text: char,
            key: char,
            code: 'KeyQ',
            keyCode: 81,
        }
    );
}

export interface KeySpec {
    text: string;
    key: string;
    code: string;
    keyCode: number;
}
