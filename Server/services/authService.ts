import prisma from "../db";
import jwt from "jsonwebtoken";
import { getFaceEmbadding } from "./face";
const JWT_SECRET = process.env.JWT_SECRET || 'hguipzhgbzioegbzibnljcnzeufbhzibskjnvhibgzefgbzkbjfeifbzibfziyvv';
const bcrypt = require("bcrypt");
const { uploadImageToCloudinary } = require("../controllers/cloudinaryController");

export const signupService = async ({ username, email, password, phone, isAdmin, file }: { username: string, email: string, password: string, phone: string, isAdmin: boolean, file: Express.Multer.File | null }) => {
    try {
        if (!username || !email || !password) {
            return { error: 'Username, email, and password are required', status: 400 };
        }
        if (!file) {
            return { error: 'Face Photo is required', status: 400 };
        }
        let isAdminValue = Boolean(isAdmin) || false;
        const facePhotoUrl = await uploadImageToCloudinary(username, file) as string;
        const result: any = await getFaceEmbadding(file);
        // Serialize the float array to a JSON string for storage (faceEmbedding is String? in schema)
        const face_embedding: string | null = Array.isArray(result?.embedding)
            ? JSON.stringify(result.embedding)
            : null;

        if (!face_embedding) {
            return { error: 'Failed to get face embedding, please provide a valid face image', status: 500 };
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (existingUser) {
            return { error: 'User already exists', status: 400 };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                phone,
                facePhoto: facePhotoUrl,
                faceEmbedding: face_embedding,
                isAdmin: isAdminValue || false,
            },
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
        return { token, status: 201 };
    } catch (error) {
        console.error('Signup error:', error);
        return { error: 'Failed to signup', status: 500 };
    }
}