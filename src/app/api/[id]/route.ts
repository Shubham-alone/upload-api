import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

// Utility to convert Node stream to Web ReadableStream
function nodeStreamToWebReadableStream(nodeStream: NodeJS.ReadableStream): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => controller.enqueue(chunk));
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', (err) => controller.error(err));
    }
  });
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id'); // Use get() method

    if (!id || !ObjectId.isValid(id)) {
      return new NextResponse('Invalid ID format', { status: 400 });
    }

    const { bucket } = await connectToDatabase();
    const objectId = new ObjectId(id);
    const downloadStream = bucket.openDownloadStream(objectId);

    const stream = nodeStreamToWebReadableStream(downloadStream);

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="downloaded.pdf"',
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
