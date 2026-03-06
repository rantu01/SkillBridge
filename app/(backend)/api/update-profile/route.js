import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';
import crypto from 'crypto';

/**
 * Cloudinary requires parameters to be alphabetized for the signature.
 * The format should be: parameter1=value1&parameter2=value2<API_SECRET>
 */
function generateCloudinarySignature(paramsToSign, apiSecret) {
    const sortedKeys = Object.keys(paramsToSign).sort();
    const signatureString = sortedKeys
        .map(key => `${key}=${paramsToSign[key]}`)
        .join('&') + apiSecret;

    return crypto.createHash('sha1').update(signatureString).digest('hex');
}

export async function POST(request) {
    try {
        await dbConnect();

        const formData = await request.formData();
        const uid = formData.get('uid');
        const displayName = formData.get('displayName');
        const action = formData.get('action');
        const file = formData.get('file');

        if (!uid) {
            return NextResponse.json({ error: 'UID is required' }, { status: 400 });
        }

        let updateData = {};

        // Handle Display Name Update
        if (displayName !== null && displayName !== undefined) {
            updateData.displayName = displayName;
        }

        // Handle Photo Logic
        if (action === 'delete_photo') {
            console.log(`[UpdateProfile] Action: Deleting photo for ${uid}`);
            updateData.photoURL = '';
        }
        else if (file && typeof file !== 'string') {
            console.log(`[UpdateProfile] Action: Uploading new photo for ${uid}...`);

            const timestamp = Math.floor(Date.now() / 1000);
            const publicId = `profile_pic_${uid}_${timestamp}`;

            // Generate signature logic similar to student-verification for consistency
            const signatureString = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
            const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

            // Create Form Data for Cloudinary
            const cloudinaryFormData = new FormData();
            cloudinaryFormData.append('file', file);
            cloudinaryFormData.append('api_key', process.env.CLOUDINARY_API_KEY);
            cloudinaryFormData.append('timestamp', timestamp.toString());
            cloudinaryFormData.append('public_id', publicId);
            cloudinaryFormData.append('signature', signature);

            const cloudinaryResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: cloudinaryFormData,
                }
            );

            const cloudinaryData = await cloudinaryResponse.json();

            if (!cloudinaryResponse.ok) {
                console.error('[Cloudinary Error Response]:', cloudinaryData);
                return NextResponse.json({
                    error: `Cloudinary Upload Failed: ${cloudinaryData.error?.message || 'Unknown error'}`
                }, { status: 500 });
            }

            updateData.photoURL = cloudinaryData.secure_url;
            console.log(`[UpdateProfile] Cloudinary Upload Success: ${updateData.photoURL}`);
        }

        // --- Update Database ---
        console.log(`[UpdateProfile] Attempting to update DB for UID: ${uid}`);
        console.log(`[UpdateProfile] Update payload:`, updateData);

        let user = await FirebaseUser.findOne({ uid });

        if (!user) {
            console.error(`[UpdateProfile] User NOT found in DB for UID: ${uid}`);
            return NextResponse.json({ error: 'User not found in Database' }, { status: 404 });
        }

        // Apply updates manually
        if (updateData.displayName !== undefined) {
            user.displayName = updateData.displayName;
        }
        if (updateData.photoURL !== undefined) {
            user.photoURL = updateData.photoURL;
        }

        const savedUser = await user.save();
        console.log(`[UpdateProfile] Save successful! DB now has displayName: "${savedUser.displayName}"`);

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: savedUser.toObject()
        }, { status: 200 });

    } catch (error) {
        console.error('[UpdateProfile] Global server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}