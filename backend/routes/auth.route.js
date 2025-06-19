import express from 'express';
import { signup, login, logout, checkAuth, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check', protectRoute, checkAuth);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;
