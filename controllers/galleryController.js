const pool = require('../config/database.js');
const path = require('path');
const fs = require('fs');
const { currentURL } = require('../admin/src/url/url.js');

// Константы для центров
const CENTERS = {
  HAPPY_MALL: 'ТРЦ Happy Молл',
  VICTORY_PLAZA: 'ТЦ Победа плаза'
};

class GalleryController {
  // Загрузка изображения в галерею
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          error: 'No file uploaded' 
        });
      }

      const { name_center } = req.body;
      
      if (!name_center || !Object.values(CENTERS).includes(name_center)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid or missing center name. Allowed values: ТРЦ Happy Молл, ТЦ Победа плаза' 
        });
      }

      // Создаем URL для доступа к файлу
      const fileUrl = `/uploads/gallery/${req.file.filename}`;

      // Сохраняем URL в базу данных
      const result = await pool.query(
        'INSERT INTO galerey (url, name_center) VALUES ($1, $2) RETURNING id, url, name_center, created_at',
        [fileUrl, name_center]
      );

      res.status(201).json({
        success: true,
        message: 'Image uploaded to gallery successfully',
        image: {
          ...result.rows[0],
          fullUrl: `${currentURL}/${fileUrl}`
        }
      });
    } catch (error) {
      console.error('Gallery upload error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Получение всех изображений галереи с фильтрацией по центру
  async getAllImages(req, res) {
    try {
      const { center } = req.query;
      let query = 'SELECT * FROM galerey';
      const params = [];
      
      if (center && Object.values(CENTERS).includes(center)) {
        query += ' WHERE name_center = $1';
        params.push(center);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      
      // Добавляем полный URL к каждому изображению
      const images = result.rows.map(image => ({
        ...image,
        fullUrl: `${currentURL}/${image.url}`
      }));
      
      res.json({ 
        success: true,
        count: images.length,
        images,
        centers: Object.values(CENTERS),
        currentCenter: center || 'all'
      });
    } catch (error) {
      console.error('Get gallery images error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Получение статистики по центрам
  async getCenterStats(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          name_center,
          COUNT(*) as image_count,
          MAX(created_at) as last_upload
        FROM galerey 
        GROUP BY name_center 
        ORDER BY image_count DESC
      `);
      
      res.json({
        success: true,
        stats: result.rows
      });
    } catch (error) {
      console.error('Get center stats error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Получение изображения по ID
  async getImageById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM galerey WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Image not found' 
        });
      }

      const image = result.rows[0];
      image.fullUrl = `${currentURL}/${image.url}`;

      res.json({
        success: true,
        image
      });
    } catch (error) {
      console.error('Get gallery image error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Удаление изображения из галереи
  async deleteImage(req, res) {
    try {
      const { id } = req.params;
      
      // Получаем информацию об изображении
      const imageResult = await pool.query(
        'SELECT * FROM galerey WHERE id = $1',
        [id]
      );

      if (imageResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Image not found' 
        });
      }

      const image = imageResult.rows[0];
      
      // Извлекаем имя файла из URL
      const fileName = image.url.split('/').pop();
      const filePath = path.join(__dirname, '..', 'uploads', 'gallery', fileName);
      
      // Удаляем файл с диска
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Удаляем запись из базы данных
      await pool.query('DELETE FROM galerey WHERE id = $1', [id]);
      
      res.json({
        success: true,
        message: 'Image deleted from gallery successfully',
        deletedImage: image
      });
    } catch (error) {
      console.error('Delete gallery image error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Обновление информации об изображении
  async updateImage(req, res) {
    try {
      const { id } = req.params;
      const { url, name_center } = req.body;
      
      if (!url) {
        return res.status(400).json({ 
          success: false,
          error: 'URL is required' 
        });
      }
      
      if (name_center && !Object.values(CENTERS).includes(name_center)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid center name. Allowed values: ТРЦ Happy Молл, ТЦ Победа плаза' 
        });
      }
      
      const result = await pool.query(
        'UPDATE galerey SET url = $1, name_center = COALESCE($2, name_center) WHERE id = $3 RETURNING *',
        [url, name_center, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Image not found' 
        });
      }
      
      const updatedImage = result.rows[0];
      updatedImage.fullUrl = `${currentURL}/${updatedImage.url}`;
      
      res.json({
        success: true,
        message: 'Image updated successfully',
        image: updatedImage
      });
    } catch (error) {
      console.error('Update gallery image error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Получение изображений с пагинацией и фильтрацией
  async getImagesPaginated(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const center = req.query.center;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM galerey';
      let countQuery = 'SELECT COUNT(*) FROM galerey';
      const params = [];
      const countParams = [];

      if (center && Object.values(CENTERS).includes(center)) {
        query += ' WHERE name_center = $1';
        countQuery += ' WHERE name_center = $1';
        params.push(center);
        countParams.push(center);
      }

      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);

      // Получаем общее количество
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      // Получаем изображения для текущей страницы
      const result = await pool.query(query, params);

      const images = result.rows.map(image => ({
        ...image,
        fullUrl: `${currentURL}/${image.url}`
      }));

      res.json({
        success: true,
        page,
        limit,
        total,
        totalPages,
        currentCenter: center || 'all',
        centers: Object.values(CENTERS),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        images
      });
    } catch (error) {
      console.error('Get paginated images error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Получение списка центров
  async getCenters(req, res) {
    res.json({
      success: true,
      centers: Object.values(CENTERS)
    });
  }
}

module.exports = new GalleryController();