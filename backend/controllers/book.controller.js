import Book from '../models/book.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all books
// @route   GET /api/books
// @access  Public
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({})
      .populate('uploadedBy', 'fullName')
      .populate('downloadRequests.userId', 'fullName email');
      
    res.status(200).json(books);
  } catch (error) {
    console.error('Error in getAllBooks controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Request to download a book
// @route   POST /api/books/:bookId/request-download
// @access  Private
// @desc    Get approved books for the current user
// @route   GET /api/books/my-books
// @access  Private
export const getMyBooks = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all books where the current user has an approved download request
    const books = await Book.find({
      'downloadRequests': {
        $elemMatch: {
          userId: userId,
          status: 'approved'
        }
      }
    });
    
    res.status(200).json(books);
  } catch (error) {
    console.error('Error in getMyBooks controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Request to download a book
// @route   POST /api/books/:bookId/request-download
// @access Private
export const requestDownload = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if the user has already requested this book
    const existingRequest = book.downloadRequests.find(
      (request) => request.userId.toString() === userId.toString()
    );

    if (existingRequest) {
      return res.status(400).json({ 
        error: 'You have already requested this book',
        status: existingRequest.status
      });
    }

    book.downloadRequests.push({ 
      userId,
      status: 'pending'
    });
    
    await book.save();

    res.status(200).json({ 
      message: 'Download request submitted successfully',
      status: 'pending'
    });
  } catch (error) {
    console.error('Error in requestDownload controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Admin
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Delete files from the server if they exist
    if (book.coverImage) {
      const coverImagePath = path.join(__dirname, '..', '..', book.coverImage);
      if (fs.existsSync(coverImagePath)) {
        fs.unlinkSync(coverImagePath);
      }
    }
    if (book.pdfUrl) {
      const pdfPath = path.join(__dirname, '..', '..', book.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error in deleteBook controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Admin
export const updateBook = async (req, res) => {
  try {
    const { title, author, description, summary } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description || book.description;
    book.summary = summary || book.summary;

    const updatedBook = await book.save();

    res.status(200).json(updatedBook);
  } catch (error) {
    console.error('Error in updateBook controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
