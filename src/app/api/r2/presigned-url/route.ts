// app/api/r2/presigned-url/route.ts

import { NextResponse } from 'next/server';
import { getSignedUploadUrl } from '@/lib/r2'; // Adjust path if your lib is elsewhere

export async function POST(request: Request) {
  try {
    const { fileType } = await request.json();

    if (!fileType) {
      return NextResponse.json(
        { error: 'File type is required.' },
        { status: 400 }
      );
    }

    // Get the signed URL from our R2 helper
    const { presignedUrl, objectKey } = await getSignedUploadUrl(fileType);

    if (!presignedUrl || !objectKey) {
        return NextResponse.json(
            { error: 'Failed to generate signed URL.' },
            { status: 500 }
          );
    }

    // Return the URL and the generated key to the client
    return NextResponse.json({ presignedUrl, objectKey });

  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}