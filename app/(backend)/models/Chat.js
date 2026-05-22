import mongoose from 'mongoose';

const ChatFileSchema = new mongoose.Schema({
    url: { type: String, required: true },
    name: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    uploadedBy: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ChatMessageSchema = new mongoose.Schema({
    senderID: { type: String, required: true },
    receiverID: { type: String, required: true },
    message: { type: String, default: '' },
    fileLinks: { type: [ChatFileSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

const ChatSchema = new mongoose.Schema({
    bookingID: { type: String, required: true, unique: true, index: true },
    senderID: { type: String, required: true },
    receiverID: { type: String, required: true },
    messages: { type: [ChatMessageSchema], default: [] },
    fileLinks: { type: [ChatFileSchema], default: [] },
    lastMessageAt: { type: Date, default: null }
}, { timestamps: true });

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Chat;
}

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);