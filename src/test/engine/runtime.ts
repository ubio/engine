import { promises as fs } from 'fs';
import json5 from 'json5';
import path from 'path';

import {
    CheckpointService,
    GlobalsService,
    ProxyService,
    RegistryService,
    ResolverService,
    Script,
    TestRig,
} from '../../main/index.js';
import { CheckpointServiceMock } from './mocks/checkpoint.js';
import { RegistryServiceMock } from './mocks/registry.js';

export class TestRuntime extends TestRig {

    baseUrl: string = process.env.TEST_SERVER_URL || 'http://localhost:3007';

    override setupEngine() {
        super.setupEngine();

        this.engine.container.bind(CheckpointServiceMock).toSelf().inSingletonScope();
        this.engine.container.rebind(CheckpointService).toService(CheckpointServiceMock);

        this.engine.container.bind(RegistryServiceMock).toSelf().inSingletonScope();
        this.engine.container.rebind(RegistryService).toService(RegistryServiceMock);
    }

    get $resolver() {
        return this.engine.get(ResolverService);
    }

    get $globals() {
        return this.engine.get(GlobalsService);
    }

    get $checkpoints() {
        return this.engine.get(CheckpointServiceMock);
    }

    get $proxy() {
        return this.engine.get(ProxyService);
    }

    get $registry() {
        return this.engine.get(RegistryServiceMock);
    }

    getUrl(url: string): string {
        return `${this.baseUrl}${url}`;
    }

    async goto(url: string, options?: any) {
        await this.page.navigate(this.getUrl(url), options);
    }

    async getScript(name: string): Promise<Script> {
        const file = path.resolve(process.cwd(), 'src/test/engine/scripts', name + '.json5');
        const txt = await fs.readFile(file, 'utf-8');
        const json = json5.parse(txt);
        return this.createScript(json);
    }

    getAssetFile(relPath: string) {
        return path.join(process.cwd(), 'src/test/assets', relPath);
    }
}

export const runtime = new TestRuntime();
