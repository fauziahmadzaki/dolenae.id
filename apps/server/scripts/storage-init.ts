/**
 * Buat bucket MinIO + izinkan baca publik (untuk dev).
 * Jalankan: pnpm --filter @dolenae/server storage:init
 */
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { loadEnv, storageConfig } from "../src/config/env";

async function main() {
  loadEnv();
  const cfg = storageConfig();

  const client = new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    forcePathStyle: cfg.forcePathStyle,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  try {
    await client.send(new HeadBucketCommand({ Bucket: cfg.bucket }));
    console.log(`Bucket "${cfg.bucket}" sudah ada.`);
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: cfg.bucket }));
    console.log(`Bucket "${cfg.bucket}" dibuat.`);
  }

  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicRead",
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${cfg.bucket}/*`],
      },
    ],
  };

  await client.send(
    new PutBucketPolicyCommand({
      Bucket: cfg.bucket,
      Policy: JSON.stringify(policy),
    }),
  );
  console.log("Policy baca publik dipasang.");
  console.log(`Base URL publik: ${cfg.publicUrl}`);
}

main().catch((err) => {
  console.error("Inisialisasi storage gagal:", err);
  process.exit(1);
});
