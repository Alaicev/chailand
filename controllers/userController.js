const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database.js');

class UserController {
  async register(req, res) {
    const { name, email, password } = req.body;

    try {
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role`,
        [name, email, hashedPassword, 'user']
      );

      const token = jwt.sign(
        {
          id: newUser.rows[0].id,
          email: newUser.rows[0].email,
          role: newUser.rows[0].role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: newUser.rows[0],
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    console.log('Login request body:', req.body);
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'User not found' });
      }

      const user = result.rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Access denied. Only admin users can login.',
          userRole: user.role 
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async activateUser(req, res) {
    const { userId } = req.params;
    const { currentUser } = req;

    try {
      const result = await pool.query(
        `UPDATE users SET role = 'admin' 
         WHERE id = $1 
         RETURNING id, name, email, role`,
        [userId]
      ); 

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User activated successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Activation error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async verifyToken(req, res) {
    try {
      res.json({
        valid: true,
        user: req.user
      });
    } catch (error) {
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  }

  async getProfile(req, res) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    const { userId } = req.params;
    const { name, email } = req.body;
    const { user: currentUser } = req;

    try {
      if (currentUser.id !== parseInt(userId) && currentUser.role !== 'admin') {
        return res.status(403).json({ 
          error: 'You can only update your own profile' 
        });
      }

      if (email && email !== currentUser.email) {
        const existingEmail = await pool.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, userId]
        );
        if (existingEmail.rows.length > 0) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      const result = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name), 
             email = COALESCE($2, email)
         WHERE id = $3 
         RETURNING id, name, email, role`,
        [name, email, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User updated successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    const { userId } = req.params;
    const { user: currentUser } = req;

    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User deleted successfully',
        deletedUser: result.rows[0]
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Получить всех пользователей (только для admin)
  async getAllUsers(req, res) {
    try {
      const result = await pool.query(
        'SELECT * FROM users ORDER BY id'
      );
      
      res.json({ 
        success: true,
        users: result.rows 
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Получить пользователя по ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      // Проверяем, что id - это число
      if (isNaN(parseInt(id))) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid user ID' 
        });
      }
      
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [parseInt(id)] // Преобразуем в число
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }
      
      res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Get user by id error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Создать пользователя (админ функция)
  async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;
      
      // Валидация
      if (!name || !email || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Name, email and password are required' 
        });
      }
      
      // Проверяем существование email
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ 
          success: false,
          error: 'User with this email already exists' 
        });
      }
      
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Создаем пользователя
      const result = await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role, created_at`,
        [name, email, hashedPassword, role || 'user']
      );
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
}

module.exports = new UserController();