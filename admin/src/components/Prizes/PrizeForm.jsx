import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { prizeAPI } from '../../services/api';

const PrizeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '', // Оставляем email для бэкенда
    points: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Маппинг центров на email-адреса
  const centerToEmailMap = {
    'happy_mall': 'happy-mall@example.com',
    'pobeda_plaza': 'pobeda-plaza@example.com'
  };

  // Обратный маппинг для отображения в select
  const emailToCenterMap = {
    'happy-mall@example.com': 'happy_mall',
    'pobeda-plaza@example.com': 'pobeda_plaza'
  };

  // Опции для select (что видит пользователь)
  const centerOptions = [
    { value: 'happy_mall', label: 'ТРЦ Happy Молл', email: 'happy-mall@example.com' },
    { value: 'pobeda_plaza', label: 'ТЦ Победа плаза', email: 'pobeda-plaza@example.com' }
  ];

  // Функция для получения center по email
  const getCenterFromEmail = (email) => {
    return emailToCenterMap[email] || '';
  };

  // Функция для получения email по center
  const getEmailFromCenter = (center) => {
    return centerToEmailMap[center] || '';
  };

  useEffect(() => {
    if (isEditMode) {
      fetchPrize();
    }
  }, [id]);

  const fetchPrize = async () => {
    try {
      const response = await prizeAPI.getById(id);
      const prize = response.data.prize;
      
      setFormData({
        name: prize.name || '',
        email: prize.email || '', // Сохраняем email как есть
        points: prize.points?.map(p => p.text) || [''],
      });
    } catch (error) {
      console.error('Error fetching prize:', error);
      setError('Не удалось загрузить цену');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Новый обработчик для select
  const handleCenterChange = (e) => {
    const selectedCenter = e.target.value;
    // Конвертируем center в email и сохраняем в formData.email
    const email = getEmailFromCenter(selectedCenter);
    setFormData(prev => ({
      ...prev,
      email: email
    }));
  };

  const handlePointChange = (index, value) => {
    const newPoints = [...formData.points];
    newPoints[index] = value;
    setFormData(prev => ({
      ...prev,
      points: newPoints,
    }));
  };

  const addPoint = () => {
    setFormData(prev => ({
      ...prev,
      points: [...prev.points, ''],
    }));
  };

  const removePoint = (index) => {
    if (formData.points.length > 1) {
      const newPoints = formData.points.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        points: newPoints,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация выбора центра
    if (!formData.email) {
      setError('Пожалуйста, выберите торговый центр');
      setLoading(false);
      return;
    }

    // Фильтруем пустые пункты
    const filteredPoints = formData.points.filter(point => point.trim() !== '');

    const prizeData = {
      name: formData.name.trim(),
      email: formData.email, // Отправляем email как раньше
      points: filteredPoints,
    };

    try {
      if (isEditMode) {
        await prizeAPI.update(id, prizeData);
        alert('Цена обновлен!');
      } else {
        await prizeAPI.create(prizeData);
        alert('Цена создан!');
      }
      navigate('/prizes');
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  // Получаем текущий выбранный center из email
  const currentCenter = getCenterFromEmail(formData.email);

  return (
    <div style={styles.container}>
      <h2>{isEditMode ? 'Редактировать цену' : 'Создать новый цену'}</h2>
      
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>
            Название *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={styles.input}
            placeholder="Введите название"
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="center" style={styles.label}>
            Выберите торговый центр *
          </label>
          <select
            id="center"
            name="center"
            value={currentCenter}
            onChange={handleCenterChange}
            required
            style={styles.select}
          >
            <option value="" disabled>
              -- Выберите торговый центр --
            </option>
            {centerOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Скрытое поле для отладки (можно удалить) */}
          <div style={styles.debugInfo}>
            <small>Email для отправки: {formData.email || 'не выбран'}</small>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Пункты цены</label>
          <div style={styles.pointsDescription}>
            Добавьте описание того, что входит в цену
          </div>
          
          {formData.points.map((point, index) => (
            <div key={index} style={styles.pointRow}>
              <input
                type="text"
                value={point}
                onChange={(e) => handlePointChange(index, e.target.value)}
                style={styles.pointInput}
                placeholder={`Пункт ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removePoint(index)}
                style={styles.removeButton}
                disabled={formData.points.length === 1}
                title="Удалить пункт"
              >
                ✕
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addPoint}
            style={styles.addButton}
          >
            + Добавить пункт
          </button>
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.disabledButton : {})
            }}
          >
            {loading ? 'Сохранение...' : (isEditMode ? 'Обновить' : 'Создать')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/prizes')}
            style={styles.cancelButton}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

// Стили (оставляем как в предыдущем ответе)
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#34495e',
    fontSize: '15px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.3s',
    marginBottom: '8px',
  },
  debugInfo: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '5px',
    fontStyle: 'italic',
  },
  pointsDescription: {
    fontSize: '13px',
    color: '#7f8c8d',
    marginBottom: '15px',
    fontStyle: 'italic',
  },
  pointRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
    alignItems: 'center',
  },
  pointInput: {
    flex: 1,
    padding: '10px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  removeButton: {
    padding: '10px 15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    minWidth: '45px',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#c0392b',
    },
    ':disabled': {
      backgroundColor: '#bdc3c7',
      cursor: 'not-allowed',
    },
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '10px',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#2980b9',
    },
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
  },
  submitButton: {
    flex: 2,
    padding: '15px 20px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#27ae60',
    },
  },
  cancelButton: {
    flex: 1,
    padding: '15px 20px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#7f8c8d',
    },
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: '#bdc3c7',
    },
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    fontSize: '14px',
  },
};

export default PrizeForm;