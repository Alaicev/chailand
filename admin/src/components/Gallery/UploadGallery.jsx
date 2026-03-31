import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleryAPI } from '../../services/api';

const UploadGallery = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [isMultiple, setIsMultiple] = useState(false);
  const [formData, setFormData] = useState({
    name_center: ''
  });

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (isMultiple && files.length > 0) {
      setMultipleFiles(files);
      // Показываем превью первого файла
      if (files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
        };
        reader.readAsDataURL(files[0]);
      }
      setSelectedFile(null);
    } else {
      const file = files[0];
      if (file) {
        setSelectedFile(file);
        setMultipleFiles([]);
        
        // Создаем превью
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async () => {
    if ((!selectedFile && multipleFiles.length === 0) || uploading) {
      setMessage('Выберите файл для загрузки');
      return;
    }

    if (!formData.name_center) {
      setMessage('Выберите торговый центр');
      return;
    }

    setUploading(true);
    setMessage('');
    setUploadProgress(0);

    try {
      if (isMultiple && multipleFiles.length > 0) {
        // Множественная загрузка
        const uploadPromises = multipleFiles.map(async (file, index) => {
          const formDataObj = new FormData();
          formDataObj.append('image', file);
          formDataObj.append('name_center', formData.name_center);
          
          const response = await galleryAPI.upload(formDataObj);
          
          // Обновляем прогресс
          setUploadProgress(((index + 1) / multipleFiles.length) * 100);
          
          return response.data;
        });

        const results = await Promise.all(uploadPromises);
        setMessage(`Успешно загружено ${results.length} изображений!`);
        setMultipleFiles([]);
      } else {
        // Одиночная загрузка
        const formDataObj = new FormData();
        formDataObj.append('image', selectedFile);
        formDataObj.append('name_center', formData.name_center);

        // Симуляция прогресса загрузки
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const response = await galleryAPI.upload(formDataObj);
        
        clearInterval(interval);
        setUploadProgress(100);
        
        setMessage('Изображение успешно загружено в галерею!');
        setSelectedFile(null);
        setPreview(null);
      }

      // Сбрасываем форму
      document.getElementById('fileInput').value = '';
      
      // Возвращаемся к галерее через 2 секунды
      setTimeout(() => {
        navigate('/gallery');
      }, 2000);

    } catch (error) {
      setMessage('Ошибка загрузки: ' + (error.response?.data?.error || error.message));
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/gallery');
  };

  const clearForm = () => {
    setSelectedFile(null);
    setMultipleFiles([]);
    setPreview(null);
    setFormData({ name_center: '' });
    document.getElementById('fileInput').value = '';
    setMessage('');
  };

  // Стили
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
    },
    backButton: {
      padding: '10px 20px',
      backgroundColor: '#95a5a6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    card: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    toggleSection: {
      marginBottom: '20px',
      paddingBottom: '20px',
      borderBottom: '1px solid #eee',
    },
    toggleLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
    },
    toggleCheckbox: {
      width: '20px',
      height: '20px',
    },
    toggleText: {
      fontSize: '16px',
      fontWeight: '500',
    },
    uploadSection: {
      marginBottom: '30px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#34495e',
      fontSize: '16px',
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '2px solid #ddd',
      borderRadius: '6px',
      fontSize: '16px',
      backgroundColor: 'white',
    },
    dropZone: {
      border: '3px dashed #3498db',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginBottom: '20px',
      minHeight: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadPlaceholder: {
      textAlign: 'center',
    },
    uploadIcon: {
      fontSize: '60px',
      marginBottom: '20px',
      color: '#3498db',
    },
    uploadText: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '10px',
    },
    uploadHint: {
      fontSize: '14px',
      color: '#7f8c8d',
      lineHeight: '1.5',
    },
    previewContainer: {
      position: 'relative',
      maxWidth: '100%',
    },
    previewImage: {
      maxWidth: '100%',
      maxHeight: '400px',
      borderRadius: '8px',
    },
    multipleBadge: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: '#3498db',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    progressContainer: {
      margin: '20px 0',
    },
    progressBar: {
      width: '100%',
      height: '20px',
      backgroundColor: '#f0f0f0',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '10px',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#2ecc71',
      transition: 'width 0.3s',
    },
    progressText: {
      textAlign: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    fileInfo: {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      fontSize: '14px',
    },
    fileList: {
      marginTop: '10px',
      maxHeight: '200px',
      overflowY: 'auto',
    },
    fileListItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #eee',
    },
    buttonGroup: {
      display: 'flex',
      gap: '15px',
      marginTop: '30px',
    },
    uploadButton: {
      flex: 1,
      padding: '15px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    disabledButton: {
      backgroundColor: '#95a5a6',
      cursor: 'not-allowed',
    },
    clearButton: {
      flex: 1,
      padding: '15px',
      backgroundColor: '#95a5a6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
    },
    message: {
      marginTop: '20px',
      padding: '15px',
      borderRadius: '8px',
      backgroundColor: '#e8f4fc',
      color: '#2c3e50',
      borderLeft: '4px solid #3498db',
      fontSize: '16px',
    },
    tips: {
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
    },
    errorMessage: {
      marginTop: '20px',
      padding: '15px',
      borderRadius: '8px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      borderLeft: '4px solid #e74c3c',
      fontSize: '16px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Загрузка в галерею</h2>
        <button onClick={handleCancel} style={styles.backButton}>
          ← Назад к галерее
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.toggleSection}>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={isMultiple}
              onChange={(e) => {
                setIsMultiple(e.target.checked);
                setSelectedFile(null);
                setMultipleFiles([]);
                setPreview(null);
              }}
              style={styles.toggleCheckbox}
            />
            <span style={styles.toggleText}>
              {isMultiple ? 'Множественная загрузка' : 'Одиночная загрузка'}
            </span>
          </label>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="name_center" style={styles.label}>
            Выберите торговый центр *
          </label>
          <select
            id="name_center"
            name="name_center"
            value={formData.name_center}
            onChange={handleInputChange}
            required
            style={styles.select}
            disabled={uploading}
          >
            <option value="">-- Выберите центр --</option>
            <option value="ТРЦ Happy Молл">ТРЦ Happy Молл</option>
            <option value="ТЦ Победа плаза">ТЦ Победа плаза</option>
          </select>
        </div>

        <div style={styles.uploadSection}>
          <div style={styles.dropZone} onClick={() => document.getElementById('fileInput').click()}>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              multiple={isMultiple}
              disabled={uploading}
            />
            
            {preview ? (
              <div style={styles.previewContainer}>
                <img src={preview} alt="Preview" style={styles.previewImage} />
                {isMultiple && multipleFiles.length > 1 && (
                  <div style={styles.multipleBadge}>
                    +{multipleFiles.length - 1} файлов
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.uploadPlaceholder}>
                <div style={styles.uploadIcon}>📤</div>
                <p style={styles.uploadText}>
                  {isMultiple 
                    ? 'Нажмите для выбора нескольких изображений' 
                    : 'Нажмите для выбора изображения'}
                </p>
                <p style={styles.uploadHint}>
                  Поддерживаемые форматы: JPEG, PNG, GIF, WebP, SVG
                  <br />
                  Максимальный размер: 10MB
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${uploadProgress}%`
                  }}
                ></div>
              </div>
              <span style={styles.progressText}>
                {Math.round(uploadProgress)}%
              </span>
            </div>
          )}

          <div style={styles.fileInfo}>
            {selectedFile && (
              <>
                <strong>Выбран файл:</strong>
                <p>Имя: {selectedFile.name}</p>
                <p>Размер: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Тип: {selectedFile.type}</p>
              </>
            )}

            {isMultiple && multipleFiles.length > 0 && (
              <>
                <strong>Выбрано файлов: {multipleFiles.length}</strong>
                <div style={styles.fileList}>
                  {multipleFiles.map((file, index) => (
                    <div key={index} style={styles.fileListItem}>
                      <span>{index + 1}. {file.name}</span>
                      <span>{(file.size / 1024).toFixed(2)} KB</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={handleUpload}
              disabled={uploading || (!selectedFile && multipleFiles.length === 0) || !formData.name_center}
              style={{
                ...styles.uploadButton,
                ...((uploading || (!selectedFile && multipleFiles.length === 0) || !formData.name_center) && styles.disabledButton)
              }}
            >
              {uploading 
                ? (isMultiple ? 'Загрузка...' : 'Загрузка...') 
                : (isMultiple ? `Загрузить ${multipleFiles.length} файлов` : 'Загрузить в галерею')}
            </button>

            <button
              onClick={clearForm}
              disabled={uploading}
              style={styles.clearButton}
            >
              Очистить
            </button>
          </div>
        </div>

        {message && (
          <div style={message.includes('Ошибка') ? styles.errorMessage : styles.message}>
            {message}
          </div>
        )}

        <div style={styles.tips}>
          <h4>Советы по загрузке:</h4>
          <ul>
            <li>Используйте изображения с разрешением не менее 800x600 пикселей</li>
            <li>Оптимальный размер файла: 1-5 MB</li>
            <li>Поддерживаются форматы: JPG, PNG, GIF, WebP, SVG</li>
            <li>Для лучшего качества используйте сжатые изображения</li>
            <li>Не забудьте выбрать торговый центр перед загрузкой</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadGallery;