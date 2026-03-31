const express = require('express');
const messageController = require('../controllers/MessageController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');


const messageRouter = express.Router();
messageRouter.post('/', messageController.createMessage);

// Защищенные роуты (требуют аутентификации и админских прав)
// messageRouter.get('/', messageController.getAllMessages);
messageRouter.get('/', authenticateToken, requireAdmin, messageController.getAllMessages);
messageRouter.post('/exel', authenticateToken, requireAdmin, messageController.createExel);
messageRouter.get('/stats', authenticateToken, requireAdmin, messageController.getMessagesStats);
messageRouter.get('/unread-count', authenticateToken, requireAdmin, messageController.getUnreadCount);
messageRouter.get('/:id', authenticateToken, requireAdmin, messageController.getMessageById);
messageRouter.patch('/:id/read-status', authenticateToken, requireAdmin, messageController.updateMessageReadStatus);
messageRouter.post('/mark-all-read', authenticateToken, requireAdmin, messageController.markAllAsRead);
messageRouter.put('/:id', authenticateToken, requireAdmin, messageController.updateMessage);
messageRouter.delete('/:id', authenticateToken, requireAdmin, messageController.deleteMessage);

module.exports = messageRouter
;