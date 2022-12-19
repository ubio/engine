import { RemoteElementInfo } from '../../cdp/index.js';
import { DomExtractPipe } from './_extract.js';

export class DomTextContent extends DomExtractPipe {
    static $type = 'DOM.getTextContent';
    static override $help = `
Returns \`textContent\` DOM property of elements.

### Use For

- reading \`textContent\` specifically
  (i.e. when fallback logic of Extract Text produces incorrect or unwanted results)
`;

    getDatum(info: RemoteElementInfo) {
        return info.textContent;
    }
}
