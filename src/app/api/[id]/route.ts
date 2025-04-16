import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;  // Directly destructure from params

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return new NextResponse('Invalid ID format', { status: 400 });
    }

    const { bucket } = await connectToDatabase();
    const objectId = new ObjectId(id); // Convert string ID to ObjectId
    const downloadStream = bucket.openDownloadStream(objectId);

    return new NextResponse(downloadStream as any, {
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
