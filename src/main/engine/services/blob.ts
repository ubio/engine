import { promises as fs } from 'fs';
import { inject, injectable } from 'inversify';
import os from 'os';
import path from 'path';
import rimraf from 'rimraf';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';

import { Configuration, stringConfig } from '../../cdp/index.js';
import { SessionHandler } from '../session.js';
import { createError } from '../util/index.js';

const rimrafAsync = util.promisify(rimraf);

const BLOBS_DIR = stringConfig('BLOBS_DIR', path.resolve(os.tmpdir(), 'autopilot/blobs'));

export interface Blob {
    blobId: string;
    filename: string;
    file: string;
    length: number;
}

export enum BlobEncoding {
    BINARY = 'binary',
    UTF8 = 'utf8',
    BASE64 = 'base64',
    HEX = 'hex',
    ASCII = 'ascii',
    UTF16LE = 'utf16le',
    USC2 = 'usc2',
}

@injectable()
@SessionHandler()
export class BlobService {
    blobsMap: Map<string, Blob> = new Map();

    constructor(
        @inject(Configuration)
        protected config: Configuration,
    ) {}

    async onSessionStart() {
        this.blobsMap.clear();
        await rimrafAsync(this.getBlobsPath());
        await fs.mkdir(this.getBlobsPath(), { recursive: true });
    }

    getBlobsPath() {
        const blobsDir = this.config.get(BLOBS_DIR);
        return path.resolve(process.cwd(), blobsDir);
    }

    getBlob(blobId: string): Blob {
        const blob = this.blobsMap.get(blobId);
        if (!blob) {
            throw createError({
                code: 'BlobNotfound',
                message: 'Blob not found by id',
                retry: true,
                details: { blobId },
            });
        }
        return blob;
    }

    async createBlob(filename: string, buffer: Buffer): Promise<Blob> {
        const file = path.resolve(this.getBlobsPath(), filename);
        await fs.writeFile(file, buffer);
        const blob = {
            blobId: 'blob:' + uuidv4(),
            file,
            filename,
            length: buffer.length,
        };
        this.blobsMap.set(blob.blobId, blob);
        return blob;
    }

    async readBlob(blobId: string): Promise<Buffer> {
        const blob = this.getBlob(blobId);
        const buffer = await fs.readFile(blob.file);
        return buffer;
    }

    async copy(blob: Blob, filename: string): Promise<Blob> {
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const dstFile = path.join(this.getBlobsPath(), sanitizedFilename);
        await fs.copyFile(blob.file, dstFile);
        return {
            blobId: blob.blobId,
            length: blob.length,
            file: dstFile,
            filename: sanitizedFilename,
        };
    }
}
