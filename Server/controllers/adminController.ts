import { Request, Response } from 'express';
import prisma from '../db';
import { Server } from 'socket.io';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'hguipzhgbzioegbzibnljcnzeufbhzibskjnvhibgzefgbzkbjfeifbzibfziyvv';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalDevices = await prisma.device.count();
    const totalPersons = await prisma.person.count();
    const activePersons = await prisma.person.count({ where: { isActive: true } });
    const inactivePersons = await prisma.person.count({ where: { isActive: false } });

    res.json({
      metrics: {
        totalUsers,
        totalDevices,
        totalPersons,
        activePersons,
        inactivePersons,
        activeAlerts: 0
      },
      deviceStatuses: {
        online: totalDevices,
        warning: 0,
        offline: 0
      },
      registrationsOverTime: [
        { name: "Week 1", users: totalUsers, devices: totalDevices, alerts: 0 }
      ],
      alerts: [],
      messageHistory: []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: { devices: true }
        }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const devices = await prisma.device.findMany({ where: { userId: Number(id) } });
    const deviceIds = devices.map(d => d.id);

    await prisma.person.deleteMany({ where: { deviceId: { in: deviceIds } } });
    await prisma.device.deleteMany({ where: { userId: Number(id) } });
    await prisma.user.delete({ where: { id: Number(id) } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const getAllDevices = async (req: Request, res: Response): Promise<void> => {
  try {
    const devices = await prisma.device.findMany({
      include: {
        user: {
          select: { username: true, email: true }
        },
        _count: {
          select: { persons: true }
        }
      }
    });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
};

export const deleteDevice = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.person.deleteMany({ where: { deviceId: Number(id) } });
    await prisma.device.delete({ where: { id: Number(id) } });
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete device' });
  }
};

export const sendMessageToUser = async (req: Request, res: Response): Promise<any> => {
  const { userId, message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const io: Server = req.app.get('io');

    if (userId) {
      // Send to specific user
      io.to(`user_${userId}`).emit('admin_message', { message, timestamp: new Date() });
    } else {
      // Send to all
      io.emit('admin_message', { message, timestamp: new Date() });
    }

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (!user.isAdmin) {
      res.status(403).json({ error: 'User is not an admin' });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }
    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
};

