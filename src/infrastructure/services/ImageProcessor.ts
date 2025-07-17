
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { Image } from '../../domain/entities/Task';

export class ImageProcessor {
    private outputDir: string;

    constructor(outputDir: string) {
        this.outputDir = outputDir;
    }

    async processImage(originalImagePath: string, resolutions: number[]): Promise<Image[]> {
        const outputs: Image[] = [];
        let imageFileName: string;
        let imageInput: string | Buffer = originalImagePath;
        // Check if originalImagePath is a URL
        if (/^https?:\/\//i.test(originalImagePath)) {
            const urlObj = new URL(originalImagePath);
            imageFileName = path.parse(urlObj.pathname).name;
            imageInput = await this.getImageFromInternet(originalImagePath);
        } else {
            imageFileName = path.parse(originalImagePath).name;
        }
        for (const resolution of resolutions) {
            const taskOutputDir = path.join(this.outputDir, imageFileName, resolution.toString());
            await fs.mkdir(taskOutputDir, { recursive: true });
            let resizedBuffer: Buffer;
            try {
                resizedBuffer = await sharp(imageInput)
                    .resize(resolution, resolution, {
                        fit: sharp.fit.inside,
                        withoutEnlargement: true
                    })
                    .jpeg({ quality: 80 })
                    .toBuffer();
            } catch (error) {
                console.error(`Error processing image for resolution ${resolution}px: ${originalImagePath}`, error);
                throw new Error(`Failed to generate ${resolution}px image: ${error instanceof Error ? error.message : String(error)}`);
            }
            const imageHash = this.createHashMd5(resizedBuffer);
            const outputFileName = `${imageHash}.jpg`;
            const outputPath = path.join(taskOutputDir, outputFileName);
            await fs.writeFile(outputPath, resizedBuffer);
            outputs.push({
                resolution: resolution.toString(),
                path: path.join(
                    '/output',
                    imageFileName,
                    resolution.toString(),
                    outputFileName
                ),
            });
            console.log(`Generated image: ${outputPath}`);
        }
        return outputs;
    }

    private createHashMd5(buffer: Buffer): string {
        return crypto.createHash('md5').update(buffer).digest('hex');
    }


    private async getImageFromInternet(url: string): Promise<Buffer> {
        const fetch = (await import('node-fetch')).default;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            return Buffer.from(await response.arrayBuffer());
        } catch (error) {
            console.error(`Error downloading image from URL: ${url}`, error);
            throw new Error(`Failed to download image: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

}