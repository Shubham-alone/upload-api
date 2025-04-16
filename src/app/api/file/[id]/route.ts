// src/app/api/file/[id]/route.ts

import { connectToDatabase } from '../../../lib/mongodb'; // or adjust path
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

function nodeStreamToWebReadableStream(nodeStream: NodeJS.ReadableStream): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', chunk => controller.enqueue(chunk));
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', err => controller.error(err));
    },
  });
}

export async function GET(req: NextRequest) {
  // Extracting the file ID directly from the URL path
  const id = req.nextUrl.pathname.split('/').pop(); // get the last part of the path

  if (!id || !ObjectId.isValid(id)) {
    return new NextResponse('Invalid file ID', { status: 400 });
  }

  try {
    const { bucket } = await connectToDatabase();
    const downloadStream = bucket.openDownloadStream(new ObjectId(id));
    
    // Fetch file metadata to get filename if available
    const file = await bucket.find({ _id: new ObjectId(id) }).toArray();
    const filename = file[0]?.filename || 'file.pdf'; // Fallback to 'file.pdf' if filename is not found

    const webStream = nodeStreamToWebReadableStream(downloadStream);

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('File error:', err);
    return new NextResponse('File not found', { status: 404 });
  }
}
