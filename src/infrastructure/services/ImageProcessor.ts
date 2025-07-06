
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { Image } from '../../domain/entities/Task';

export class ImageProcessor {
    private outputDir: string;

    constructor(outputDir: string) {
        this.outputDir = outputDir;
    }

    async processImage(originalImagePath: string, taskId: string, resolutions: number[]): Promise<Image[]> {
        const outputs: Image[] = [];
        let imageFileName: string;
        let imageInput: string | Buffer = originalImagePath;
        // Check if originalImagePath is a URL
        if (/^https?:\/\//i.test(originalImagePath)) {
            const fetch = (await import('node-fetch')).default;
            const urlObj = new URL(originalImagePath);
            imageFileName = path.parse(urlObj.pathname).name;
            try {
                const response = await fetch(originalImagePath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
                }
                imageInput = Buffer.from(await response.arrayBuffer());
            } catch (error) {
                console.error(`Error downloading image from URL: ${originalImagePath}`, error);
                throw new Error(`Failed to download image: ${error instanceof Error ? error.message : String(error)}`);
            }
        } else {
            imageFileName = path.parse(originalImagePath).name;
        }
        for (const resolution of resolutions) {
            const taskOutputDir = path.join(this.outputDir, imageFileName, resolution.toString());
            await fs.mkdir(taskOutputDir, { recursive: true });
            const outputFileName = `${taskId}.jpg`;
            const outputPath = path.join(taskOutputDir, outputFileName);
            try {
                await sharp(imageInput)
                    .resize(resolution, resolution, {
                        fit: sharp.fit.inside,
                        withoutEnlargement: true
                    }).jpeg({ quality: 80 }).toFile(outputPath);
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
            } catch (error) {
                console.error(`Error processing image for resolution ${resolution}px: ${originalImagePath}`, error);
                throw new Error(`Failed to generate ${resolution}px image: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        return outputs;
    }

}