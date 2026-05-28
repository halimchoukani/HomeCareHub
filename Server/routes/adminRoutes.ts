import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllDevices,
  deleteDevice,
  sendMessageToUser
} from '../controllers/adminController';
import { authorizeAdmin } from '../middlewares/authMiddleware';
import { login } from '../controllers/adminController';

const router = Router();

router.get('/dashboard', authorizeAdmin, getDashboardStats);
router.get('/users', authorizeAdmin, getAllUsers);
router.delete('/users/:id', authorizeAdmin, deleteUser);
router.get('/devices', authorizeAdmin, getAllDevices);
router.delete('/devices/:id', authorizeAdmin, deleteDevice);
router.post('/message', authorizeAdmin, sendMessageToUser);
router.post('/login', login);
export default router;
