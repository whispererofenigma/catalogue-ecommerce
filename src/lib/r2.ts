// lib/r2.ts
import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createId } from '@paralleldrive/cuid2';

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://b3d0f9f85ba704c59e914d55b95a33b7.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export const getSignedUploadUrl = async (fileType: string) => {
  const objectKey = createId();

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: objectKey,
    ContentType: fileType,
    // Add the Cache-Control header here!
    CacheControl: 'public, max-age=31536000, immutable', 
  });

  const presignedUrl = await getSignedUrl(
    r2,
    command,
    { expiresIn: 60 * 5 } // URL expires in 5 minutes
  );

  return { presignedUrl, objectKey };
};

export const deleteR2Object = async (objectKey: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: objectKey,
  });

  try {
    await r2.send(command);
    console.log(`Successfully deleted ${objectKey} from R2.`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting ${objectKey} from R2:`, error);
    return { success: false, error };
  }
};