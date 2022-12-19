import { Exception } from '../../exception.js';
import { Action } from '../action.js';
import { params } from '../model/index.js';
import { Pipeline } from '../pipeline.js';
import { FetchRequestSpec, FetchResponseSpec, FetchService } from '../services/index.js';

export const RETRIABLE_ERRORS = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE', 'ERR_STREAM_DESTROYED'];

export class PageFetchAction extends Action {
    static $type = 'Page.fetch';
    static $icon = 'fas fa-wifi';
    static override $help = `
Sends a new network request from currently open webpage.

The request is configured using pipeline's output object (see below).
The pipeline should return a single element with object value, which configures the request.

The request follows Content Security Policy (CSP) of the current web page.
This can be a limiting factor, for example when trying to send a request to a domain which is not whitelisted
in \`Access-Control-Allow-Origin\` header (the same applies to other CORS and CSP headers).
If you are experiencing problems due to CORS and/or CSP, it is recommended to use "nodejs" or "nodejs+proxy" mode.

The request configuration object (the output value of pipeline) can consist of:

- \`method\`: HTTP request method; \`GET\`, \`POST\`, \`PUT\` or \`DELETE\` are used most commonly
- \`protocol\` (e.g. \`http:\`, \`https:\`)
- \`host\` (e.g. \`example.com\`, \`example.com: 3123\`)
- \`hostname\` (e.g. \`example.com\`)
- \`pathname\` (e.g. \`/path/to/resource\`)
- \`query\`: an object with query parameters (e.g. \`{ hello: 'world' }\`)
- \`headers\`: an object with headers (e.g. \`{ 'content-type': 'text/plain' }\`)
- \`body\`: an object which configures request body, depends on Request Body Format parameter:
  - none: the body is not included in request (the value is ignored)
  - json: the object is sent as JSON; content type header is set to \`application/json\`
    if not overridden with \`headers\`
  - urlencoded: the object is encoded in a similar way to \`query\` above and is sent in request body;
    content type header is set to \`application/x-www-form-urlencoded\` if not overridden with \`headers\`
  - multipart: the content type header is set to \`multipart/form-data\` and the request body is encoded
    as multipart/form-data stream following the rules:
      - each object key is a separate field
      - if the value is string, a text field is appended to form data
      - if the value is Blob object, the file field is appended to form data (see [Fetch Blob](#fetch-blob) for details)
  - text: the value is sent as a plain text

Note: it is handy to configure the request object using Compose pipe.

### Parameters

- mode: Fetch or XHR (Fetch is preferred, but XHR may be necessary if website replaces \`window.fetch\`
  with its own incompatible implementation)
- request body format: specifies how to treat \`/ body\` of request object (see above)
- response body format: specifies how to parse the response

### Use For

- advanced scripting, to send network requests manually
`;

    @params.Pipeline()
    pipeline!: Pipeline;

    @params.Outcome({
        label: 'Request',
        placeholder: 'Run the action to send a request.',
        hidden: true,
    })
    $request?: FetchRequestSpec = undefined;

    @params.Outcome({
        label: 'Response',
        placeholder: 'Run the action to send a request.',
    })
    $response?: FetchResponseSpec = undefined;

    @params.Enum({
        enum: ['Fetch', 'Node', 'Node+Proxy']
    })
    mode: 'Fetch' | 'Node' | 'Node+Proxy' = 'Fetch';

    @params.Boolean()
    rejectHttpErrors: boolean = true;

    @params.Enum({
        enum: ['none', 'json', 'urlencoded', 'multipart', 'text', 'base64']
    })
    requestBodyFormat: string = 'none';

    @params.Enum({
        enum: ['none', 'json', 'urlencoded', 'text', 'base64', 'blob']
    })
    responseBodyFormat: string = 'none';

    @params.Number({ min: 0 })
    timeout: number = 120000;

    @params.Number({ min: 0 })
    retries: number = 3;

    // Existing actions still rely on both request and response passed to child scope
    // This should be considered deprecated
    $result?: NetworkResult = undefined;

    get $fetch() {
        return this.$engine.get(FetchService);
    }

    override reset() {
        super.reset();
        this.$result = undefined;
        this.$request = undefined;
        this.$response = undefined;
    }

    override hasChildren() {
        return true;
    }

    override async resolveChildrenScope() {
        if (!this.$result) {
            return [];
        }
        const inputSet = await this.resolveScope();
        return inputSet.map(el => el.clone(this.$result));
    }

    override afterRun() {
        if (this.$runtime.bypassed) {
            this.skip();
        } else {
            this.enter();
        }
    }

    async exec() {
        const data = await this.retry(async () => {
            const el = await this.selectOne(this.pipeline);
            return el.value;
        });
        const requestSpec = await this.$fetch.prepareRequestSpec({
            mode: this.mode,
            requestBodyFormat: this.requestBodyFormat,
            responseBodyFormat: this.responseBodyFormat,
            timeout: this.timeout,
            retries: this.retries,
            ...data
        });
        const response = await this.$fetch.sendWithRetries(requestSpec);
        if (response!.status >= 400 && this.rejectHttpErrors) {
            throw new Exception({
                name: 'SendNetworkRequestFailed',
                message: `Request failed: HTTP ${response.status} ${response.statusText}`,
                retry: false,
            });
        }
        this.$result = {
            request: requestSpec,
            response,
        };
        this.$request = requestSpec;
        this.$response = response;
    }

}

interface NetworkResult {
    request: FetchRequestSpec;
    response: FetchResponseSpec;
}
