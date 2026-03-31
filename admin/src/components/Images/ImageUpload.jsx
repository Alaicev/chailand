import React, { useState } from 'react';
import { imageAPI } from '../../services/api';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Выберите файл');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    setUploading(true);
    setMessage('');

    try {
      const response = await imageAPI.upload(formData);
      setMessage('Изображение успешно загружено!');
      setSelectedFile(null);
      document.getElementById('fileInput').value = '';
      fetchImages();
    } catch (error) {
      setMessage('Ошибка загрузки: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await imageAPI.getAll();
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить изображение?')) {
      try {
        await imageAPI.delete(id);
        setMessage('Изображение удалено');
        fetchImages();
      } catch (error) {
        setMessage('Ошибка удаления: ' + error.message);
      }
    }
  };

  // Загружаем изображения при монтировании компонента
  React.useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div style={styles.container}>
      <h2>Загрузка изображений</h2>
      
      <div style={styles.uploadSection}>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
        
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          style={styles.uploadButton}
        >
          {uploading ? 'Загрузка...' : 'Загрузить'}
        </button>
        
        {selectedFile && (
          <div style={styles.fileInfo}>
            Выбран файл: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>
      
      {message && (
        <div style={styles.message}>
          {message}
        </div>
      )}
      
      <h3>Загруженные изображения</h3>
      
      {images.length === 0 ? (
        <p>Нет загруженных изображений</p>
      ) : (
        <div style={styles.imageGrid}>
          {images.map((image) => (
            <div key={image.id} style={styles.imageCard}>
              <img
                src={image.url}
                alt={image.filename}
                style={styles.image}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
              <div style={styles.imageInfo}>
                <p style={styles.imageUrl}>
                  <a href={image.url} target="_blank" rel="noopener noreferrer">
                    Открыть
                  </a>
                </p>
                <button
                  onClick={() => handleDelete(image.id)}
                  style={styles.deleteButton}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  uploadSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  fileInput: {
    marginBottom: '15px',
    padding: '10px',
    width: '100%',
    border: '2px dashed #ddd',
    borderRadius: '4px',
  },
  uploadButton: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  fileInfo: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '14px',
  },
  message: {
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '4px',
    backgroundColor: '#e8f4fc',
    color: '#2c3e50',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  imageCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  imageInfo: {
    padding: '15px',
  },
  imageUrl: {
    marginBottom: '10px',
    wordBreak: 'break-all',
    fontSize: '14px',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
  },
};

export default ImageUpload;