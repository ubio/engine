import { RemoteElementInfo } from '../../cdp/index.js';
import { DomExtractPipe } from './_extract.js';

export class DomInnerText extends DomExtractPipe {
    static $type = 'DOM.getInnerText';
    static override $help = `
Returns \`innerText\` DOM property of elements.

### Use For

- reading \`innerText\` specifically
  (i.e. when fallback logic of Extract Text produces incorrect or unwanted results)
`;

    getDatum(info: RemoteElementInfo) {
        return info.innerText;
    }
}
