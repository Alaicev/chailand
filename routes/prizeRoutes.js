const express = require('express');
const prizeController = require('../controllers/prizeController.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');

const routerPrise = express.Router();

// Публичные маршруты
routerPrise.get('/', prizeController.getAllPrizes);
routerPrise.get('/search', prizeController.searchPrizes);
routerPrise.get('/:id', prizeController.getPrizeById);

// Защищенные маршруты (требуют авторизации)
routerPrise.post('/', authenticateToken, prizeController.createPrize);
routerPrise.put('/:id', authenticateToken, prizeController.updatePrize);
routerPrise.delete('/:id', authenticateToken, prizeController.deletePrize);

module.exports = routerPrise;