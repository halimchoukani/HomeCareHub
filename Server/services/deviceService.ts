import prisma from "../db";
import { getFaceEmbadding } from "./face";

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

export const addPerson = async ({ deviceId, user, userEmail, role }: any) => {
    try {
        const isAssigned = await isAssignedToUser({ deviceId: parseInt(deviceId as string, 10), userId: user });
        if (!isAssigned) {
            return { error: 'You do not have permission to perform this action', status: 403 };
        }
        const isPersonExist = await prisma.person.findFirst({
            where: { deviceId: parseInt(deviceId as string, 10), userId: user },
        });
        if (isPersonExist) {
            return { error: 'Person is already added to this device', status: 400 };
        }
        const personUser = await prisma.user.findFirst({
            where: { email: userEmail },
        });
        if (!personUser) {
            return { error: 'User not found', status: 404 };
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
            select: { email: true },
        });
        if (!owner) {
            return { error: 'Owner not found', status: 404 };
        }
        const addUser = await addPerson({ deviceId, user: user, userEmail: owner.email, role: "owner" });
        if (addUser.error) {
            return { error: addUser.error, status: addUser.status };
        }
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
