import * as r from '@ubio/request';
import Ajv from 'ajv';

import { Action, params, util } from '.';
import { Pipeline } from './pipeline.js';
import { JsonSchema } from './schema.js';
import { CredentialsConfig, CredentialsService } from './services/credentials.js';
import { FetchResponseSpec } from './services/index.js';

const ajv = new Ajv({
    messages: true,
});

export interface ConnectorMetadata {
    icon: string; // Action.$icon
    auth: CredentialsConfig[];
    baseUrl: string;
    docUrl?: string;
}

export type ConnectorSpec = ConnectorMetadata & {
    endpoints: ConnectorEndpoint[];
};

export interface ConnectorEndpoint {
    name: string;
    description: string;
    path: string;
    method: string;
    parameters: ConnectorParameter[];
    body?: any;
}

export interface ConnectorParameter {
    key: string;
    location: ConnectorParameterLocation;
    description?: string;
    required?: boolean; // default to false
    default?: any;
}

export type ConnectorParameterLocation = 'path' | 'query' | 'body' | 'formData' | 'header';

export function buildConnectors(namespace: string, spec: ConnectorSpec, _options = {}) {
    // validate meta only. which we throws when invalid
    const metadata: ConnectorMetadata = {
        icon: spec.icon,
        auth: spec.auth,
        baseUrl: spec.baseUrl,
        docUrl: spec.docUrl,
    };
    validateMetadata(metadata, true);

    const actions = {} as any;
    for (const endpoint of spec.endpoints) {
        const { valid } = validateEndpoint(endpoint);
        if (!valid) {
            continue;
        }
        const ConnectorActionClass = buildConnectorClass({ namespace, metadata, endpoint });
        actions[ConnectorActionClass.$type] = ConnectorActionClass;
    }

    return actions;
}

function buildConnectorClass(spec: {
    namespace: string;
    metadata: ConnectorMetadata;
    endpoint: ConnectorEndpoint;
}) {
    const { namespace, metadata, endpoint } = spec;
    const type = `${namespace}.${endpoint.name}.${endpoint.method.toLocaleLowerCase()}`;
    class ConnectorAction extends Action {
        static $type = type;
        static override $help = endpoint.description + (metadata.docUrl ? `\n\n Check documentation here: ${metadata.docUrl}` : '');
        static $icon = `${!metadata.icon.match(/http/) ? 'fab ' : ''}${metadata.icon}`;
        $baseUrl = metadata.baseUrl;
        $endpoint = endpoint;

        @params.Credentials({
            label: 'Auth',
            providerName: namespace,
            configs: metadata.auth,
        })
        auth!: CredentialsConfig | null;

        @params.Pipeline({
            label: 'Parameters',
        })
        pipeline!: Pipeline;

        @params.Outcome({
            label: 'Response',
            placeholder: 'Run the action to see the outcome value.',
        })
        $response?: FetchResponseSpec = undefined;

        @params.Outcome({
            label: 'Result',
            placeholder: 'Run the action to see the outcome value.',
        })
        $result?: any = undefined;

        override init(spec: any) {
            super.init(spec);
            this.auth = spec.auth ?? null;
            if (this.pipeline.length === 0) {
                this.pipeline = new Pipeline(this, 'pipeline', getPipeline(this.$endpoint));
            }
        }

        get $credentials() { return this.$engine.get(CredentialsService); }

        override reset() {
            super.reset();
            this.$response = undefined;
            this.$result = undefined;
        }

        async exec() {
            // evaluate the parameters pipeline
            const data = await this.retry(async () => {
                const el = await this.selectOne(this.pipeline);
                return el.value;
            });
            util.checkType(data, 'object', 'Parameters');
            const { options, path } = this.getRequestSpec(data);
            const { method } = this.$endpoint;
            const auth = await this.$credentials.getAuthAgent(this.auth);
            const request = new r.Request({
                baseUrl: this.$baseUrl,
                auth,
            });
            const res = await request.sendRaw(method, path, options);
            this.$response = await parseResponse(res);
            this.$result = this.$response.body;
        }

        // compose request options and path by reading location and type of the parameters
        getRequestSpec(evaluatedParams: any) {
            let isFormData = false;
            let path = this.$endpoint.path;
            const options: r.RequestOptions = {
                headers: {
                    'content-type': 'application/json',
                    ...(evaluatedParams.headers ?? {}),
                },
                body: evaluatedParams.body ?? null
            };
            // merge the evaluated parameters with parameter definitions from the spec
            for (const param of this.$endpoint.parameters) {
                const { key } = param;
                let val = evaluatedParams[key] ?? param.default;

                // check params are delivered by headers or body object
                if (!val && param.location === 'header') {
                    val = options.headers![key] ?? undefined;
                }
                if (!val && param.location === 'body') {
                    val = options.body && options.body[key] ? options.body[key] : undefined;
                }
                if (val === undefined) {
                    if (param.required) {
                        throw util.createError({
                            code: 'ParameterValidationError',
                            message: `Parameter \`${key}\` is required`,
                            details: {
                                parameters: evaluatedParams
                            },
                            retry: false,
                        });
                    }
                    continue;
                }
                switch (param.location) {
                    case 'header':
                        options.headers = { ...options.headers, [key]: val };
                        break;
                    case 'query':
                        options.query = { ...options.query, [key]: val };
                        break;
                    case 'path':
                        path = path.replace(`{${key}}`, val); // spec must specify the path param with curly bracket e.g. /foo/{key}/bar
                        break;
                    case 'body':
                        options.body = { ...options.body, [key]: val };
                        break;
                    case 'formData':
                        isFormData = true;
                        options.body = { ...options.body, [key]: val };
                        break;
                }
            }
            // convert body
            if (isFormData) {
                options.headers!['content-type'] = 'application/x-www-form-urlencoded';
                const formData = new URLSearchParams(options.body ?? {});
                options.body = formData.toString();
            } else {
                options.body = options.body != null ? JSON.stringify(options.body) : null;
            }
            return { options, path };
        }
    }

    return ConnectorAction;
}

