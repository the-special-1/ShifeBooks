import express from 'express';
import multer from 'multer';
import {
  uploadBook,
  getDownloadRequests,
  approveDownload,
  approveUser,
  getUsers,
} from '../controllers/admin.controller.js';
import protectRoute from '../middleware/protectRoute.js';
import isAdmin from '../middleware/admin.middleware.js';

const router = express.Router();

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin routes
router.use(protectRoute, isAdmin);

router.post(
  '/upload-book',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  uploadBook
);

router.get('/download-requests', getDownloadRequests);
router.patch('/approve-download/:requestId', approveDownload);
router.patch('/approve-user/:userId', approveUser);
router.get('/users', getUsers);

export default router;
