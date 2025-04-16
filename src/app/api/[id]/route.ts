import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest } from 'next/server';
import { Readable } from 'stream';


export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params; // ❌ no await here!
  

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return new Response('Invalid ID format', { status: 400 });
    }

    const { bucket } = await connectToDatabase();
    const objectId = new ObjectId(id);
    const downloadStream = bucket.openDownloadStream(objectId);

    return new Response(downloadStream as Readable, {
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
