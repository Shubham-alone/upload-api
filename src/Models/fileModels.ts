import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    analysisType: {
        type: String,
        enum: ['all', 'Security', 'Privacy', 'Confidentiality', 'Availability', 'Integrity'],
        required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });



export default mongoose.models.File || mongoose.model('File', fileSchema);