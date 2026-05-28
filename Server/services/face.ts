import prisma from "../db";

const FACE_API = "http://localhost:8000";


export const getFaceEmbadding = async (file: any): Promise<any> => {
    try {
        const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
        const formData = new FormData();
        formData.append('face_image', blob, file.originalname);

        // Do NOT set Content-Type manually — fetch auto-generates the multipart boundary
        const response = await fetch(`${FACE_API}/api/face/`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log('getFaceEmbadding response:', data);
        return data;
    } catch (error) {
        console.error('getFaceEmbadding error:', error);
        return null;
    }
}


export const detectFace = async (file: any) => {
    try {
        const embadding: any = await getFaceEmbadding(file);
        if (!embadding || !embadding.embedding) return null;
        const person_with_same_embadding = await prisma.person.findMany({
            where: {
                faceEmbedding: {
                    equals: embadding.embedding,
                }
            }
        });
        return person_with_same_embadding;
    } catch (error) {
        console.error('detectFace error:', error);
        return null;
    }
}