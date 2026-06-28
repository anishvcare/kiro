const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/requests', 'uploads/payments', 'uploads/temp', 'uploads/proofs'];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Storage configuration for request images
const requestImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads/requests'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Storage configuration for payment screenshots
const paymentScreenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads/payments'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Storage configuration for delivery proof photos
const deliveryProofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads/proofs'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

// Upload middleware for request images (max 5 images, 5MB each)
const uploadRequestImages = multer({
  storage: requestImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
}).array('images', 5);

// Upload middleware for single request image
const uploadSingleRequestImage = multer({
  storage: requestImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single('image');

// Upload middleware for payment screenshots
const uploadPaymentScreenshot = multer({
  storage: paymentScreenshotStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single('screenshot');

// Upload middleware for delivery proof photo
const uploadDeliveryProofImage = multer({
  storage: deliveryProofStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },
}).single('proof');

module.exports = {
  uploadRequestImages,
  uploadSingleRequestImage,
  uploadPaymentScreenshot,
  uploadDeliveryProofImage,
};
