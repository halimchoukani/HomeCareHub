import api, { getTokenFromStorage } from "../constants/api";

export const getDevices = async () => {
    try {
        const token = await getTokenFromStorage();
        const res = await api.get(`/devices/userDevices/`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error: any) {
        console.error("Error while fetching devices: ", error.response?.data || error.message);
        return null;
    }
}

export const getPersonsByDevice = async (deviceId: number) => {
    try {
        const token = await getTokenFromStorage();


        const res = await api.get(`/devices/${deviceId}/persons/`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error: any) {
        console.error("Error while fetching persons: ", error.response?.data || error.message);
        return null;
    }
}


export const toggleBlockStatus = async (deviceId: number, personId: number, action: string) => {
    try {
        const token = await getTokenFromStorage();

        const res = await api.patch(`/devices/${deviceId}/persons/${personId}/${action}/`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error: any) {
        console.error("Error while fetching persons: ", error.response?.data || error.message);
        return null;
    }
}


export const getRole = async (deviceId: number) => {
    try {
        const token = await getTokenFromStorage();

        const res = await api.get(`/devices/${deviceId}/role/`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error: any) {
        console.error("Error while fetching role: ", error.response?.data || error.message);
        return null;
    }
}