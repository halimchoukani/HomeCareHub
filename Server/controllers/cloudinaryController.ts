const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageToCloudinary = async (name: string, fileData: any) => {
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const publicId = `${safeName}_${timestamp}`;
    console.log('Cloud name in use:', process.env.CLOUDINARY_CLOUD_NAME);

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                asset_folder: 'HomeCareHub/Persons', // ✅ correct param for dynamic folder mode
                use_filename_as_display_name: true,  // ✅ shows proper name in dashboard
            },
            (error: any, result: any) => {
                if (error) return reject(new Error(error.message));
                resolve(result.secure_url);
            }
        );
        stream.end(fileData.buffer);
    });
};

module.exports = { uploadImageToCloudinary };