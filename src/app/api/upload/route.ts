import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import { Readable } from 'stream';
import { cors } from '@/app/lib/cors';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const { bucket } = await connectToDatabase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const stream = Readable.from(buffer);

    const uploadStream = bucket.openUploadStream(file.name);

    await new Promise<void>((resolve, reject) => {
      stream.pipe(uploadStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    const fileId = uploadStream.id.toString();
    const fileUrl = `${process.env.BASE_URL}/api/file/${fileId}`;

    return NextResponse.json({
      message: 'PDF uploaded successfully',
      fileId,
      downloadUrl: fileUrl, // ✅ now using the variable
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error }, { status: 500 });
  }
}
