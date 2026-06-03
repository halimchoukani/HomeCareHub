import { Router } from 'express';
import {
  createDevice,
  addPersonToDevice,
  assignDeviceToUser,
  unassignDeviceFromUser,
  getPersonsByDevice,
  removePerson,
  blockPerson,
  unblockPerson,
  sendSensorData,
  getUserDevices,
  getRole
} from '../controllers/deviceController';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';

const upload = require('../middlewares/uploadMiddleware');

const router = Router();

// Admin only endpoints
router.post('/', authorizeAdmin, createDevice);
router.get('/userDevices', authenticate, getUserDevices);
router.get('/:deviceId/role', authenticate, getRole);
// Endpoints for authenticated users
router.post('/:deviceId/assign', authenticate, assignDeviceToUser);
router.delete('/:deviceId/unassign', authenticate, unassignDeviceFromUser);
router.post('/:deviceId/persons', authenticate, addPersonToDevice);
router.get('/:deviceId/persons', authenticate, getPersonsByDevice);
router.delete('/:deviceId/persons/:personId', authenticate, removePerson);
router.patch('/:deviceId/persons/:personId/block', authenticate, blockPerson);
router.patch('/:deviceId/persons/:personId/unblock', authenticate, unblockPerson);
router.post('/:deviceId/sensor-data', authenticate, sendSensorData);

export default router;
