import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Спільні налаштування для всіх типів завантажень
const commonFileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(file.originalname.toLowerCase());
  const mime = allowed.test(file.mimetype);
  cb(null, ext && mime);
};

const commonLimits = { fileSize: 5 * 1024 * 1024 }; // 5MB

// 1. Фото позиції меню (16:9, 1200×675px)
const menuItemStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chashka/menu-items",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        crop: "fill",
        gravity: "center",
        width: 1200,
        height: 675,
        format: "auto",
        quality: "auto"
      }
    ],
  },
});

export const uploadMenuItemImage = multer({
  storage: menuItemStorage,
  fileFilter: commonFileFilter,
  limits: commonLimits,
});

// 2. Фото блоку "Про нас" (широкий landscape ~3:1, 1200×400px)
const aboutBlockStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chashka/about-blocks",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        crop: "fill",
        gravity: "center",
        width: 1200,
        height: 400,
        format: "auto",
        quality: "auto"
      }
    ],
  },
});

export const uploadAboutImage = multer({
  storage: aboutBlockStorage,
  fileFilter: commonFileFilter,
  limits: commonLimits,
});

// 3. Заставка/Логотип (1:1 квадрат, 600×600px)
const coverPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chashka/cover-photos",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        crop: "fill",
        gravity: "face", // Центрування по обличчю, якщо є
        width: 600,
        height: 600,
        format: "auto",
        quality: "auto"
      }
    ],
  },
});

export const uploadCoverPhoto = multer({
  storage: coverPhotoStorage,
  fileFilter: commonFileFilter,
  limits: commonLimits,
});

// Для зворотної сумісності (deprecated)
export const upload = uploadMenuItemImage;
