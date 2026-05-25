const multer = require('multer');

// Configure multer to store uploaded files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB limit
    }
});

module.exports = upload;
