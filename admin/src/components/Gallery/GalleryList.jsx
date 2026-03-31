import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { galleryAPI } from '../../services/api';

const CENTERS = {
  ALL: 'all',
  HAPPY_MALL: 'ТРЦ Happy Молл',
  VICTORY_PLAZA: 'ТЦ Победа плаза'
};

const GalleryList = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(CENTERS.ALL);
  const [stats, setStats] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchImages();
  }, [activeTab, page]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const center = activeTab === CENTERS.ALL ? null : activeTab;
      const response = await galleryAPI.getPaginated(page, 12, center);
      setImages(response.data.images || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await galleryAPI.getStats();
      setStats(response.data.stats || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить это изображение из галереи?')) {
      try {
        await galleryAPI.delete(id);
        setImages(images.filter(img => img.id !== id));
        fetchStats(); // Обновляем статистику
      } catch (error) {
        alert('Ошибка удаления: ' + error.response?.data?.error);
      }
    }
  };

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // Сбрасываем пагинацию при смене вкладки
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const getCenterStats = (centerName) => {
    const stat = stats.find(s => s.name_center === centerName);
    return stat ? stat.image_count : 0;
  };

  // Стили вынесены в отдельный объект
  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      marginBottom: '30px',
    },
    headerActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '15px',
    },
    addButton: {
      backgroundColor: '#3498db',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '6px',
      textDecoration: 'none',
      fontWeight: 'bold',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
    },
    viewToggle: {
      display: 'flex',
      gap: '10px',
    },
    viewButton: {
      padding: '10px 20px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s',
    },
    activeViewButton: {
      backgroundColor: '#3498db',
      color: 'white',
      borderColor: '#3498db',
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      flexWrap: 'wrap',
    },
    tab: {
      flex: 1,
      minWidth: '200px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      border: '2px solid #e0e0e0',
      borderRadius: '10px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.3s',
    },
    activeTab: {
      backgroundColor: '#e3f2fd',
      borderColor: '#3498db',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)',
    },
    tabContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    tabTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    tabCount: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#3498db',
    },
    centerInfo: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '30px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    centerDescription: {
      color: '#7f8c8d',
      fontSize: '16px',
      marginTop: '10px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '25px',
      marginBottom: '30px',
    },
    masonry: {
      columnCount: 4,
      columnGap: '20px',
    },
    gridItem: {
      breakInside: 'avoid',
      marginBottom: '25px',
    },
    masonryItem: {
      breakInside: 'avoid',
      marginBottom: '25px',
    },
    imageContainer: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '12px',
      backgroundColor: '#f8f9fa',
      cursor: 'pointer',
      height: '280px',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)',
      opacity: 0,
      transition: 'opacity 0.3s',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    imageBadge: {
      alignSelf: 'flex-start',
    },
    centerBadge: {
      backgroundColor: '#3498db',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    imageActions: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    deleteButton: {
      padding: '8px 16px',
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    imageInfo: {
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '0 0 12px 12px',
    },
    imageMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#7f8c8d',
      marginBottom: '5px',
    },
    imageCenter: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#2c3e50',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
      marginTop: '40px',
      padding: '20px',
    },
    pageButton: {
      padding: '12px 24px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s',
    },
    pageInfo: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    empty: {
      textAlign: 'center',
      padding: '60px',
      backgroundColor: 'white',
      borderRadius: '15px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      marginTop: '30px',
    },
    emptyIcon: {
      fontSize: '60px',
      marginBottom: '20px',
    },
    emptyButton: {
      display: 'inline-block',
      marginTop: '20px',
      padding: '15px 30px',
      backgroundColor: '#2ecc71',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '16px',
    },
    loading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '50vh',
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modalContent: {
      position: 'relative',
      maxWidth: '90%',
      maxHeight: '90%',
      backgroundColor: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      width: '800px',
    },
    modalClose: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      fontSize: '24px',
      cursor: 'pointer',
      zIndex: 1001,
    },
    modalHeader: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #eee',
    },
    modalDate: {
      color: '#7f8c8d',
      fontSize: '14px',
      marginTop: '5px',
    },
    modalImage: {
      width: '100%',
      height: 'auto',
      maxHeight: '60vh',
      objectFit: 'contain',
      display: 'block',
    },
    modalInfo: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
    },
    modalActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
    },
    modalLink: {
      padding: '10px 20px',
      backgroundColor: '#3498db',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    modalDelete: {
      padding: '10px 20px',
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
  };

  // Функция для получения стилей с hover эффектом
  const getImageContainerStyle = (isHovered) => ({
    ...styles.imageContainer,
    '&:hover $image': {
      transform: 'scale(1.05)',
    },
    '&:hover $imageOverlay': {
      opacity: 1,
    },
  });

  if (loading && images.length === 0) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Загрузка галереи...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Галерея торговых центров</h2>
        <div style={styles.headerActions}>
          <Link to="/gallery/upload" style={styles.addButton}>
            📤 Загрузить изображение
          </Link>
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'grid' && styles.activeViewButton)
              }}
            >
              ▦ Сетка
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'masonry' && styles.activeViewButton)
              }}
            >
              ▧ Каменная кладка
            </button>
          </div>
        </div>
      </div>

      {/* Вкладки центров */}
      <div style={styles.tabs}>
        <button
          onClick={() => handleTabChange(CENTERS.ALL)}
          style={{
            ...styles.tab,
            ...(activeTab === CENTERS.ALL && styles.activeTab)
          }}
        >
          <div style={styles.tabContent}>
            <span style={styles.tabTitle}>Все фото</span>
            <span style={styles.tabCount}>
              {stats.reduce((total, stat) => total + parseInt(stat.image_count), 0)}
            </span>
          </div>
        </button>

        <button
          onClick={() => handleTabChange(CENTERS.HAPPY_MALL)}
          style={{
            ...styles.tab,
            ...(activeTab === CENTERS.HAPPY_MALL && styles.activeTab)
          }}
        >
          <div style={styles.tabContent}>
            <span style={styles.tabTitle}>ТРЦ Happy Молл</span>
            <span style={styles.tabCount}>{getCenterStats(CENTERS.HAPPY_MALL)}</span>
          </div>
        </button>

        <button
          onClick={() => handleTabChange(CENTERS.VICTORY_PLAZA)}
          style={{
            ...styles.tab,
            ...(activeTab === CENTERS.VICTORY_PLAZA && styles.activeTab)
          }}
        >
          <div style={styles.tabContent}>
            <span style={styles.tabTitle}>ТЦ Победа плаза</span>
            <span style={styles.tabCount}>{getCenterStats(CENTERS.VICTORY_PLAZA)}</span>
          </div>
        </button>
      </div>

      {/* Информация о выбранном центре */}
      <div style={styles.centerInfo}>
        <h3>
          {activeTab === CENTERS.ALL ? 'Все торговые центры' : activeTab}
        </h3>
        <p style={styles.centerDescription}>
          {activeTab === CENTERS.HAPPY_MALL && 'Галерея фотографий ТРЦ Happy Молл'}
          {activeTab === CENTERS.VICTORY_PLAZA && 'Галерея фотографий ТЦ Победа плаза'}
          {activeTab === CENTERS.ALL && 'Фотографии всех торговых центров'}
        </p>
      </div>

      {/* Галерея */}
      {images.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🖼️</div>
          <h3>В этой галерее пока нет фотографий</h3>
          <p>Загрузите первое изображение для {activeTab === CENTERS.ALL ? 'этого центра' : activeTab}</p>
          <Link to="/gallery/upload" style={styles.emptyButton}>
            📤 Загрузить фото
          </Link>
        </div>
      ) : (
        <>
          <div style={viewMode === 'grid' ? styles.grid : styles.masonry}>
            {images.map((image) => (
              <div 
                key={image.id} 
                style={viewMode === 'grid' ? styles.gridItem : styles.masonryItem}
                onClick={() => openModal(image)}
                onMouseEnter={(e) => {
                  // Добавляем hover эффект через JavaScript
                  const img = e.currentTarget.querySelector('img');
                  const overlay = e.currentTarget.querySelector('[data-overlay]');
                  if (img) img.style.transform = 'scale(1.05)';
                  if (overlay) overlay.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  const overlay = e.currentTarget.querySelector('[data-overlay]');
                  if (img) img.style.transform = 'scale(1)';
                  if (overlay) overlay.style.opacity = '0';
                }}
              >
                <div style={styles.imageContainer}>
                  <img
                    src={image.fullUrl || image.url}
                    alt={`Gallery ${image.id}`}
                    style={styles.image}
                    loading="lazy"
                  />
                  <div data-overlay style={styles.imageOverlay}>
                    <div style={styles.imageBadge}>
                      <span style={styles.centerBadge}>{image.name_center}</span>
                    </div>
                    <div style={styles.imageActions}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image.id);
                        }}
                        style={styles.deleteButton}
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </div>
                </div>
                <div style={styles.imageInfo}>
                  <div style={styles.imageMeta}>
                    <span>ID: {image.id}</span>
                    <span>{new Date(image.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.imageCenter}>
                    <small>{image.name_center}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                style={{
                  ...styles.pageButton,
                  ...(page === 1 && { backgroundColor: '#95a5a6', cursor: 'not-allowed' })
                }}
              >
                ← Назад
              </button>
              
              <span style={styles.pageInfo}>
                Страница {page} из {totalPages}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                style={{
                  ...styles.pageButton,
                  ...(page === totalPages && { backgroundColor: '#95a5a6', cursor: 'not-allowed' })
                }}
              >
                Вперед →
              </button>
            </div>
          )}
        </>
      )}

      {/* Модальное окно */}
      {selectedImage && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={closeModal}>
              ×
            </button>
            <div style={styles.modalHeader}>
              <h3>{selectedImage.name_center}</h3>
              <p style={styles.modalDate}>
                Загружено: {new Date(selectedImage.created_at).toLocaleString()}
              </p>
            </div>
            <img
              src={selectedImage.fullUrl || selectedImage.url}
              alt="Full size"
              style={styles.modalImage}
            />
            <div style={styles.modalInfo}>
              <div style={styles.modalActions}>
                <a
                  href={selectedImage.fullUrl || selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.modalLink}
                >
                  📁 Открыть оригинал
                </a>
                <button
                  onClick={() => handleDelete(selectedImage.id)}
                  style={styles.modalDelete}
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryList;