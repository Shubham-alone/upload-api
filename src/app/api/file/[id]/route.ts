import { connectToDatabase } from '@/lib/mongodb'; // use relative path if needed
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

// Convert Node stream to Web ReadableStream
function nodeStreamToWebReadableStream(nodeStream: NodeJS.ReadableStream): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => controller.enqueue(chunk));
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', (err) => controller.error(err));
    },
  });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop(); // Extract ID from URL

  if (!id || !ObjectId.isValid(id)) {
    return new NextResponse('Invalid file ID', { status: 400 });
  }

  try {
    const { bucket } = await connectToDatabase();
    const objectId = new ObjectId(id);

    // Optional: check file existence
    const file = await bucket.find({ _id: objectId }).toArray();
    if (!file.length) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stream = bucket.openDownloadStream(objectId);
    const webStream = nodeStreamToWebReadableStream(stream);

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${file[0].filename}"`,
      },
    });
  } catch (err) {
    console.error('File error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
