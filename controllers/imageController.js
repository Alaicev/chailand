const pool = require('../config/database.js');
const path = require('path');
const fs = require('fs');

class ImageController {
  // Загрузка изображения
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Создаем URL для доступа к файлу
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

      // Сохраняем URL в базу данных
      const result = await pool.query(
        'INSERT INTO images (url) VALUES ($1) RETURNING id, url, created_at',
        [fileUrl]
      );

      res.status(201).json({
        message: 'Image uploaded successfully',
        image: result.rows[0]
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Получение всех изображений
  async getAllImages(req, res) {
    try {
      const result = await pool.query(
        'SELECT * FROM images ORDER BY created_at DESC'
      );
      
      res.json({ images: result.rows });
    } catch (error) {
      console.error('Get images error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Получение одного изображения по ID
  async getImageById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM images WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }

      res.json({ image: result.rows[0] });
    } catch (error) {
      console.error('Get image error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Удаление изображения
  async deleteImage(req, res) {
    try {
      const { id } = req.params;
      
      // 1. Получаем информацию об изображении
      const imageResult = await pool.query(
        'SELECT * FROM images WHERE id = $1',
        [id]
      );

      if (imageResult.rows.length === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const image = imageResult.rows[0];
      
      // 2. Извлекаем имя файла из URL
      const fileName = image.url.split('/').pop();
      const filePath = path.join(__dirname, '../uploads', fileName);
      
      // 3. Удаляем файл с диска
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // 4. Удаляем запись из базы данных
      await pool.query('DELETE FROM images WHERE id = $1', [id]);
      
      res.json({ 
        message: 'Image deleted successfully',
        deletedImage: image
      });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Обновление информации об изображении
  async updateImage(req, res) {
    try {
      const { id } = req.params;
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      const result = await pool.query(
        'UPDATE images SET url = $1 WHERE id = $2 RETURNING *',
        [url, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      res.json({
        message: 'Image updated successfully',
        image: result.rows[0]
      });
    } catch (error) {
      console.error('Update image error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ImageController();