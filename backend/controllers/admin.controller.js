import Book from '../models/book.model.js';
import User from '../models/user.model.js';
import { uploadFile } from '../utils/firebase.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error in getUsers controller:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// @desc    Upload a new book
// @route   POST /api/admin/upload-book
// @access  Private/Admin
export const uploadBook = async (req, res) => {
  try {
    const { title, author, description, summary } = req.body;
    const files = req.files;

    if (!files || !files.coverImage || !files.pdf) {
      return res.status(400).json({ error: 'Cover image and PDF file are required' });
    }

    const coverImageFile = files.coverImage[0];
    const pdfFile = files.pdf[0];

    const coverImageUrl = await uploadFile(coverImageFile);
    const pdfUrl = await uploadFile(pdfFile);

    const newBook = new Book({
      title,
      author,
      description,
      summary,
      coverImage: coverImageUrl,
      pdfUrl: pdfUrl,
      uploadedBy: req.user._id,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error('Error in uploadBook controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Get all download requests
// @route   GET /api/admin/download-requests
// @access  Private/Admin
export const getDownloadRequests = async (req, res) => {
  try {
    const books = await Book.find({ 'downloadRequests.0': { $exists: true } }).populate(
      'downloadRequests.userId',
      'fullName email'
    );

    const requests = books.flatMap(book => 
      book.downloadRequests.map(req => ({
        _id: req._id,
        requestId: req._id, // Keeping for backward compatibility
        bookTitle: book.title,
        bookId: book._id,
        user: req.userId,
        status: req.status,
        requestDate: req.requestDate,
        approvedAt: req.approvedAt
      }))
    );

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error in getDownloadRequests controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Approve a download request
// @route   PATCH /api/admin/approve-download/:requestId
// @access  Private/Admin
export const approveDownload = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await Book.updateOne(
      { 'downloadRequests._id': requestId },
      {
        $set: {
          'downloadRequests.$.status': 'approved',
          'downloadRequests.$.approvedAt': new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      const book = await Book.findOne({ 'downloadRequests._id': requestId });
      if (!book) {
        return res.status(404).json({ error: 'Request not found' });
      }
      // If book is found but not modified, it was likely already approved.
      // We can consider this a success.
    }

    res.status(200).json({ message: 'Download request approved successfully' });
  } catch (error) {
    console.error('Error in approveDownload controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Approve a user for site access
// @route   PATCH /api/admin/approve-user/:userId
// @access  Private/Admin
export const approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isApproved = true;
        await user.save();

        res.status(200).json({ message: 'User has been approved successfully' });
    } catch (error) {
        console.error('Error in approveUser controller:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
