import { Request, Response } from 'express';
import multer from 'multer'; // ensures @types/multer augments Express.Request with req.file
import prisma from '../db';
import { getUserIdFromToken } from '../middlewares/authMiddleware';
import { getFaceEmbadding } from '../services/face';
const { uploadImageToCloudinary } = require('./cloudinaryController');
import mqtt from 'mqtt';

export const createDevice = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const device = await prisma.device.create({
      data: { name },
    });
    res.status(201).json(device);
  } catch (error) {
    console.error('createDevice error:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
};

export const addPersonToDevice = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const userId = getUserIdFromToken(req.headers.authorization?.split(' ')[1] || '');
    const isAssigned = await isAssignedToUser({ deviceId: parseInt(deviceId as string, 10), userId });
    if (!isAssigned) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    const { name, lastName, role, phone } = req.body;

    let facePhotoUrl: string | null = null;
    if (req.file) {
      facePhotoUrl = await uploadImageToCloudinary(name, req.file) as string;
    }
    const result: any = await getFaceEmbadding(req.file);
    // Serialize the float array to a JSON string for storage (faceEmbedding is String? in schema)
    const face_embedding: string | null = Array.isArray(result?.embedding)
      ? JSON.stringify(result.embedding)
      : null;

    const person = await prisma.person.create({
      data: {
        name,
        lastName,
        role,
        phone,
        facePhoto: facePhotoUrl,
        faceEmbedding: face_embedding,
        deviceId: parseInt(deviceId as string, 10),
      },
    });

    res.status(201).json(person);
  } catch (error) {
    console.error('addPersonToDevice error:', error);
    res.status(500).json({ error: 'Failed to add person to device' });
  }
};

export const getPersonsByDevice = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const userId = getUserIdFromToken(req.headers.authorization?.split(' ')[1] || '');
    const isAssigned = await isAssignedToUser({ deviceId: parseInt(deviceId as string, 10), userId });
    if (!isAssigned) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    const persons = await prisma.person.findMany({
      where: { deviceId: parseInt(deviceId as string, 10) },
      omit: { faceEmbedding: true },
    });
    res.status(200).json(persons);
  } catch (error) {
    console.error('getPersonsByDevice error:', error);
    res.status(500).json({ error: 'Failed to get persons by device' });
  }
}

export const removePerson = async (req: Request, res: Response) => {
  try {
    const { deviceId, personId } = req.params;
    const userId = getUserIdFromToken(req.headers.authorization?.split(' ')[1] || '');
    const isAssigned = await isAssignedToUser({ deviceId: parseInt(deviceId as string, 10), userId });
    if (!isAssigned) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    const person = await prisma.person.findUnique({
      where: { id: parseInt(personId as string, 10) },
    });
    if (!person || person.deviceId !== parseInt(deviceId as string, 10)) {
      return res.status(404).json({ error: 'Person not found on this device' });
    }
    await prisma.person.delete({
      where: { id: parseInt(personId as string, 10) },
    });
    res.status(200).json({ message: 'Person removed successfully' });
  } catch (error) {
    console.error('removePerson error:', error);
    res.status(500).json({ error: 'Failed to remove person' });
  }
};

// ── shared helper ─────────────────────────────────────────────────────────────
const resolvePersonOnDevice = async (deviceId: number, personId: number) => {
  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person || person.deviceId !== deviceId) return null;
  return person;
};

