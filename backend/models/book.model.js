import mongoose from 'mongoose';

const downloadRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
});

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String, // URL to the cover image in Firebase Storage
      required: true,
    },
    pdfUrl: {
      type: String, // URL to the PDF file in Firebase Storage
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the admin who uploaded the book
      required: true,
    },
    downloadRequests: [downloadRequestSchema],
  },
  { timestamps: true }
);

const Book = mongoose.model('Book', bookSchema);

export default Book;
