import express from 'express';
import { 
  getAllBooks, 
  requestDownload, 
  getMyBooks 
} from '../controllers/book.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

// Public routes
router.get('/', getAllBooks);

// Protected routes
router.use(protectRoute);
router.get('/my-books', getMyBooks);
router.post('/:bookId/request-download', requestDownload);

export default router;
