const express = require('express');
const galleryController = require('../controllers/galleryController.js');
const upload = require('../middleware/galleryUpload.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');

const routerGalerey = express.Router();

// Публичные маршруты
routerGalerey.get('/', galleryController.getAllImages);
routerGalerey.get('/centers', galleryController.getCenters);
routerGalerey.get('/stats', galleryController.getCenterStats);
routerGalerey.get('/paginated', galleryController.getImagesPaginated);
routerGalerey.get('/:id', galleryController.getImageById);

// Защищенные маршруты (требуют авторизации)
routerGalerey.post('/upload', authenticateToken, upload.single('image'), galleryController.uploadImage);
routerGalerey.put('/:id', authenticateToken, galleryController.updateImage);
routerGalerey.delete('/:id', authenticateToken, galleryController.deleteImage);

module.exports = routerGalerey;