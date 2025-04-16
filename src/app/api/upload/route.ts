import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb'
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
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
  stream.pipe(uploadStream);

  return new Promise((resolve, reject) => {
    uploadStream.on('finish', () => {
      resolve(
        NextResponse.json({
          message: 'PDF uploaded successfully',
          fileId: uploadStream.id,
          downloadUrl: `${process.env.BASE_URL}/api/file/${uploadStream.id}`,
        })
      );
    });

    uploadStream.on('error', (err) => {
      reject(NextResponse.json({ error: 'Upload failed', details: err }, { status: 500 }));
    });
  });
}
