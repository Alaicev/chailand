const pool = require('../config/database.js');

class PrizeController {
  // Получить все призы с разбитыми пунктами
  async getAllPrizes(req, res) {
    try {
      const result = await pool.query(
        'SELECT * FROM priseitems ORDER BY id DESC'
      );
      
      // Преобразуем texts в массив пунктов
      const prizes = result.rows.map(prize => {
        const points = prize.texts 
          ? prize.texts
              .split('|')
              .map(item => item.trim())
              .filter(item => item !== '')
          : [];
        
        return {
          ...prize,
          points: points.map((text, index) => ({
            id: `${prize.id}-${index}`, // Уникальный ID для фронтенда
            text: text,
            order: index + 1
          }))
        };
      });
      
      res.json({ 
        success: true,
        count: prizes.length,
        prizes 
      });
    } catch (error) {
      console.error('Get prizes error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Получить приз по ID
  async getPrizeById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM priseitems WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Prize not found' 
        });
      }
      
      const prize = result.rows[0];
      const points = prize.texts 
        ? prize.texts
            .split('|')
            .map(item => item.trim())
            .filter(item => item !== '')
        : [];
      
      res.json({
        success: true,
        prize: {
          ...prize,
          points: points.map((text, index) => ({
            id: `${prize.id}-${index}`,
            text: text,
            order: index + 1
          }))
        }
      });
    } catch (error) {
      console.error('Get prize error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Создать новый приз
  async createPrize(req, res) {
    try {
      const { name, points, email } = req.body;
      
      // Валидация
      if (!name || !email) {
        return res.status(400).json({ 
          success: false,
          error: 'Name and email are required' 
        });
      }
      
      // points - это массив строк, объединяем через |
      const texts = Array.isArray(points) 
        ? points
            .map(item => item.toString().trim())
            .filter(item => item !== '')
            .join('|')
        : '';
      
      const result = await pool.query(
        `INSERT INTO priseitems (name, texts, email) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, texts, email`,
        [name, texts, email]
      );
      
      // Разбиваем обратно для ответа
      const createdPrize = result.rows[0];
      const createdPoints = texts 
        ? texts.split('|').map(item => item.trim()).filter(item => item !== '')
        : [];
      
      res.status(201).json({
        success: true,
        message: 'Prize created successfully',
        prize: {
          ...createdPrize,
          points: createdPoints.map((text, index) => ({
            id: `${createdPrize.id}-${index}`,
            text: text,
            order: index + 1
          }))
        }
      });
    } catch (error) {
      console.error('Create prize error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Обновить приз
  async updatePrize(req, res) {
    try {
      const { id } = req.params;
      const { name, points, email } = req.body;
      
      // Проверяем существование приза
      const existing = await pool.query(
        'SELECT * FROM priseitems WHERE id = $1',
        [id]
      );
      
      if (existing.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Prize not found' 
        });
      }
      
      // Готовим данные для обновления
      const updateData = {
        name: name || existing.rows[0].name,
        email: email || existing.rows[0].email,
        texts: Array.isArray(points) 
          ? points
              .map(item => item.toString().trim())
              .filter(item => item !== '')
              .join('|')
          : existing.rows[0].texts
      };
      
      const result = await pool.query(
        `UPDATE priseitems 
         SET name = $1, texts = $2, email = $3 
         WHERE id = $4 
         RETURNING *`,
        [updateData.name, updateData.texts, updateData.email, id]
      );
      
      const updatedPrize = result.rows[0];
      const updatedPoints = updateData.texts 
        ? updateData.texts.split('|').map(item => item.trim()).filter(item => item !== '')
        : [];
      
      res.json({
        success: true,
        message: 'Prize updated successfully',
        prize: {
          ...updatedPrize,
          points: updatedPoints.map((text, index) => ({
            id: `${updatedPrize.id}-${index}`,
            text: text,
            order: index + 1
          }))
        }
      });
    } catch (error) {
      console.error('Update prize error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Удалить приз
  async deletePrize(req, res) {
    try {
      const { id } = req.params;
      
      // Проверяем существование
      const existing = await pool.query(
        'SELECT * FROM priseitems WHERE id = $1',
        [id]
      );
      
      if (existing.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Prize not found' 
        });
      }
      
      await pool.query('DELETE FROM priseitems WHERE id = $1', [id]);
      
      res.json({
        success: true,
        message: 'Prize deleted successfully',
        deletedPrize: existing.rows[0]
      });
    } catch (error) {
      console.error('Delete prize error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Поиск призов
  async searchPrizes(req, res) {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ 
          success: false,
          error: 'Search query is required' 
        });
      }
      
      const result = await pool.query(
        `SELECT * FROM priseitems 
         WHERE name ILIKE $1 
            OR email ILIKE $1 
            OR texts ILIKE $1 
         ORDER BY id DESC`,
        [`%${query}%`]
      );
      
      const prizes = result.rows.map(prize => {
        const points = prize.texts 
          ? prize.texts
              .split('|')
              .map(item => item.trim())
              .filter(item => item !== '')
          : [];
        
        return {
          ...prize,
          points: points.map((text, index) => ({
            id: `${prize.id}-${index}`,
            text: text,
            order: index + 1
          }))
        };
      });
      
      res.json({
        success: true,
        count: prizes.length,
        query,
        prizes
      });
    } catch (error) {
      console.error('Search prizes error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
}

module.exports = new PrizeController();