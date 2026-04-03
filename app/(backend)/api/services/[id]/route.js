import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Service from '@/app/(backend)/models/Service';
import crypto from 'crypto';

// PUT /api/services/[id] - Update a service
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const formData = await request.formData();

        const title = formData.get('title');
        const description = formData.get('description');
        const category = formData.get('category');
        const price = formData.get('price');
        const ownerID = formData.get('ownerID');
        const availability = formData.get('availability') === 'true';
        const file = formData.get('file');

        const service = await Service.findById(id);

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Basic ownership check
        if (service.ownerID !== ownerID) {
            return NextResponse.json({ error: 'Unauthorized: You do not own this service' }, { status: 403 });
        }

        let imageUrl = service.image;

        if (file && typeof file !== 'string') {
            console.log(`[ServiceUpdate] Updating service image for ${ownerID}...`);

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
                console.error('[Cloudinary Update Error]:', cloudinaryData);
                return NextResponse.json({
                    error: `Image Update Failed: ${cloudinaryData.error?.message || 'Unknown error'}`
                }, { status: 500 });
            }

            imageUrl = cloudinaryData.secure_url;
            console.log(`[ServiceUpdate] Image Update Success: ${imageUrl}`);
        }

        service.title = title || service.title;
        service.description = description || service.description;
        service.category = category || service.category;
        service.price = price ? Number(price) : service.price;
        service.availability = availability !== undefined ? availability : service.availability;
        service.image = imageUrl;

        await service.save();

        return NextResponse.json({ success: true, service }, { status: 200 });
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/services/[id] - Delete a service
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json({ error: 'User UID is required for verification' }, { status: 400 });
        }

        const service = await Service.findById(id);

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Basic ownership check
        if (service.ownerID !== uid) {
            return NextResponse.json({ error: 'Unauthorized: You do not own this service' }, { status: 403 });
        }

        await Service.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Service deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
