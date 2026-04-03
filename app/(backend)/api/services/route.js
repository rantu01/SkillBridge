import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Service from '@/app/(backend)/models/Service';
import crypto from 'crypto';

// GET /api/services - Fetch all services with optional category filtering
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query = {};
        if (category && category !== 'All') {
            query.category = category;
        }

        // Fetch services
        const services = await Service.find(query).sort({ createdAt: -1 }).lean();

        // Manual join with FirebaseUser to get owner details
        // Collect all unique ownerIDs
        const ownerIDs = [...new Set(services.map(s => s.ownerID))];

        // Import model inside the function to avoid circular dependencies or initialization issues
        const FirebaseUser = (await import('@/app/(backend)/models/FirebaseUser')).default;
        const users = await FirebaseUser.find({ uid: { $in: ownerIDs } }).select('uid displayName photoURL').lean();

        // Create a map for quick lookup
        const userMap = users.reduce((acc, user) => {
            acc[user.uid] = user;
            return acc;
        }, {});

        // Attach owner details to services
        const servicesWithOwners = services.map(service => ({
            ...service,
            owner: userMap[service.ownerID] || null
        }));

        return NextResponse.json({ success: true, services: servicesWithOwners }, { status: 200 });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/services - Create a new service with image upload
export async function POST(request) {
    try {
        await dbConnect();
        const formData = await request.formData();

        const title = formData.get('title');
        const description = formData.get('description');
        const category = formData.get('category');
        const price = formData.get('price');
        const ownerID = formData.get('ownerID');
        const availability = formData.get('availability') === 'true';
        const file = formData.get('file');

        if (!title || !description || !category || !price || !ownerID) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let imageUrl = '';

        if (file && typeof file !== 'string') {
            console.log(`[ServicePost] Uploading service image for ${ownerID}...`);

            const timestamp = Math.floor(Date.now() / 1000);
            const publicId = `service_${ownerID}_${timestamp}`;

            const signatureString = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
            const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

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
                console.error('[Cloudinary Service Error]:', cloudinaryData);
                return NextResponse.json({
                    error: `Image Upload Failed: ${cloudinaryData.error?.message || 'Unknown error'}`
                }, { status: 500 });
            }

            imageUrl = cloudinaryData.secure_url;
            console.log(`[ServicePost] Image Upload Success: ${imageUrl}`);
        }

        const newService = await Service.create({
            title,
            description,
            category,
            price: Number(price),
            ownerID,
            availability,
            image: imageUrl
        });

        return NextResponse.json({ success: true, service: newService }, { status: 201 });
    } catch (error) {
        console.error('Error creating service:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
