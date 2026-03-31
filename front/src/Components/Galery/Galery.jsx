import React, { useState, useEffect } from 'react';
import { galleryAPI } from '../../services/api';

const CENTERS = {
  HAPPY_MALL: 'ТРЦ Happy Молл',
  VICTORY_PLAZA: 'ТЦ Победа плаза'
};

function Gallery() {
  const [activeCenter, setActiveCenter] = useState(CENTERS.HAPPY_MALL);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Тексты-заглушки для каждого центра
  const centerTexts = {
    [CENTERS.HAPPY_MALL]: "Лучшее место для того ,чтобы отдохнуть, провести выходные или праздники находится совсем рядом- 2 этаж ТРЦ Happy Молл 2,находящийся по адресу Вольский тракт, 2/1.В ЧайЛэнде  вы попадете в увлекательный мир аттракционов и веселья, здесь вы сможете отдохнуть после тяжелых будней в компании огромного количества активностей . Здесь каждый найдет развлечение по душе: от просторных лабиринтов и батутов до механических каруселей. Пока ребятня резвится в парке , родители могут отдохнуть за чашечкой ароматного чая в уютной лаунж-зоне. ЧайЛэнд — это идеальное место для семейного досуга, где время пролетает незаметно и хочется возвращаться снова и снова.",
    [CENTERS.VICTORY_PLAZA]: "Наш парк находится по адресу: ул. имени Василия Люкшина, 5 в ТЦ Победа Плаза на 2 этаже. У нас вы сможете найти огромное количество аттракционов для активного времяпрепровождения, а также специальные комнаты для проведения ваших мероприятий и дней рождений. Вы можете принести с собой еду, на территории парка оборудованы места для того чтобы вы могли подкрепиться и насладиться чашечкой ароматного чая или кофе."
  };

  // Загрузка изображений при смене центра
  useEffect(() => {
    fetchImages();
  }, [activeCenter]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await galleryAPI.getAll(activeCenter);
      setImages(response.data.images || []);
      
      // Устанавливаем первое изображение как выбранное
      if (response.data.images && response.data.images.length > 0) {
        setSelectedImage(response.data.images[0]);
      } else {
        setSelectedImage(null);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Не удалось загрузить изображения');
    } finally {
      setLoading(false);
    }
  };

  const handleCenterChange = (center) => {
    setActiveCenter(center);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleMainImageClick = () => {
    if (selectedImage) {
      window.open(selectedImage.fullUrl, '_blank');
    }
  };

  if (loading && images.length === 0) {
    return (
      <div className="gallery-container">
        <div className="loading">Загрузка галереи...</div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="wrapper">
      <h2 className="title title-block">Наши парки</h2>
      {/* Кнопки выбора центра */}
      <div className="center-buttons">
        <button
          className={`center-button ${activeCenter === CENTERS.HAPPY_MALL ? 'active' : ''}`}
          onClick={() => handleCenterChange(CENTERS.HAPPY_MALL)}
        >
          ТРЦ Happy Молл
        </button>
        <button
          className={`center-button ${activeCenter === CENTERS.VICTORY_PLAZA ? 'active' : ''}`}
          onClick={() => handleCenterChange(CENTERS.VICTORY_PLAZA)}
        >
          ТЦ Победа плаза
        </button>
      </div>

      {/* Текст-заглушка для активного центра */}
      <div className="center-description">
        <p className="description-text">
          {centerTexts[activeCenter]}
        </p>
      </div>

      {/* Ошибка если есть */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Большое изображение */}
      {selectedImage && (
        <div className="main-image-container" onClick={handleMainImageClick}>
          <img 
            src={selectedImage.fullUrl} 
            alt="Main gallery" 
            className="main-image"
          />
          <div className="image-overlay">
            <span className="zoom-icon">🔍</span>
          </div>
        </div>
      )}

      {/* Сетка изображений */}
      {images.length > 0 ? (
        <div className="image-grid">
          {images.map((image) => (
            <div
              key={image.id}
              className={`grid-item ${selectedImage?.id === image.id ? 'active' : ''}`}
              onClick={() => handleImageClick(image)}
            >
              <img 
                src={image.fullUrl} 
                alt={`Gallery ${image.id}`} 
                className="grid-image"
              />
              {selectedImage?.id === image.id && (
                <div className="selected-indicator">
                  <span>✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="no-images">
            Нет изображений для выбранного центра
          </div>
        )
      )}
    </div>
    </div>
  );
}

export default Gallery;