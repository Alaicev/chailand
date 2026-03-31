const express = require('express');
const packetController = require('../controllers/packetController.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');

const routerPakets = express.Router();

// Публичные маршруты (чтение)
routerPakets.get('/', packetController.getAllPackets);
routerPakets.get('/:id', packetController.getPacketById);

// Защищенные маршруты (создание, обновление, удаление)
routerPakets.post('/', authenticateToken, packetController.createPacket); 
routerPakets.put('/:id', authenticateToken, packetController.updatePacket);
routerPakets.delete('/:id', authenticateToken, packetController.deletePacket);

module.exports = routerPakets;