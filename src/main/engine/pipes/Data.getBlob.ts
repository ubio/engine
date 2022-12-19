import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import { BlobEncoding, BlobService } from '../services/index.js';
import * as util from '../util/index.js';

export class DataGetBlob extends Pipe {
    static $type = 'Data.getBlob';
    static override $help = `
Returns blob content in a specified encoding.

Input value must be a Blob object, returned by Send Network Request action with "blob" response type.

Caution: decoding large blobs may result in decreased application and engine performance.

### Use For

- sending base64 encoded blobs as part of Send Network Request action
`;

    @params.Enum({
        enum: Object.values(BlobEncoding),
    })
    encoding: BlobEncoding = BlobEncoding.BINARY;

    get $blobs() {
        return this.$engine.get(BlobService);
    }

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const encoding = this.encoding;
        return this.map(inputSet, async el => {
            util.checkType(el.value, 'object');
            util.checkType(el.value.blobId, 'string', 'blobId');
            const buffer = await this.$blobs.readBlob(el.value.blobId);
            return el.clone(buffer.toString(encoding as BufferEncoding));
        });
    }
}
