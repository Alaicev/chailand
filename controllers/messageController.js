const pool = require('../config/database.js');
const { addDataToExcel } = require('../services/excelService.js');
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: "altarev123456@mail.ru",
    pass: "otvIc8cmVmGwQrtySIga" // это пароль приложения
  },
  tls: {
    rejectUnauthorized: false // иногда помогает при проблемах с сертификатами
  }
});

// Функция отправки письма
const mailer = async (message) => {
  try {
    // ВАЖНО: from должен быть с тем же доменом, что и auth.user
    // и должен быть указан в самом сообщении, а не в транспортере
    const info = await transporter.sendMail(message);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
};


class MessageController {
  

async createExel(req, res) {
  try {
    console.log('=== НАЧАЛО СОЗДАНИЯ EXCEL ===');
    
    const data = req.body;
    console.log('Получены данные:', data);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log('Ошибка: нет данных или не массив');
      return res.status(400).json({ error: 'Нет данных для обработки' });
    }
    
    const ids = data.map(id => parseInt(id)).filter(id => !isNaN(id));
    console.log('Преобразованные ID:', ids);
    
    if (ids.length === 0) {
      console.log('Ошибка: некорректные ID');
      return res.status(400).json({ error: 'Некорректные ID' });
    }

    // Один запрос вместо цикла
    const query = 'SELECT * FROM messages WHERE id = ANY($1) ORDER BY id';
    console.log('Выполняем запрос к БД:', query, ids);
    
    const dbResult = await pool.query(query, [ids]);
    console.log('Получено записей из БД:', dbResult.rows.length);
    
    if (dbResult.rows.length === 0) {
      console.log('Ошибка: данные не найдены');
      return res.status(404).json({ error: 'Данные не найдены' });
    }

    // Создаем Excel
    console.log('Создаем Excel файл...');
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    // Создаем лист
    const worksheet = workbook.addWorksheet('Сообщения');
    
    // Заголовки
    worksheet.columns = [
      { header: '№', key: 'number', width: 8 },
      { header: 'Дата и время', key: 'date', width: 20 },
      { header: 'ФИО', key: 'name', width: 25 },
      { header: 'Телефон', key: 'phone', width: 18 },
      { header: 'Комментарий', key: 'comment', width: 40 },
      { header: 'Центр', key: 'center', width: 20 },
      { header: 'Статус', key: 'status', width: 12 }
    ];
    
    // Стили для заголовков
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;
    
    // Заполняем данные
    dbResult.rows.forEach((item, index) => {
      const row = worksheet.addRow({
        number: index + 1,
        date: item.created_at ? new Date(item.created_at) : '',
        name: item.full_name || '',
        phone: item.phone || '',
        comment: item.comment || '',
        center: item.center || '',
        status: item.is_read ? 'Прочитано' : 'Новое'
      });
      
      // Форматирование даты
      if (item.created_at) {
        const dateCell = row.getCell('date');
        dateCell.numFmt = 'dd.mm.yyyy hh:mm';
        dateCell.alignment = { horizontal: 'left' };
      }
      
      // Цвет строки для непрочитанных сообщений
      if (!item.is_read) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF2CC' }
        };
      }
    });
    
    // Автоподбор ширины для всех колонок
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });
    
    // Настраиваем границы для всех ячеек
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    console.log('Excel файл создан успешно, отправляем...');
    
    // НАСТРОЙКА ЗАГОЛОВКОВ ОТВЕТА - ВАЖНО!
    const filename = `messages_${Date.now()}.xlsx`;
    
    res.setHeader('Content-Type', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 
      `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    
    console.log('Заголовки установлены, отправляем файл...');
    
    // Записываем файл в ответ
    await workbook.xlsx.write(res);
    
    console.log('Файл отправлен успешно');
    // НЕ вызываем res.end() - write() уже закрывает поток
    
  } catch (error) {
    console.error('КРИТИЧЕСКАЯ ОШИБКА в createExel:', error);
    console.error('Stack trace:', error.stack);
    
    // Если уже начали отправлять ответ, нельзя отправлять JSON
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: error.message 
      });
    } else {
      console.log('Не могу отправить JSON - заголовки уже отправлены');
    }
  }
}
  // Получить все сообщения (без пагинации)
  async getAllMessages(req, res) {
    try {
      const {
        center,
        is_read,
        search,
        start_date,
        end_date,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      // Валидация параметров сортировки
      const validSortColumns = ['created_at', 'id', 'full_name', 'center'];
      const validSortOrder = ['ASC', 'DESC'];
      
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
      const order = validSortOrder.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

      let query = `
        SELECT 
          id, 
          created_at, 
          phone, 
          full_name, 
          comment, 
          center, 
          is_read, 
          read_at
        FROM messages
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      // Фильтр по центру
      if (center) {
        query += ` AND center = $${paramIndex}`;
        params.push(center);
        paramIndex++;
      }

      // Фильтр по статусу прочтения
      if (is_read !== undefined) {
        query += ` AND is_read = $${paramIndex}`;
        params.push(is_read === 'true');
        paramIndex++;
      }

      // Поиск по имени или телефону
      if (search) {
        query += ` AND (full_name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Фильтр по дате создания
      if (start_date) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }

      // Сортировка
      query += ` ORDER BY ${sortColumn} ${order}`;

      const result = await pool.query(query, params);

      // Получаем общее количество для статистики (отдельным запросом)
      let countQuery = `SELECT COUNT(*) as total_count FROM messages WHERE 1=1`;
      const countParams = [];
      let countParamIndex = 1;

      if (center) {
        countQuery += ` AND center = $${countParamIndex}`;
        countParams.push(center);
        countParamIndex++;
      }

      if (is_read !== undefined) {
        countQuery += ` AND is_read = $${countParamIndex}`;
        countParams.push(is_read === 'true');
        countParamIndex++;
      }

      if (search) {
        countQuery += ` AND (full_name ILIKE $${countParamIndex} OR phone ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }

      if (start_date) {
        countQuery += ` AND created_at >= $${countParamIndex}`;
        countParams.push(start_date);
        countParamIndex++;
      }

      if (end_date) {
        countQuery += ` AND created_at <= $${countParamIndex}`;
        countParams.push(end_date);
        countParamIndex++;
      }

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total_count);
      const notRead = result.rows.filter (a => a.is_read === false)

      res.json({
        success: true,
        data: result.rows,
        meta: {
          total,
          filtered: result.rows.length,
          notRead : notRead.length
        }
      });

    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Получить одно сообщение по ID
  async getMessageById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM messages WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error fetching message:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Создать новое сообщение (публичный endpoint)
  async createMessage(req, res) {
  try {
    const { phone, full_name, comment, center } = req.body;

    // Валидация обязательных полей
    if (!phone || !full_name || !center) {
      return res.status(400).json({
        success: false,
        error: 'Phone, full_name and center are required'
      });
    }

    // Валидация центра
    const validCenters = ['ТРЦ Happy Молл', 'ТЦ Победа плаза'];
    if (!validCenters.includes(center)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid center value'
      });
    }

    // Создание сообщения в БД
    const result = await pool.query(
      `INSERT INTO messages (phone, full_name, comment, center)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [phone, full_name, comment || null, center]
    );

    const newMessage = result.rows[0];

    // КРАСИВОЕ ПИСЬМО С ДАННЫМИ
    const mailOptions = {
      from: '"Сайт Парка" <altarev123456@mail.ru>',
      to: 'altarev123456@mail.ru',
      subject: `📬 Новая заявка - ${center}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 15px;
            }
            .header {
              background: linear-gradient(135deg, #FFE300 0%, #FFD700 100%);
              padding: 25px;
              border-radius: 15px 15px 0 0;
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #333;
              font-size: 24px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .center-badge {
              background: white;
              color: #333;
              padding: 15px 25px;
              border-radius: 50px;
              display: inline-block;
              font-size: 20px;
              font-weight: bold;
              margin-top: 15px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 15px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            .info-item {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #f0f0f0;
            }
            .info-item:last-child {
              border-bottom: none;
            }
            .label {
              font-size: 14px;
              color: #999;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 5px;
            }
            .value {
              font-size: 18px;
              color: #333;
              font-weight: 500;
            }
            .phone-value {
              font-size: 20px;
              color: #2ecc71;
              font-weight: bold;
            }
            .comment-value {
              font-size: 16px;
              color: #666;
              background: #f9f9f9;
              padding: 15px;
              border-radius: 10px;
              border-left: 4px solid #FFE300;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              background: #f0f0f0;
              border-radius: 10px;
              font-size: 12px;
              color: #999;
            }
            .emoji {
              font-size: 24px;
              margin-right: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎪 Новая заявка с сайта</h1>
              <div class="center-badge">
                🏢 ${center}
              </div>
            </div>
            
            <div class="content">
              <div class="info-item">
                <div class="label">
                  <span class="emoji">👤</span> Имя клиента
                </div>
                <div class="value">${full_name}</div>
              </div>
              
              <div class="info-item">
                <div class="label">
                  <span class="emoji">📞</span> Контактный телефон
                </div>
                <div class="phone-value">
                  <a href="tel:${phone}" style="color: #2ecc71; text-decoration: none;">${phone}</a>
                </div>
              </div>
              
              <div class="info-item">
                <div class="label">
                  <span class="emoji">💭</span> Комментарий
                </div>
                <div class="comment-value">
                  ${comment ? comment.replace(/\n/g, '<br>') : 'Комментарий не указан'}
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>📅 Дата и время заявки: ${new Date().toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}</p>
              <p>🆔 ID заявки: ${newMessage.id}</p>
              <p>📊 Статус: <span style="color: #e74c3c; font-weight: bold;">Новая заявка</span></p>
              <p style="margin-top: 15px; color: #666;">
                ⚡ Ответьте клиенту в ближайшее время по указанному номеру телефона
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Отправляем письмо (не ждем, чтобы не задерживать ответ)
    mailer(mailOptions)
      .then(() => console.log('✅ Письмо с заявкой отправлено'))
      .catch(err => console.error('❌ Ошибка отправки письма:', err));

    // Отвечаем пользователю
    res.status(201).json({
      success: true,
      message: 'Заявка успешно создана',
      data: newMessage
    });

  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

  // Обновить статус прочтения сообщения
  async updateMessageReadStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_read } = req.body;

      if (typeof is_read !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'is_read must be a boolean'
        });
      }

      // Проверяем существование сообщения
      const checkResult = await pool.query(
        'SELECT * FROM messages WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }

      const read_at = is_read ? new Date() : null;
      
      const result = await pool.query(
        `UPDATE messages 
         SET is_read = $1, read_at = $2
         WHERE id = $3
         RETURNING *`,
        [is_read, read_at, id]
      );

      res.json({
        success: true,
        message: `Message marked as ${is_read ? 'read' : 'unread'}`,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error updating message status:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Обновить сообщение
  async updateMessage(req, res) {
    try {
      const { id } = req.params;
      const { phone, full_name, comment, center, is_read } = req.body;

      // Проверяем существование сообщения
      const checkResult = await pool.query(
        'SELECT * FROM messages WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }

      // Валидация центра если предоставлен
      if (center) {
        const validCenters = ['ТРЦ Happy Молл', 'ТЦ Победа плаза'];
        if (!validCenters.includes(center)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid center value'
          });
        }
      }

      // Собираем поля для обновления
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (phone !== undefined) {
        updateFields.push(`phone = $${paramIndex}`);
        values.push(phone);
        paramIndex++;
      }

      if (full_name !== undefined) {
        updateFields.push(`full_name = $${paramIndex}`);
        values.push(full_name);
        paramIndex++;
      }

      if (comment !== undefined) {
        updateFields.push(`comment = $${paramIndex}`);
        values.push(comment);
        paramIndex++;
      }

      if (center !== undefined) {
        updateFields.push(`center = $${paramIndex}`);
        values.push(center);
        paramIndex++;
      }

      if (is_read !== undefined) {
        updateFields.push(`is_read = $${paramIndex}`);
        values.push(is_read);
        updateFields.push(`read_at = $${paramIndex + 1}`);
        values.push(is_read ? new Date() : null);
        paramIndex += 2;
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      values.push(id);

      const query = `
        UPDATE messages 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      res.json({
        success: true,
        message: 'Message updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error updating message:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Удалить сообщение
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;

      // Проверяем существование сообщения
      const checkResult = await pool.query(
        'SELECT * FROM messages WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }

      await pool.query(
        'DELETE FROM messages WHERE id = $1',
        [id]
      );

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Получить статистику по сообщениям
  async getMessagesStats(req, res) {
    try {
      const { start_date, end_date, center } = req.query;

      let query = `
        SELECT 
          COUNT(*) as total_messages,
          COUNT(CASE WHEN is_read = true THEN 1 END) as read_messages,
          COUNT(CASE WHEN is_read = false THEN 1 END) as unread_messages,
          center,
          DATE(created_at) as date
        FROM messages
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;

      if (start_date) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }

      if (center) {
        query += ` AND center = $${paramIndex}`;
        params.push(center);
        paramIndex++;
      }

      query += `
        GROUP BY center, DATE(created_at)
        ORDER BY DATE(created_at) DESC
      `;

      const result = await pool.query(query, params);

      // Агрегируем данные по датам
      const statsByDate = {};
      let totalAll = 0;
      let readAll = 0;
      let unreadAll = 0;

      result.rows.forEach(row => {
        const date = row.date.toISOString().split('T')[0];
        
        if (!statsByDate[date]) {
          statsByDate[date] = {
            date,
            total: 0,
            read: 0,
            unread: 0,
            centers: {}
          };
        }

        statsByDate[date].total += parseInt(row.total_messages);
        statsByDate[date].read += parseInt(row.read_messages);
        statsByDate[date].unread += parseInt(row.unread_messages);
        statsByDate[date].centers[row.center] = {
          total: parseInt(row.total_messages),
          read: parseInt(row.read_messages),
          unread: parseInt(row.unread_messages)
        };

        totalAll += parseInt(row.total_messages);
        readAll += parseInt(row.read_messages);
        unreadAll += parseInt(row.unread_messages);
      });

      const statsArray = Object.values(statsByDate);

      res.json({
        success: true,
        data: {
          total: totalAll,
          read: readAll,
          unread: unreadAll,
          dailyStats: statsArray,
          summary: {
            readPercentage: totalAll > 0 ? Math.round((readAll / totalAll) * 100) : 0,
            unreadPercentage: totalAll > 0 ? Math.round((unreadAll / totalAll) * 100) : 0
          }
        }
      });

    } catch (error) {
      console.error('Error fetching messages stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Получить количество непрочитанных сообщений
  async getUnreadCount(req, res) {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM messages WHERE is_read = false'
      );

      res.json({
        success: true,
        data: {
          unread_count: parseInt(result.rows[0].count)
        }
      });

    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Отметить все сообщения как прочитанные
  async markAllAsRead(req, res) {
    try {
      const result = await pool.query(
        `UPDATE messages 
         SET is_read = true, read_at = CURRENT_TIMESTAMP
         WHERE is_read = false
         RETURNING COUNT(*) as updated_count`
      );

      const updatedCount = parseInt(result.rows[0].updated_count);

      res.json({
        success: true,
        message: `Marked ${updatedCount} messages as read`,
        data: {
          updated_count: updatedCount
        }
      });

    } catch (error) {
      console.error('Error marking all messages as read:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = new MessageController();