export const blockPerson = async (req: Request, res: Response) => {
  try {
    const { deviceId, personId } = req.params;
    const userId = getUserIdFromToken(req.headers.authorization?.split(' ')[1] || '');
    const isAssigned = await isAssignedToUser({ deviceId: parseInt(deviceId as string, 10), userId });
    if (!isAssigned) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    const person = await resolvePersonOnDevice(parseInt(deviceId as string, 10), parseInt(personId as string, 10));
    if (!person) return res.status(404).json({ error: 'Person not found on this device' });
    if (!person.isActive) return res.status(400).json({ error: 'Person is already blocked' });

    const updated = await prisma.person.update({
      where: { id: parseInt(personId as string, 10) },
      data: { isActive: false },
      omit: { faceEmbedding: true },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error('blockPerson error:', error);
    res.status(500).json({ error: 'Failed to block person' });
  }
};

export const unblockPerson = async (req: Request, res: Response) => {
  try {
    const { deviceId, personId } = req.params;
    const userId = getUserIdFromToken(req.headers.authorization?.split(' ')[1] || '');
    const isAssigned = await isAssignedToUser({ deviceId: parseInt(deviceId as string, 10), userId });
    if (!isAssigned) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    const person = await resolvePersonOnDevice(parseInt(deviceId as string, 10), parseInt(personId as string, 10));
    if (!person) return res.status(404).json({ error: 'Person not found on this device' });
    if (person.isActive) return res.status(400).json({ error: 'Person is already active' });

    const updated = await prisma.person.update({
      where: { id: parseInt(personId as string, 10) },
      data: { isActive: true },
      omit: { faceEmbedding: true },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error('unblockPerson error:', error);
    res.status(500).json({ error: 'Failed to unblock person' });
  }
};

export const assignDeviceToUser = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const userId = getUserIdFromToken(req.headers.authorization?.split(' ')[1] || '');
    const isAssigned = await isAssignedToUser({ deviceId: parseInt(deviceId as string, 10), userId });
    if (isAssigned) {
      return res.status(400).json({ error: 'Device is already assigned to this user' });
    }
    const device = await prisma.device.update({
      where: { id: parseInt(deviceId as string, 10) },
      data: { userId },
    });
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.status(200).json(device);
  } catch (error) {
    console.error('assignDeviceToUser error:', error);
    res.status(500).json({ error: 'Failed to assign device to user' });
  }
};

export const unassignDeviceFromUser = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const userId = getUserIdFromToken(req.headers.authorization?.split(' ')[1] || '');
    const isAssigned = await isAssignedToUser({ deviceId: parseInt(deviceId as string, 10), userId });
    if (!isAssigned) {
      return res.status(400).json({ error: 'Device is not assigned to this user' });
    }
    const device = await prisma.device.update({
      where: { id: parseInt(deviceId as string, 10) },
      data: { userId: null },
    });
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.status(200).json(device);
  } catch (error) {
    console.error('unassignDeviceFromUser error:', error);
    res.status(500).json({ error: 'Failed to unassign device from user' });
  }
};

export const isAssignedToUser = async ({ deviceId, userId }: { deviceId: number, userId: number }) => {
  try {
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });
    if (!device) {
      return false;
    }
    console.log("device", device, "user", userId);
    return device.userId === userId;
  } catch (error) {
    console.error('isAssignedToUser error:', error);
    return false;
  }
};

export const sendSensorData = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const userId = getUserIdFromToken(req.headers.authorization?.split(' ')[1] || '');
    const isAssigned = await isAssignedToUser({ deviceId: parseInt(deviceId as string, 10), userId });

    if (!isAssigned) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    const { sensorType, value } = req.body;

    if (!sensorType || value === undefined) {
      return res.status(400).json({ error: 'sensorType and value are required' });
    }

    const hivemqUrl = process.env.HIVEMQ_URL || '';
    const hivemqUsername = process.env.HIVEMQ_USERNAME || '';
    const hivemqPassword = process.env.HIVEMQ_PASSWORD || '';

    if (!hivemqUrl) {
      return res.status(500).json({ error: 'HiveMQ Cloud configuration is missing in .env' });
    }

    const client = mqtt.connect(hivemqUrl, {
      username: hivemqUsername,
      password: hivemqPassword,
      clientId: `server_${deviceId}_${Date.now()}`
    });

    client.on('connect', () => {
      const topic = `homecarehub/devices/${deviceId}/sensors/${sensorType}`;
      const payload = JSON.stringify({ value, timestamp: new Date() });

      client.publish(topic, payload, (err) => {
        client.end();
        if (err) {
          console.error('MQTT publish error:', err);
          return res.status(500).json({ error: 'Failed to publish sensor data' });
        }
        res.status(200).json({ success: true, message: 'Sensor data published successfully', topic });
      });
    });

    client.on('error', (err) => {
      console.error('MQTT connection error:', err);
      client.end();
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to connect to MQTT broker' });
      }
    });

  } catch (error) {
    console.error('sendSensorData error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to send sensor data' });
    }
  }
};


export const getUserDevices = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization?.split(' ')[1] || '');
    const devices = await prisma.device.findMany({
      where: { userId },
      select: { id: true },
    });
    if (!devices) {
      return res.status(404).json({ error: 'Devices not found' });
    }
    res.status(200).json(devices.map((device) => device.id));
  } catch (error) {
    console.error('getUserDevices error:', error);
    res.status(500).json({ error: 'Failed to get user devices' });
  }
};

