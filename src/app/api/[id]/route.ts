import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest } from 'next/server';
import { Readable } from 'stream';

// Corrected GET method with better error handling
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;  // Destructure the 'id' from params directly
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return new Response('Invalid ID format', { status: 400 });
    }

    // Connect to MongoDB and get the bucket for file storage
    const { bucket } = await connectToDatabase();
    const objectId = new ObjectId(id);  // Convert string ID to ObjectId
    
    // Open download stream
    const downloadStream = bucket.openDownloadStream(objectId);

    // Check if the download stream is valid
    if (!downloadStream) {
      return new Response('File not found', { status: 404 });
    }

    // Return the PDF file as the response
    return new Response(downloadStream as unknown as Readable, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="downloaded.pdf"',
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response('File not found', { status: 404 });
  }
}
