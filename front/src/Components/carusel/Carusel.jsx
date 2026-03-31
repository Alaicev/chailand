import React, { useState, useEffect, useRef, useCallback } from 'react';
import { imageAPI } from './../../services/api';
import './Carousel.css';

function Carousel(props) {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchImages = async () => {
    try {
      const response = await imageAPI.getAll();
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Автопрокрутка каждые 3 секунды (быстрее)
  useEffect(() => {
    if (images.length > 1) {
      startAutoScroll();
    }
    
    return () => {
      stopAutoScroll();
    };
  }, [images.length, currentIndex]);

  const startAutoScroll = () => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(() => {
      goToNext();
    }, 3000); // 3 секунды вместо 5
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const goToNext = useCallback(() => {
    if (isTransitioning || images.length === 0) return;
    
    setIsTransitioning(true);
    
    if (currentIndex === images.length - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [images.length, isTransitioning, currentIndex]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || images.length === 0) return;
    
    setIsTransitioning(true);
    
    // Если текущий элемент первый, переключаемся на последний
    if (currentIndex === 0) {
      setCurrentIndex(images.length - 1);
    } else {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [images.length, isTransitioning, currentIndex]);

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex || images.length === 0) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    
    // Сбрасываем таймер автопрокрутки
    stopAutoScroll();
    startAutoScroll();
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Пауза автопрокрутки при наведении
  const handleMouseEnter = () => {
    stopAutoScroll();
  };

  const handleMouseLeave = () => {
    startAutoScroll();
  };

  // Обработчики для тач-устройств
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNext();
    }
    
    if (isRightSwipe) {
      goToPrev();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (images.length === 0) {
    return (
      <div className="carousel-container loading">
        <div className="loading-text">Загрузка изображений...</div>
      </div>
    );
  }

  return (
    <div 
      className="carousel-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Карусель */}
      <div 
        className="carousel"
        ref={carouselRef}
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
        }}
      >
        {images.map((image, index) => (
          <div 
            key={image.id || index} 
            className="slide"
            style={{ backgroundImage: `url(${image.url})` }}
            aria-label={`Slide ${index + 1} of ${images.length}`}
          >
            <img 
              src={image.url} 
              alt={`Slide ${index + 1}`}
              className="slide-image"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Индикаторы (кружочки) */}
      {images.length > 1 && (
        <div className="indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            >
              <div className="indicator-outer">
                <div className="indicator-inner" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;