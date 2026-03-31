import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import PrizeList from './components/Prizes/PrizeList';
import PrizeForm from './components/Prizes/PrizeForm';
import PacketList from './components/Packets/PacketList';
import PacketForm from './components/Packets/PacketForm';
import ImageUpload from './components/Images/ImageUpload';
import GalleryList from './components/Gallery/GalleryList';
import UploadGallery from './components/Gallery/UploadGallery';
import UserList from './components/Users/UserList';
import UserForm from './components/Users/UserForm';
import MessagesList from './components/Message/MessagesList';

function App() {
  return (
    <BrowserRouter basename="admin">
      <AuthProvider >
        <Routes>
          {/* Публичный маршрут - логин */}
          <Route path="/login" element={<Login />} />
          
          {/* Защищенные маршруты */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            {/* Призы */}
            <Route path="prizes" element={<PrizeList />} />
            <Route path="prizes/new" element={<PrizeForm />} />
            <Route path="prizes/edit/:id" element={<PrizeForm />} />
            
            {/* Пакеты */}
            <Route path="packets" element={<PacketList />} />
            <Route path="packets/new" element={<PacketForm />} />
            <Route path="packets/edit/:id" element={<PacketForm />} />
            
            {/* Изображения */}
            <Route path="images" element={<ImageUpload />} />
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />

            <Route path="gallery" element={<GalleryList />} />
            <Route path="gallery/upload" element={<UploadGallery />} />

            <Route path="users" element={<UserList />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/edit/:id" element={<UserForm />} />
            <Route path="message" element={<MessagesList />} />

          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;