/**
 * Creates the bucket used for uploads and grants public read access to the
 * `destinations/` prefix, so image URLs can be rendered directly by the web and
 * mobile clients.
 *
 * Usage (from apps/backend, after `docker compose up -d`):
 *   pnpm storage:init
 */
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { AppConfig } from "../src/config/AppConfig";

const config = AppConfig.load();

if (config.storageDriver === "local") {
  console.log(
    "STORAGE_DRIVER=local — uploads are stored on disk and served via /uploads. Skip bucket setup.",
  );
  process.exit(0);
}

const client = new S3Client({
  region: config.s3Region,
  endpoint: config.s3Endpoint,
  forcePathStyle: config.s3ForcePathStyle,
  credentials: {
    accessKeyId: config.s3AccessKeyId,
    secretAccessKey: config.s3SecretAccessKey,
  },
});

async function ensureBucket() {
  try {
    await client.send(new HeadBucketCommand({ Bucket: config.s3Bucket }));
    console.log(`Bucket "${config.s3Bucket}" sudah ada.`);
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: config.s3Bucket }));
    console.log(`+ bucket "${config.s3Bucket}" dibuat.`);
  }
}

async function allowPublicRead() {
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadDestinationImages",
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [
          `arn:aws:s3:::${config.s3Bucket}/destinations/*`,
          `arn:aws:s3:::${config.s3Bucket}/nodes/*`,
        ],
      },
    ],
  };

  await client.send(
    new PutBucketPolicyCommand({
      Bucket: config.s3Bucket,
      Policy: JSON.stringify(policy),
    }),
  );
  console.log("Policy baca publik untuk prefix destinations/ diterapkan.");
}

await ensureBucket();
await allowPublicRead();
console.log(`Selesai. URL publik: ${config.s3PublicUrl}`);
