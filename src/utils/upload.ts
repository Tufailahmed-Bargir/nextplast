import type { StorageProvider, UploadOptions, UploadResult } from "@/services/storage";
import { storageProvider } from "@/services/storage";

/**
 * Upload utility — thin facade over the abstract storage provider.
 */
export async function uploadFile(
  file: Buffer | string,
  options?: UploadOptions,
  provider: StorageProvider = storageProvider,
): Promise<UploadResult> {
  return provider.upload(file, options);
}

export async function deleteFile(
  publicId: string,
  provider: StorageProvider = storageProvider,
): Promise<void> {
  return provider.delete(publicId);
}

export async function uploadImage(
  file: Buffer | string,
  folder = "nexplast/images",
): Promise<UploadResult> {
  return uploadFile(file, { folder, resourceType: "image" });
}
