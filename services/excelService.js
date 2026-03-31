// services/excelService.js
const ExcelJS = require('exceljs');
const path = require('path');

async function addDataToExcel(data) {
  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../exel', 'template.xlsx');
    
    // Пробуем загрузить шаблон
    try {
      await workbook.xlsx.readFile(filePath);
    } catch (templateError) {
      // Если шаблона нет, создаем новый файл
      const worksheet = workbook.addWorksheet('Данные');
      
      // Создаем заголовки
      worksheet.columns = [
        { header: '№', key: 'id', width: 10 },
        { header: 'Дата создания', key: 'created_at', width: 20 },
        { header: 'ФИО', key: 'full_name', width: 30 },
        { header: 'Телефон', key: 'phone', width: 20 },
        { header: 'Комментарий', key: 'comment', width: 50 }
      ];
      
      // Заполняем данные
      data.forEach((item, index) => {
        worksheet.addRow({
          id: index + 1,
          created_at: item.created_at ? new Date(item.created_at) : '',
          full_name: item.full_name || '',
          phone: item.phone || '',
          comment: item.comment || ''
        });
      });
      
      // Форматирование даты
      worksheet.getColumn('created_at').numFmt = 'dd.mm.yyyy hh:mm';
      
      return workbook;
    }
    
    // Если шаблон загружен успешно
    const worksheet = workbook.getWorksheet('My Sheet');
    
    // Заполняем данные начиная с 3 строки
    data.forEach((item, index) => {
      const row = worksheet.getRow(3 + index);
      row.getCell(1).value = index + 1;
      row.getCell(2).value = item.created_at;
      row.getCell(3).value = item.full_name;
      row.getCell(4).value = item.phone;
      row.getCell(5).value = item.comment;
    });
    
    return workbook;
    
  } catch (error) {
    console.error('Ошибка в addDataToExcel:', error);
    throw error;
  }
}

// Экспортируем функцию
module.exports = {
  addDataToExcel
};