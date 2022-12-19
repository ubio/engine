import assert from 'assert';

import { Extension } from '../../../../main/index.js';
import { runtime } from '../../runtime.js';

describe('ResolverService', () => {
    describe('dependencies', () => {
        context('dependency missing', () => {
            it('reports unmet dependencies', async () => {
                const script = runtime.createScript({
                    dependencies: [{ name: '@automationcloud/extension-test', version: '^2.0.0' }],
                });
                const unmet = [...runtime.$resolver.unmetDependencies(script.dependencies)];
                assert.deepEqual(unmet, [{
                    name: '@automationcloud/extension-test',
                    version: '^2.0.0',
                    existingVersion: null
                }]);
            });
        });

        context('dependency exists and satisfies the range', () => {
            beforeEach(async () => {
                const ext = await Extension.load(runtime.getAssetFile('extensions/test'));
                ext.spec.version = '2.0.5';
                runtime.$resolver.addExtension(ext);
            });

            it('reports no unmet dependencies', async () => {
                const script = runtime.createScript({
                    dependencies: [{ name: '@automationcloud/extension-test', version: '^2.0.0' }],
                });
                const unmet = [...runtime.$resolver.unmetDependencies(script.dependencies)];
                assert.deepEqual(unmet, []);
            });
        });

        context('dependency exists, but above semver range', () => {
            beforeEach(async () => {
                const ext = await Extension.load(runtime.getAssetFile('extensions/test'));
                ext.spec.version = '3.0.0';
                runtime.$resolver.addExtension(ext);
            });

            it('reports the dependency as unmet', async () => {
                const script = runtime.createScript({
                    dependencies: [{ name: '@automationcloud/extension-test', version: '^2.0.0' }],
                });
                const unmet = [...runtime.$resolver.unmetDependencies(script.dependencies)];
                assert.deepEqual(unmet, [{
                    name: '@automationcloud/extension-test',
                    version: '^2.0.0',
                    existingVersion: '3.0.0',
                }]);
            });
        });

        context('dependency exists, but below semver range', () => {
            beforeEach(async () => {
                const ext = await Extension.load(runtime.getAssetFile('extensions/test'));
                ext.spec.version = '1.0.5';
                runtime.$resolver.addExtension(ext);
            });

            it('reports the dependency as unmet', async () => {
                const script = runtime.createScript({
                    dependencies: [{ name: '@automationcloud/extension-test', version: '^2.0.0' }],
                });
                const unmet = [...runtime.$resolver.unmetDependencies(script.dependencies)];
                assert.deepEqual(unmet, [{
                    name: '@automationcloud/extension-test',
                    version: '^2.0.0',
                    existingVersion: '1.0.5',
                }]);
            });
        });
    });
});
