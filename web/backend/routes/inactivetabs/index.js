import express from "express";
const router = express.Router();
import {
  saveInactiveTabSettings, 
  getInactiveTabSettings,
  uploadImageToShopify,
} from "../../controller/inactivetab/index.js";
import multer from 'multer';
// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Save inactive tab settings
router.post("/settings", saveInactiveTabSettings);

// Get inactive tab settings
router.get("/settings", getInactiveTabSettings);

// Upload image to Shopify
router.post("/upload-image",upload.single('image'), uploadImageToShopify);

export default router;
