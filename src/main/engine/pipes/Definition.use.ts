import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';

export class DefinitionUse extends Pipe {
    static $type = 'Definition.use';
    static override $help = `
Passes each element in input set to the specified definition, returning its output.

This pipe is a primary means of working with definitions.
It allows extracting common functionality of different pipelines as a named definition,
so that the same pipes could be reused across multiple actions.

### Use For

- extracting common functionality (e.g. inbound and outbound flight selection
  would share common parts for extracting flight information, prices, etc.)
`;

    @params.Definition()
    definitionId: string = '';

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        return await ctx.evalDefinition(this.definitionId, inputSet);
    }
}
