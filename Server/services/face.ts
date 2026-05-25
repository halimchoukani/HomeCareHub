const FACE_API = "http://localhost:8000";


export const getFaceEmbadding = async (file: any) => {
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