import { RemoteElementInfo } from '../../cdp/index.js';
import { DomExtractPipe } from './_extract.js';

export class DomIsDisabled extends DomExtractPipe {
    static $type = 'DOM.isDisabled';
    static override $help = `
For each element returns the value of its \`disabled\` DOM property.

### Use For

- asserting that buttons or other form controls are interactable
`;

    getDatum(info: RemoteElementInfo) {
        return info.disabled;
    }
}
