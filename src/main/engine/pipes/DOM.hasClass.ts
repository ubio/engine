import { RemoteElementInfo } from '../../cdp/index.js';
import { params } from '../model/index.js';
import { DomExtractPipe } from './_extract.js';

export class DomHasClass extends DomExtractPipe {
    static $type = 'DOM.hasClass';
    static override $help = `
Returns \`true\` if element contains specified class name, false otherwise.

### Use For

- filtering
- reading boolean state from class names
`;

    @params.String({
        source: 'classList',
        showInHeader: true,
    })
    className: string = '';

    getDatum(info: RemoteElementInfo) {
        const className = this.className;
        return info.classList.includes(className);
    }
}
