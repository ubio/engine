import * as fs from 'fs/promises';

import { ConsoleLogger } from '../logger';

export async function loadConfigFromJs(configPath: string) {
    const rawData = await fs.readFile(configPath, { encoding: 'utf8' });
    const jsonOnly = rawData
    // erase everytring before "{" and after "}" and comments with "//"
        .replace(/.*=\s*|;.*|[\n\r\t]|\s(?!\w)|\/\/.*/g, '')
        .replace(/(?!['"]),(?=})/g, '') //  trailing ","
        .replace(/(\w+(?=:))/g, '"$1"') // replace "'" with '"' of keys
        .replace(/['"]/g, '"'); // replace "'" with '"' of values
    const jsonData = JSON.parse(jsonOnly);
    return jsonData;
}

export async function saveConfigToJs(configPath: string, json: any) {
    // replace everytring before "{" and after "}"
    const jsonOnly = json.replace(/.*=\s*|;.*|[\n\r\t\s]/g, '');
    await fs.writeFile(configPath, `export const defaultConfig = ${jsonOnly}`, { encoding: 'utf8' });
}

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
        const filePath = `${this.extensionPath}/assets/config.js`;

        try {
            const jsonData = await loadConfigFromJs(filePath);
            if (jsonData.apiKey !== key) {
                jsonData.apiKey = key;
                const updatedJsonData = JSON.stringify(jsonData, null, 2);
                await saveConfigToJs(filePath, updatedJsonData);
            }
        } catch (error) {
            this.logger.warn(`Updating api key ${key} in ${filePath} failed: ${error}`);
        }
    }
}
