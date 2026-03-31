const express = require('express');
const userController = require('../controllers/userController.js');
const { authenticateToken, requireAdmin, canEditUser } = require('../middleware/authMiddleware.js');

const routerUsers = express.Router();

// ========== Публичные маршруты (без авторизации) ==========
routerUsers.post('/register', userController.register);
routerUsers.post('/login', userController.login);

// ========== Защищенные маршруты (требуют аутентификации) ==========
routerUsers.get('/verify', authenticateToken, userController.verifyToken);
routerUsers.get('/profile', authenticateToken, userController.getProfile);

// ========== Маршруты только для администраторов ==========
// ВАЖНО: Этот маршрут ДОЛЖЕН быть перед /users/:id
routerUsers.get('/all', authenticateToken, requireAdmin, userController.getAllUsers);

// Активировать пользователя (сделать admin)
routerUsers.put('/activate/:userId', authenticateToken, requireAdmin, userController.activateUser);

// ========== Маршруты для работы с пользователями ==========
// Получить пользователя по ID
routerUsers.get('/:id', authenticateToken, requireAdmin, userController.getUserById);

// Обновить пользователя (пользователь может себя, админ - любого)
routerUsers.put('/update/:userId', authenticateToken, canEditUser, userController.updateUser);

// Удалить пользователя (пользователь может себя, админ - любого, кроме последнего админа)
routerUsers.delete('/delete/:userId', authenticateToken, canEditUser, userController.deleteUser);

module.exports = routerUsers;