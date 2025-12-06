/**
 * Image Optimization Test Utility
 * 
 * This script helps you verify that image optimization is working correctly.
 * It provides detailed statistics about the optimization process.
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface OptimizationStats {
    format: string;
    originalSize: number;
    optimizedSize: number;
    reduction: number;
    reductionPercent: string;
    width: number;
    height: number;
    processingTime: number;
}

async function testOptimization(inputPath: string, outputPath: string): Promise<OptimizationStats> {
    const startTime = Date.now();

    // Read original file
    const originalBuffer = readFileSync(inputPath);
    const originalSize = originalBuffer.length;

    // Get original metadata
    const originalMetadata = await sharp(originalBuffer).metadata();

    console.log('Original Image:');
    console.log('  Format:', originalMetadata.format);
    console.log('  Size:', originalSize, 'bytes', `(${(originalSize / 1024).toFixed(2)} KB)`);
    console.log('  Dimensions:', `${originalMetadata.width}x${originalMetadata.height}`);

    // Optimize
    const optimized = await sharp(originalBuffer)
        .rotate()
        .resize({
            width: 2000,
            height: 2000,
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({
            quality: 85,
            effort: 6,
            smartSubsample: true,
        })
        .toBuffer({ resolveWithObject: true });

    const optimizedSize = optimized.data.length;
    const reduction = originalSize - optimizedSize;
    const reductionPercent = ((reduction / originalSize) * 100).toFixed(2);

    // Save optimized file
    writeFileSync(outputPath, optimized.data);

    const processingTime = Date.now() - startTime;

    console.log('\nOptimized Image:');
    console.log('  Format: WebP');
    console.log('  Size:', optimizedSize, 'bytes', `(${(optimizedSize / 1024).toFixed(2)} KB)`);
    console.log('  Dimensions:', `${optimized.info.width}x${optimized.info.height}`);
    console.log('  Reduction:', reduction, 'bytes', `(${reductionPercent}%)`);
    console.log('  Processing time:', processingTime, 'ms');

    return {
        format: 'webp',
        originalSize,
        optimizedSize,
        reduction,
        reductionPercent,
        width: optimized.info.width,
        height: optimized.info.height,
        processingTime,
    };
}

// Example usage:
// const stats = await testOptimization('./input.jpg', './output.webp');

export { testOptimization };
