import assert from 'assert';
import { promises as fs } from 'fs';
import glob from 'glob';
import os from 'os';
import path from 'path';
import rimraf from 'rimraf';
import tar from 'tar';

import { Action, ActionInspection, Extension, InspectionLevel } from '../../../main/index.js';
import { runtime } from '../runtime.js';

describe('Extension', () => {

    const tmpDir = path.join(os.tmpdir(), 'engine/test/extensions');

    beforeEach(async () => {
        rimraf.sync(tmpDir);
        await fs.mkdir(tmpDir, { recursive: true });
    });

    it('creates an extension tarball', async () => {
        const extensionDir = runtime.getAssetFile('extensions/test');
        const tarballFile = path.join(tmpDir, 'test.tar');
        await Extension.packExtensionBundle(extensionDir, tarballFile);

        // Now let's extract it and see what's inside
        const dir = path.join(tmpDir, 'extracted');
        await fs.mkdir(dir, { recursive: true });
        await tar.x({
            file: tarballFile,
            cwd: dir,
        });
        const files = glob.sync('**', { cwd: dir }).sort();
        assert.deepEqual(files, [
            'included',
            'included/foo.js',
            'package.json'
        ]);
    });

    it('allows exposing an arbitrary action', async () => {
        let result = 1;
        class MyCustomAction extends Action {
            static $type = 'Custom.someAction';
            async exec() {
                result += 1;
            }
        }
        const extension = new Extension('some-dir', {
            name: 'some-extension',
            title: '',
            description: '',
            category: 'extension',
            version: '1.0.0',
            modules: [],
            private: false,
            tags: [],
        });
        (extension as any).loadModulesSync = () => {
            extension.actionClasses = [MyCustomAction];
        };
        runtime.$resolver.addExtension(extension);
        await runtime.runActions([
            { type: 'Custom.someAction' }
        ]);
        assert.equal(result, 2);
    });

    it('allow registering inspections', async () => {
        class MyInspection extends ActionInspection {
            inspect(_node: Action) {
                return [
                    {
                        name: 'my-custom-inspection',
                        level: InspectionLevel.Warn,
                        message: 'Something is wrong'
                    }
                ];
            }
        }
        const extension = new Extension('some-dir', {
            name: 'some-extension',
            title: '',
            description: '',
            category: 'extension',
            version: '1.0.0',
            modules: [],
            private: false,
            tags: [],
        });
        (extension as any).loadModulesSync = () => {
            extension.inspectionClasses = [MyInspection];
        };
        runtime.$resolver.addExtension(extension);
        const script = await runtime.createScriptWithActions([
            { id: 'tst', type: 'blah ' }
        ]);
        const action = script.getActionById('tst');
        const reports = [...script.inspect()];
        const report = reports.find(r => r.name === 'my-custom-inspection')!;
        assert.ok(report);
        assert.equal(report.level, InspectionLevel.Warn);
        assert.equal(report.message, 'Something is wrong');
        assert.equal(report.action, action);
        assert.equal(report.context, action?.$context);
    });

});
