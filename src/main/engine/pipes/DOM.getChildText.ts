import { RemoteElementInfo } from '../../cdp/index.js';
import { DomExtractPipe } from './_extract.js';

export class DomChildText extends DomExtractPipe {
    static $type = 'DOM.getChildText';
    static override $help = `
Returns text content of direct text node children of an element, ignoring nested elements.

### Use For

- accessing text content of immediate children when semantic markup does not allow
for more precise targeting
`;

    getDatum(info: RemoteElementInfo) {
        return info.childText;
    }
}
