import { RemoteElementInfo } from '../../cdp/index.js';
import { DomExtractPipe } from './_extract.js';

export class DomIsChecked extends DomExtractPipe {
    static $type = 'DOM.isSelected';
    static override $help = `
For each element returns the value of its \`selected\` or \`checked\` DOM property.

### Use For

- extracting boolean values of checkboxes, radio buttons and \`option\` elements
`;

    getDatum(info: RemoteElementInfo) {
        return info.nodeName === 'OPTION' ? !!info.selected : !!info.checked && !info.indeterminate;
    }
}
