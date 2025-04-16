import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { Readable } from 'stream';
import { cors } from '@/app/lib/cors';

// Handle the OPTIONS method (preflight request for CORS)
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  cors(req, response, () => {});
  return response;
}

// Handle the POST request to upload the PDF
export async function POST(req: NextRequest) {
  const response = new NextResponse();
  
  // Apply CORS middleware before processing the request
  cors(req, response, async () => {
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
        downloadUrl: fileUrl, 
      });
    } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
  });
}
