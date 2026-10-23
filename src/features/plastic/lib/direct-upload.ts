export interface CloudinaryUploadTicket {
  cloudName: string;
  apiKey: string;
  signature: string;
  timestamp: number;
  folder: string;
  allowed_formats: string;
}

export interface DirectUploadResult {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  bytes?: number;
}

/**
 * Uploads one file straight from the browser to Cloudinary using a server-signed
 * ticket. XHR (not fetch) so callers get upload progress.
 */
export function uploadToCloudinary(
  file: File,
  ticket: CloudinaryUploadTicket,
  onProgress?: (fraction: number) => void,
): Promise<DirectUploadResult> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", ticket.apiKey);
    body.append("timestamp", String(ticket.timestamp));
    body.append("signature", ticket.signature);
    body.append("folder", ticket.folder);
    body.append("allowed_formats", ticket.allowed_formats);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${ticket.cloudName}/image/upload`,
    );
    xhr.timeout = 60_000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`UPLOAD_HTTP_${xhr.status}`));
        return;
      }
      try {
        const data = JSON.parse(xhr.responseText) as {
          public_id: string;
          secure_url: string;
          width?: number;
          height?: number;
          bytes?: number;
        };
        resolve({
          publicId: data.public_id,
          url: data.secure_url,
          width: data.width,
          height: data.height,
          bytes: data.bytes,
        });
      } catch {
        reject(new Error("UPLOAD_BAD_RESPONSE"));
      }
    };
    xhr.onerror = () => reject(new Error("UPLOAD_NETWORK"));
    xhr.ontimeout = () => reject(new Error("UPLOAD_TIMEOUT"));
    xhr.send(body);
  });
}

/**
 * Runs async tasks with at most `limit` in flight, keeping result order.
 * Each slot settles independently so one failure doesn't cancel the rest.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next++;
      try {
        results[index] = {
          status: "fulfilled",
          value: await task(items[index]!, index),
        };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}
