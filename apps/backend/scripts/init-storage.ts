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
import { loadEnv } from "../src/config/env";

const env = loadEnv();

if (env.STORAGE_DRIVER === "local") {
  console.log(
    "STORAGE_DRIVER=local — uploads are stored on disk and served via /uploads. Skip bucket setup.",
  );
  process.exit(0);
}

const client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

async function ensureBucket() {
  try {
    await client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
    console.log(`Bucket "${env.S3_BUCKET}" sudah ada.`);
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
    console.log(`+ bucket "${env.S3_BUCKET}" dibuat.`);
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
          `arn:aws:s3:::${env.S3_BUCKET}/destinations/*`,
          `arn:aws:s3:::${env.S3_BUCKET}/nodes/*`,
        ],
      },
    ],
  };

  await client.send(
    new PutBucketPolicyCommand({
      Bucket: env.S3_BUCKET,
      Policy: JSON.stringify(policy),
    }),
  );
  console.log("Policy baca publik untuk prefix destinations/ diterapkan.");
}

await ensureBucket();
await allowPublicRead();
console.log(`Selesai. URL publik: ${env.S3_PUBLIC_URL}`);
