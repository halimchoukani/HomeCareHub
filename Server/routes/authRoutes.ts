import { Router } from 'express';
import { signup, login, resetPassword, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
const upload = require('../middlewares/uploadMiddleware');

const router = Router();

router.post('/signup', upload.single('facePhoto'), signup);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getCurrentUser);
export default router;
