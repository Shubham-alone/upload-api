import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { Readable } from 'stream';
import { handleCors } from '@/app/lib/cors';
import jwt from 'jsonwebtoken';
import User from '@/Models/userModels';
import File from '@/Models/fileModels';
import connectDB from '@/db/config';

const JWT_SECRET = process.env.JWT_SECRET || "geography";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    await connectDB();

    // Extract token from cookies
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check upload limit
    if (user.uploadCount >= 5) {
      return NextResponse.json({ redirectToSubscription: true }, { status: 200 });
    }

    // File upload
    const formData = await req.formData();
    const file = formData.get('pdf') as File;
    const analysisType = formData.get('AnalysisType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!analysisType) {
      return NextResponse.json({ error: 'Missing AnalysisType' }, { status: 400 });
    }

    // Validate analysisType against enum
    const validAnalysisTypes = ['all', 'Security', 'Privacy', 'Confidentiality', 'Availability', 'Integrity'];
    if (!validAnalysisTypes.includes(analysisType)) {
      return NextResponse.json({ error: `AnalysisType must be one of: ${validAnalysisTypes.join(', ')}` }, { status: 400 });
    }

    // Connect to GridFS
    const { bucket } = await connectToDatabase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const stream = Readable.from(buffer);

    // Upload to GridFS with analysisType as the metadata itself (not nested)
    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: analysisType
    });
    const fileId = uploadStream.id; // Get the fileId from the upload stream

    await new Promise<void>((resolve, reject) => {
      stream.pipe(uploadStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    // Generate download URL
    const downloadUrl = `${BASE_URL}/api/files/${fileId}`;

    // Log data before saving
    console.log('Saving File document:', {
      fileName: file.name,
      analysisType,
      userId: user._id,
      fileId,
      downloadUrl
    });

    // Save file details to File collection with all required fields
    const fileDoc = new File({
      fileName: file.name,
      analysisType,
      userId: user._id,
      fileId: fileId,
      downloadUrl: downloadUrl,
    });
    await fileDoc.save();

    // Verify file was saved correctly in GridFS
    const gridFSFile = await bucket.find({ _id: fileId }).toArray();
    console.log('GridFS File metadata:', gridFSFile[0].metadata);
    console.log('Full GridFS File structure:', JSON.stringify(gridFSFile[0], null, 2));

    // Verify file document was saved correctly
    const savedFileDoc = await File.findById(fileDoc._id);
    console.log('File document saved:', savedFileDoc);

    // Increment user upload count
    user.uploadCount += 1;
    await user.save();

    return NextResponse.json({
      message: 'PDF uploaded successfully',
      fileName: file.name,
      analysisType,
      showResult: true,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}