const express = require('express');
const imageController = require('../controllers/imageController.js');
const upload = require('../middleware/upload.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');

const imageRouter = express.Router();

// Публичные маршруты (просмотр изображений)
imageRouter.get('/', imageController.getAllImages);
imageRouter.get('/:id', imageController.getImageById);

// Защищенные маршруты (требуют авторизации)
imageRouter.post('/upload', authenticateToken, upload.single('image'), imageController.uploadImage);
imageRouter.put('/:id', authenticateToken, imageController.updateImage);
imageRouter.delete('/:id', authenticateToken, imageController.deleteImage);

module.exports = imageRouter;