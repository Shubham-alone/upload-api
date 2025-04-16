import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { GridFSBucketReadStream } from 'mongodb';

// Corrected GET method with proper type for downloadStream
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // Destructure the 'id' from params directly
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return new NextResponse('Invalid ID format', { status: 400 });
    }

    // Connect to MongoDB and get the bucket for file storage
    const { bucket } = await connectToDatabase();
    const objectId = new ObjectId(id); // Convert string ID to ObjectId
    const downloadStream: GridFSBucketReadStream = bucket.openDownloadStream(objectId);

    // Return the PDF file as the response
    return new NextResponse(downloadStream, {
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
