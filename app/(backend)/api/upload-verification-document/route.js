import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import StudentVerification from '@/app/(backend)/models/StudentVerification';
import crypto from 'crypto';

function generateSignature(publicId, timestamp, apiSecret) {
  const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  return crypto.createHash('sha1').update(signatureString).digest('hex');
}

export async function POST(request) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file');
    const uid = formData.get('uid');

    if (!file || !uid) {
      return NextResponse.json({ error: 'File and uid are required' }, { status: 400 });
    }

    // Generate signature for signed upload
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `student_verification_${uid}_${timestamp}`;
    const signature = generateSignature(publicId, timestamp, process.env.CLOUDINARY_API_SECRET);

    // Upload to Cloudinary with signed upload
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('api_key', process.env.CLOUDINARY_API_KEY);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('public_id', publicId);
    cloudinaryFormData.append('signature', signature);

    console.log('Uploading to cloud:', process.env.CLOUDINARY_CLOUD_NAME);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error('Cloudinary error:', errorText);
      return NextResponse.json({ error: `Upload failed: ${errorText}` }, { status: 500 });
    }

    const cloudinaryData = await cloudinaryResponse.json();
    const documentUrl = cloudinaryData.secure_url;

    // Save to database
    const verification = new StudentVerification({
      uid,
      documentUrl,
      status: 'pending',
    });

    await verification.save();

    return NextResponse.json({ success: true, verification }, { status: 200 });
  } catch (error) {
    console.error('Error uploading verification document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}