import express from 'express';
import { 
  getAllBooks, 
  requestDownload, 
  getMyBooks,
  deleteBook,
  updateBook
} from '../controllers/book.controller.js';
import protectRoute from '../middleware/protectRoute.js';
import admin from '../middleware/admin.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllBooks);

// Protected routes
router.use(protectRoute);
router.get('/my-books', getMyBooks);
router.post('/:bookId/request-download', requestDownload);

// Admin routes
router.delete('/:id', protectRoute, admin, deleteBook);
router.put('/:id', protectRoute, admin, updateBook);

export default router;
