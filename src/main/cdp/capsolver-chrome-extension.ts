import * as fs from 'fs/promises';

import { ConsoleLogger } from '../logger';


export class CapsolverChromeExtension {
    protected logger = new ConsoleLogger();

    constructor(protected extensionPath: string, protected apiKey: string) {}

    async addApiKey() {
        await this.modifyApiKey(this.apiKey);
    }

    async removeApiKey() {
        await this.modifyApiKey('');
    }

    protected async modifyApiKey(key: string) {
        const filePath = `${this.extensionPath}/assets/config`;

        try {
            const { defaultConfig } = await import(`${filePath}.mjs`);
            if (defaultConfig.apiKey !== key) {
                defaultConfig.apiKey = key;
                const updatedJsonData = 'export const defaultConfig = ' + JSON.stringify(defaultConfig, null, 2);
                await fs.writeFile(`${filePath}.js`, updatedJsonData, { encoding: 'utf8' });
            }
        } catch (error) {
            this.logger.warn(`Updating api key ${key} in ${filePath} failed: ${error}`);
        }
    }
}
