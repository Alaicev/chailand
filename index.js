const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const imageRoutes = require('./routes/imageRoutes');
const prizeRoutes = require('./routes/prizeRoutes');
const packetRoutes = require('./routes/packetRoutes');
const routerGalerey = require('./routes/galleryRoutes');
const messageRouter = require('./routes/messageRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5070;
app.use(express.json());

app.use(cors({
  origin: "*",

}));

// 1. Middleware

// 2. API (САМЫЕ ПЕРВЫЕ)
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/prizes', prizeRoutes);
app.use('/api/packets', packetRoutes);
app.use('/api/gallery', routerGalerey);
app.use('/api/messages', messageRouter);

// 3. Статика
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. ADMIN
const adminPath = path.join(__dirname, './admin/dist');
app.use('/admin', express.static(adminPath));

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminPath, 'index.html'));
});

// 5. FRONTEND (ПОСЛЕДНИЙ!)
const frontPath = path.join(__dirname, './front/dist');
app.use(express.static(frontPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontPath, 'index.html'));
});
// // Статические файлы React админки
// const adminBuildPath = path.join(__dirname, './admin/dist');
// app.use('/admin', express.static(adminBuildPath));

// Маршруты API

// Главная страница API
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'API Management System',
//     endpoints: {
//       images: {
//         upload: 'POST /api/images/upload',
//         get_all: 'GET /api/images',
//         get_one: 'GET /api/images/:id',
//         delete: 'DELETE /api/images/:id'
//       },
//       uploads: 'http://localhost:5070/uploads/имя_файла.jpg'
//     }
//   });
// });

// SPA роутинг для админки
// app.get(['/admin', '/admin/*'], (req, res) => {
//   res.sendFile(path.join(adminBuildPath, 'index.html'));
// });

// Обработчик 404 для API
// app.use('/api/*', (req, res) => {
//   res.status(404).json({ 
//     error: 'API endpoint not found',
//     message: `Route ${req.originalUrl} does not exist`
//   });
// });

app.listen(PORT, () => {
console.log(`Server started on http://localhost:${PORT}`);
});