async function parseResponse(res: Response) {
    const response: FetchResponseSpec = {
        url: res.url,
        status: res.status,
        statusText: res.statusText,
        headers: {},
        body: null,
    };
    for (const [k, v] of res.headers) {
        response.headers[k.toLowerCase()] = v;
    }
    if (response.headers['content-type'].includes('application/json')) {
        response.body = await res.json();
    } else {
        response.body = await res.text();
    }

    return response;
}

const endpointSchema: JsonSchema = {
    type: 'object',
    required: [
        'name', 'description', 'path',
        'method', 'parameters'
    ],
    properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        path: { type: 'string' },
        method: { type: 'string' },
        parameters: {
            type: 'array',
            items: {
                type: 'object',
                required: ['key', 'location'],
                properties: {
                    key: { type: 'string' },
                    location: {
                        type: 'string',
                        enum: ['path', 'query', 'body', 'formData', 'header']
                    },
                    description: { type: 'string' },
                    required: { type: 'boolean', default: false },
                    default: {} // any
                },
            }
        },
    },
};

const metadataSchema: JsonSchema = {
    type: 'object',
    required: ['auth', 'baseUrl', 'icon'],
    properties: {
        icon: { type: 'string' },
        baseUrl: { type: 'string' },
        auth: {
            type: 'array',
            items: {
                type: 'object',
                required: ['type'],
                properties: {
                    type: { type: 'string', enum: ['basic', 'bearer', 'oauth1', 'oauth2'] },
                    // auth agent specific properties...
                }
            }
        },
        docUrl: { type: 'string' }
    }
};

function validate(schema: JsonSchema, value: any, throwInvalid: boolean = false) {
    const validator = ajv.compile(schema);
    const valid = validator(value);
    if (!valid && throwInvalid) {
        throw util.createError({
            code: 'ValidationError',
            message: 'Spec does not conform to schema',
            details: {
                messages: validator.errors?.map(_ => _.schemaPath + ': ' + _.message),
            },
            retry: false,
        });
    }
    return {
        valid,
        details: validator.errors,
    };
}

export function validateMetadata(value: any, throwInvalid: boolean = false) {
    return validate(metadataSchema, value, throwInvalid);
}

export function validateEndpoint(value: any, throwInvalid: boolean = false) {
    return validate(endpointSchema, value, throwInvalid);
}

function getPipeline(endpoint: ConnectorEndpoint) {
    const pipeline: any = [
        {
            type: 'Value.getJson',
            value: getParametersJsonString(endpoint.parameters),
        }
    ];

    // Some complicated body parameters can not be described as parameters (e.g. nested object)
    // In that case add spec can specify arbitrary `body` and when the connector runs, it will use this value
    // if the key was specified in Parameters, the value provided by parameter precedence over the value in `body`.
    if (endpoint.body) {
        const body = [
            '// Body for this endpoint.',
            '// Please take a look at the documentation for the detailed schema',
        ];
        body.push(JSON.stringify(endpoint.body, null, 2));
        pipeline.push({
            type: 'Object.setPath',
            path: '/body',
            pipeline: [{
                type: 'Value.getJson',
                value: body.join('\n'),
            }]
        });
    }
    return pipeline;
}

// builds the Value.getJson to document the parameters for an endpoint
function getParametersJsonString(params: ConnectorParameter[]) {
    const str = [
        '// Parameters for this endpoint are shown below. ',
        '// Use Object.setPath or Object.compose to set values. ',
        '{',
    ];
    params.forEach(param => {
        const defaultValue = typeof param.default === 'string' ? `"${param.default}"` : param.default;
        str.push(`  "${param.key}": ${defaultValue ?? null}, // ${param.required ? '*' : ''}${param.description}`);
    });
    str.push('}');
    return str.join('\n');
}
