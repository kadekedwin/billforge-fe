"use server";

import { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./r2Client";
import {
    UploadImageOptions,
    UploadImageResult,
    DeleteImageOptions,
    DeleteImageResult,
    GetImageUrlOptions,
    GetImageUrlResult,
} from "./types";

const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN;

export async function uploadImage(options: UploadImageOptions): Promise<UploadImageResult> {
    const { file, folder, uuid } = options;

    try {
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const key = `${folder}/${uuid}.${extension}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await r2Client.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            })
        );

        const url = `${R2_PUBLIC_DOMAIN}/${key}`;

        return {
            success: true,
            url,
            key,
            sizeBytes: file.size,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Upload failed",
        };
    }
}

export async function deleteImage(options: DeleteImageOptions): Promise<DeleteImageResult> {
    const { folder, uuid } = options;

    try {
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        for (const ext of extensions) {
            const key = `${folder}/${uuid}.${ext}`;

            try {
                await r2Client.send(
                    new HeadObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME!,
                        Key: key,
                    })
                );

                await r2Client.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME!,
                        Key: key,
                    })
                );

                return {
                    success: true,
                };
            } catch {
            }
        }

        return {
            success: false,
            error: "Image not found",
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Delete failed",
        };
    }
}

export async function getImageUrl(options: GetImageUrlOptions): Promise<GetImageUrlResult> {
    const { folder, uuid } = options;

    try {
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        for (const ext of extensions) {
            const key = `${folder}/${uuid}.${ext}`;

            try {
                await r2Client.send(
                    new HeadObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME!,
                        Key: key,
                    })
                );

                const url = `${R2_PUBLIC_DOMAIN}/${key}`;

                return {
                    success: true,
                    url,
                };
            } catch {
            }
        }

        return {
            success: false,
            error: "Image not found",
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Get URL failed",
        };
    }
}

