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
        const filePath = `${this.extensionPath}/assets/config.json`;

        try {
            const rawData = await fs.readFile(filePath, { encoding: 'utf8' });
            const jsonData = JSON.parse(rawData);
            jsonData.apiKey = key;
            const updatedJsonData = JSON.stringify(jsonData, null, 2);
            await fs.writeFile(filePath, updatedJsonData, { encoding: 'utf8' });
        } catch (error) {
            this.logger.warn(`Updating api key ${key} in ${filePath} failed: ${error}`);
        }
    }
}
