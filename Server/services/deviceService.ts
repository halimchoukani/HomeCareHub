import prisma from "../db";
import { getFaceEmbadding } from "./face";

// Helper to emit new_log without crashing if socket not ready
const emitNewLog = (log: any, userId?: number) => {
    try {
        const { getIo } = require("../socketInstance");
        const io = getIo();
        if (io) {
            io.to("admin_room").emit("new_log", log);
            if (userId) io.to(`user_${userId}`).emit("new_log", log);
        }
    } catch (_) { /* socket not critical */ }
};

export const isAssignedToUser = async ({ deviceId, userId }: { deviceId: number, userId: number }) => {
    try {
        const device = await prisma.device.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            return false;
        }
        return device.userId === userId;
    } catch (error) {
        console.error('isAssignedToUser error:', error);
        return false;
    }
};

export const addPerson = async ({ deviceId, user, userEmail, role }: any) => {
    try {
        const isAssigned = await isAssignedToUser({ deviceId: parseInt(deviceId as string, 10), userId: user });
        if (!isAssigned) {
            return { error: 'You do not have permission to perform this action', status: 403 };
        }

        const personUser = await prisma.user.findFirst({
            where: { email: userEmail },
        });
        if (!personUser) {
            return { error: 'User not found', status: 404 };
        }
        const isPersonExist = await prisma.person.findFirst({
            where: { deviceId: parseInt(deviceId as string, 10), userId: personUser.id },
        });
        if (isPersonExist) {
            return { error: 'Person is already added to this device', status: 400 };
        }
        const person = await prisma.person.create({
            data: {
                userId: personUser.id,
                role,
                facePhoto: personUser.facePhoto,
                faceEmbedding: personUser.faceEmbedding,
                deviceId: parseInt(deviceId as string, 10),
            },
            omit: { faceEmbedding: true },
        });

        if (role !== "owner") {
            const addingUser = await prisma.user.findUnique({
                where: { id: user },
            });
            const device = await prisma.device.findUnique({
                where: { id: parseInt(deviceId as string, 10) },
            });
            const addingUsername = addingUser ? addingUser.username : `User #${user}`;
            const deviceName = device ? device.name : `Device #${deviceId}`;
            const newLog = await prisma.log.create({
                data: {
                    userId: user,
                    action: "USER_ADDED_PERSON",
                    details: `${addingUsername} added ${personUser.username} as ${role} to device ${deviceName}`,
                },
                include: { user: { select: { username: true, email: true } } }
            });
            emitNewLog(newLog, user);
        }

        return { person, status: 201 };
    } catch (error) {
        console.error('addPersonToDevice error:', error);
        return { error: 'Failed to add person to device', status: 500 };
    }
}

export const assignDevice = async ({ deviceId, user }: { deviceId: number, user: number }) => {
    try {
        const isAssigned = await isAssignedToUser({ deviceId, userId: user });
        if (isAssigned) {
            return { error: 'Device is already assigned to this user', status: 400 };
        }
        const device = await prisma.device.update({
            where: { id: deviceId },
            data: { userId: user },
        });
        if (!device) {
            return { error: 'Device not found', status: 404 };
        }
        const owner = await prisma.user.findUnique({
            where: { id: user },
            select: { email: true, username: true },
        });
        if (!owner) {
            return { error: 'Owner not found', status: 404 };
        }
        const addUser = await addPerson({ deviceId, user: user, userEmail: owner.email, role: "owner" });
        if (addUser.error) {
            return { error: addUser.error, status: addUser.status };
        }

        const newLog = await prisma.log.create({
            data: {
                userId: user,
                action: "USER_JOINED_DEVICE",
                details: `${owner.username} joined device ${device.name}`,
            },
            include: { user: { select: { username: true, email: true } } }
        });
        emitNewLog(newLog, user);

        return { device, status: 200 };
    } catch (error) {
        console.error('assignDevice error:', error);
        return { error: 'Failed to assign device', status: 500 };
    }
}

export const unassignDevice = async ({ deviceId, user }: { deviceId: number, user: number }) => {
    try {
        const removePerson = await removePersonFromDevice({ deviceId, userId: user });
        if (removePerson.error) {
            return { error: removePerson.error, status: removePerson.status };
        }
        const device = await prisma.device.update({
            where: { id: deviceId },
            data: { userId: null },
        });
        if (!device) {
            return { error: 'Device not found', status: 404 };
        }

        return { device, status: 200 };
    } catch (error) {
        console.error('unassignDeviceFromUser error:', error);
        return { error: 'Failed to unassign device from user', status: 500 };
    }
}

export const getRoleFromDevice = async ({ deviceId, userId }: { deviceId: number, userId: number }) => {
    try {
        const person = await prisma.person.findFirst({
            where: { deviceId, userId },
            select: { role: true },
        });
        if (!person) {
            return { error: 'Device not found', status: 404 };
        }
        return { role: person.role, status: 200 };
    } catch (error) {
        console.error('getRoleFromDevice error:', error);
        return { error: 'Failed to get role from device', status: 500 };
    }
}


export const removePersonFromDevice = async ({ deviceId, userId }: { deviceId: number, userId: number }) => {
    try {

        const person = await prisma.person.findFirst({
            where: { userId: userId, deviceId: deviceId },
        });
        if (!person) {
            return { error: 'Person not found on this device', status: 404 };
        }
        await prisma.person.delete({
            where: { id: person.id },
        });
        return { message: 'Person removed successfully', status: 200 };
    } catch (error) {
        console.error('removePerson error:', error);
        return { error: 'Failed to remove person', status: 500 };
    }
}



export const getPersonsByDeviceId = async ({ deviceId }: { deviceId: number }) => {
    try {
        const persons = await prisma.person.findMany({
            where: { deviceId: deviceId },
            omit: { faceEmbedding: true },
        });
        if (!persons) {
            return { error: 'No persons found for this device', status: 404 };
        }
        let users = [];
        for (let i = 0; i < persons.length; i++) {
            const user = await prisma.user.findUnique({
                where: { id: persons[i].userId },
                omit: { password: true, faceEmbedding: true },
            });
            if (user) {
                users.push({
                    ...user,
                    ...persons[i],
                });
            }
        }
        return { persons: users, status: 200 };
    } catch (error) {
        console.error('getPersonsByDevice error:', error);
        return { error: 'Failed to get persons for this device', status: 500 };
    }
}

export const getUserDevices = async ({ userId }: { userId: number }) => {
    try {
        const persons = await prisma.person.findMany({
            where: { userId: userId },
            omit: { faceEmbedding: true },
        });
        const deviceIds = persons.map(person => person.deviceId);
        const devices = await prisma.device.findMany({
            where: { id: { in: deviceIds } },
            include: {
                persons: {
                    where: { userId: userId },
                },
                _count: {
                    select: { persons: true },
                },
            },
        });
        if (!devices) {
            return { error: 'No devices found for this user', status: 404 };
        }
        return { devices, status: 200 };
    } catch (error) {
        console.error('getUserDevices error:', error);
        return { error: 'Failed to get devices for this user', status: 500 };
    }
}
