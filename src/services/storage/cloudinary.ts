import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { env } from "@/config/env";
import type { StorageProvider, UploadOptions, UploadResult } from "./types";
import { logger } from "@/utils/logger";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Cloudinary-backed storage provider.
 * Implements the abstract StorageProvider interface.
 */
export class CloudinaryStorageProvider implements StorageProvider {
  async upload(
    file: Buffer | string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const dataUri =
      typeof file === "string"
        ? file
        : `data:application/octet-stream;base64,${file.toString("base64")}`;

    try {
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: options.folder ?? "nexplast",
        public_id: options.publicId,
        tags: options.tags,
        resource_type: options.resourceType ?? "auto",
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      logger.error(
        "Cloudinary upload failed",
        {
          error: error instanceof Error ? error.message : "unknown",
        },
        "storage",
      );
      throw new Error("Failed to upload file");
    }
  }

  async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error(
        "Cloudinary delete failed",
        {
          publicId,
          error: error instanceof Error ? error.message : "unknown",
        },
        "storage",
      );
      throw new Error("Failed to delete file");
    }
  }
}

export const storageProvider: StorageProvider = new CloudinaryStorageProvider();

/**
 * Signs browser-side direct uploads so files go straight to Cloudinary
 * instead of through our functions. Only the signed params are accepted.
 */
export function signCloudinaryUpload(params: Record<string, string | number>) {
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    signature: cloudinary.utils.api_sign_request(
      params,
      env.CLOUDINARY_API_SECRET,
    ),
  };
}
