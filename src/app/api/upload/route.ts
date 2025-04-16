import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { Readable } from 'stream';
import { cors } from '@/app/lib/cors';

export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  cors(req, res, () => {});
  return res;
}

export async function POST(req: NextRequest) {
  return new Promise(async (resolve) => {
    const response = new NextResponse();
    cors(req, response, async () => {
      try {
        const formData = await req.formData();
        const file = formData.get('pdf') as File;

        if (!file) {
          return resolve(
            NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
          );
        }

        const { bucket } = await connectToDatabase();
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const stream = Readable.from(buffer);

        const uploadStream = bucket.openUploadStream(file.name);

        uploadStream.on('error', (err) => {
          console.error('Stream error:', err);
          resolve(
            NextResponse.json({ error: 'Upload failed', details: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
          );
        });

        uploadStream.on('finish', () => {
          const fileId = uploadStream.id.toString();
          const fileUrl = `${process.env.BASE_URL}/api/file/${fileId}`;

          resolve(
            NextResponse.json({
              message: 'PDF uploaded successfully',
              fileId,
              downloadUrl: fileUrl,
            })
          );
        });

        stream.pipe(uploadStream);
      } catch (error) {
        console.error('Upload error:', error);
        resolve(
          NextResponse.json(
            { error: 'Upload failed', details:  error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          )
        );
      }
    });
  });
}
