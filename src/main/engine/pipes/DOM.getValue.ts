import { RemoteElementInfo } from '../../cdp/index.js';
import { DomExtractPipe } from './_extract.js';

export class DomValue extends DomExtractPipe {
    static $type = 'DOM.getValue';
    static override $help = `
Returns \`value\` DOM property of elements.

### Use For

- reading \`value\` specifically
  (i.e. when fallback logic of Text produces incorrect or unwanted results)
`;

    getDatum(info: RemoteElementInfo) {
        return info.value;
    }
}
