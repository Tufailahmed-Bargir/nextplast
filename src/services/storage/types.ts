/**
 * Abstract storage provider interface.
 * Cloudinary is the current implementation — swap providers without changing callers.
 */
export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  resourceType?: "image" | "raw" | "video" | "auto";
}

export interface StorageProvider {
  upload(file: Buffer | string, options?: UploadOptions): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
  getSignedUrl?(publicId: string, expiresInSeconds?: number): string;
}
