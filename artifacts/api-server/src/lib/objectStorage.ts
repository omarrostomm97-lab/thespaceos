import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("R2_BUCKET_NAME environment variable is not set.");
  }
  return bucket;
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export interface ObjectFile {
  bucket: string;
  key: string;
}

export class ObjectStorageService {
  async getObjectEntityUploadURL(): Promise<{ uploadURL: string; objectPath: string }> {
    const client = getR2Client();
    const bucket = getBucketName();
    const objectId = randomUUID();
    const key = `uploads/${objectId}`;

    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    const uploadURL = await getSignedUrl(client, command, { expiresIn: 900 });
    const objectPath = `/objects/${key}`;

    return { uploadURL, objectPath };
  }

  async getObjectEntityFile(objectPath: string): Promise<ObjectFile> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const key = objectPath.slice("/objects/".length);
    if (!key) throw new ObjectNotFoundError();

    const client = getR2Client();
    const bucket = getBucketName();

    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    } catch {
      throw new ObjectNotFoundError();
    }

    return { bucket, key };
  }

  async downloadObject(
    file: ObjectFile,
    cacheTtlSec: number = 3600
  ): Promise<Response> {
    const client = getR2Client();
    const result = await client.send(
      new GetObjectCommand({ Bucket: file.bucket, Key: file.key })
    );

    const contentType = result.ContentType ?? "application/octet-stream";
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": `private, max-age=${cacheTtlSec}`,
    };
    if (result.ContentLength) {
      headers["Content-Length"] = String(result.ContentLength);
    }

    const body = result.Body;
    if (!body) {
      return new Response(null, { status: 204, headers });
    }

    const webStream = body.transformToWebStream();
    return new Response(webStream, { headers });
  }
}
