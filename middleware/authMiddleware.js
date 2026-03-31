const jwt = require('jsonwebtoken');
const pool = require('../config/database.js');

// Middleware для проверки JWT токена
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверяем пользователя в БД
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired' 
      });
    }
    return res.status(403).json({ 
      success: false,
      error: 'Invalid token' 
    });
  }
};

// Middleware для проверки роли администратора
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Admin role required.' 
    });
  }
  next();
};

// Middleware для проверки прав на редактирование/удаление пользователя
const canEditUser = (req, res, next) => {
  const userId = parseInt(req.params.userId || req.params.id);
  
  if (isNaN(userId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid user ID' 
    });
  }
  
  // Админ может редактировать всех пользователей
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Пользователь может редактировать только свой профиль
  if (req.user.id === userId) {
    return next();
  }
  
  return res.status(403).json({ 
    success: false,
    error: 'Access denied. You can only edit your own profile.' 
  });
};

// Middleware для проверки прав на удаление пользователя
const canDeleteUser = async (req, res, next) => {
  const userId = parseInt(req.params.userId || req.params.id);
  
  if (isNaN(userId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid user ID' 
    });
  }
  
  // Пользователь не может удалить сам себя
  if (req.user.id === userId) {
    return res.status(400).json({ 
      success: false,
      error: 'You cannot delete your own account.' 
    });
  }
  
  // Только админ может удалять других пользователей
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Admin role required to delete users.' 
    });
  }
  
  // Проверяем, не пытаемся ли удалить последнего админа
  try {
    const adminCount = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'admin'"
    );
    
    const userToDelete = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );
    
    if (userToDelete.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    if (userToDelete.rows[0].role === 'admin' && parseInt(adminCount.rows[0].count) <= 1) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete the last admin user' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Delete user validation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Middleware для проверки что пользователь аутентифицирован (упрощенный)
const requireUser = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  canEditUser,
  canDeleteUser,
  requireUser
};