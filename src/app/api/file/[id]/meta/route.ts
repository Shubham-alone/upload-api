import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const segments = req.nextUrl.pathname.split('/');
    const id = segments[segments.length - 2]; // grab the file ID from URL `/file/:id/meta`

    if (!id || !ObjectId.isValid(id)) {
        return new NextResponse('Invalid file ID', { status: 400 });
    }

    try {
        
        const { bucket } = await connectToDatabase();
        const objectId = new ObjectId(id);
        const file = await bucket.find({ _id: objectId }).toArray();

        if (!file.length) {
            return new NextResponse('File not found', { status: 404 });
        }

        const analysisType = file[0].metadata?.analysisType || 'unknown';
        const baseUrl = process.env.BASE_URL || "http://localhost:3000";

        return NextResponse.json({
            PDFFileURL: `${baseUrl}/api/file/${id}`,
            AnalysisType: analysisType
        });

    } catch (err) {
        console.error('Metadata fetch error:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
