import { Action, params, Pipeline } from '../model/index.js';
import { JsonSchema } from '../schema.js';
import { BlobEncoding, BlobService } from '../services/index.js';

export class DataSetBlob extends Action {
    static $type = 'Data.setBlob';
    static $icon = 'fas fa-database';
    static override $help = `
Computes a pipeline, storing a result as a blob with specified encoding.

The pipeline should evaluate to object with following structure:

- \`filename\` (string) — filename of blob
- \`content\` (string) — string content in encoding as specified by \`encoding\` parameter

The blob can subsequently be obtained using \`Data.getBlob\` pipe.
`;
    static override $schema: JsonSchema = {
        type: 'object',
        required: ['filename', 'content'],
        properties: {
            filename: { type: 'string' },
            content: { type: 'string' },
        },
    };

    @params.Pipeline()
    pipeline!: Pipeline;

    @params.Outcome({
        label: 'Result',
        placeholder: 'Run the action to see the outcome value.',
    })
    $outcome: any = undefined;

    @params.Enum({
        enum: Object.values(BlobEncoding),
    })
    encoding: BlobEncoding = BlobEncoding.BINARY;

    get $blobs() {
        return this.$engine.get(BlobService);
    }

    override reset() {
        super.reset();
        this.$outcome = undefined;
    }

    async exec() {
        await this.retry(async () => {
            const el = await this.selectOne(this.pipeline);
            const { filename, content } = this.validate(el.value);
            const buffer = Buffer.from(content, this.encoding as any);
            this.$outcome = await this.$blobs.createBlob(filename, buffer);
        });
    }
}
