// src/app/api/r2/presigned-url/route.ts
import { NextResponse } from 'next/server';
import { getSignedUploadUrl } from '@/lib/r2';

export async function POST(request: Request) {
  try {
    const { fileType, prefix } = await request.json();

    if (!fileType) {
      return NextResponse.json(
        { error: 'File type is required.' },
        { status: 400 }
      );
    }

    const { presignedUrl, objectKey } = await getSignedUploadUrl(fileType, prefix);

    if (!presignedUrl || !objectKey) {
        return NextResponse.json(
            { error: 'Failed to generate signed URL.' },
            { status: 500 }
          );
    }

    return NextResponse.json({ presignedUrl, objectKey });

  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}