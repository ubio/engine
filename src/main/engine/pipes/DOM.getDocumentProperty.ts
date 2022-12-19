import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';

export class DomDocumentProperty extends Pipe {
    static $type = 'DOM.getDocumentProperty';
    static override $help = `
Retrieves specified property from the element's owner document.

### Use For

- accessing current url
- accessing referrer to compose network requests
- accessing current page title
- accessing other document properties for advanced scripting
`;

    @params.Enum({
        enum: [
            'URL',
            'domain',
            'referrer',
            'cookie',
            'title',
            'dir',
            'lastModified',
            'characterSet',
            'contentType',
            'readyState',
        ],
    })
    property: string = 'URL';

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const property = this.property;

        return this.map(inputSet, async el => {
            const data = await el.evaluateJson((el, property) => {
                const ownerDocument = el.nodeType === 9 ? el : el.ownerDocument;
                return ownerDocument[property];
            }, property);
            return el.clone(data == null ? null : data);
        });
    }
}
