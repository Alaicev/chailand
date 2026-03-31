import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packetAPI } from '../../services/api';

const PacketForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    points: [''],
    prices: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchPacket();
    }
  }, [id]);

  const fetchPacket = async () => {
    try {
      const response = await packetAPI.getById(id);
      const packet = response.data.packet;
      
      setFormData({
        name: packet.name || '',
        points: packet.points?.map(p => p.text) || [''],
        prices: packet.prices?.map(p => p.value) || [''],
      });
    } catch (error) {
      console.error('Error fetching packet:', error);
      setError('Не удалось загрузить пакет');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработчики для points
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

  // Обработчики для prices
  const handlePriceChange = (index, value) => {
    const newPrices = [...formData.prices];
    newPrices[index] = value;
    setFormData(prev => ({
      ...prev,
      prices: newPrices,
    }));
  };

  const addPrice = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, ''],
    }));
  };

  const removePrice = (index) => {
    if (formData.prices.length > 1) {
      const newPrices = formData.prices.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        prices: newPrices,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Фильтруем пустые значения
    const filteredPoints = formData.points.filter(point => point.trim() !== '');
    const filteredPrices = formData.prices.filter(price => price.trim() !== '');

    const packetData = {
      name: formData.name.trim(),
      points: filteredPoints,
      prices: filteredPrices,
    };

    try {
      if (isEditMode) {
        await packetAPI.update(id, packetData);
        alert('Пакет обновлен!');
      } else {
        await packetAPI.create(packetData);
        alert('Пакет создан!');
      }
      navigate('/packets');
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isEditMode ? 'Редактировать пакет' : 'Создать новый пакет'}</h2>
      
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Название пакета */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Название пакета *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={styles.input}
            placeholder="Введите название пакета"
          />
        </div>

        {/* Элементы пакета (points) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Элементы пакета</label>
          <div style={styles.sectionDescription}>
            Что входит в пакет (функции, возможности и т.д.)
          </div>
          
          {formData.points.map((point, index) => (
            <div key={`point-${index}`} style={styles.row}>
              <input
                type="text"
                value={point}
                onChange={(e) => handlePointChange(index, e.target.value)}
                style={styles.input}
                placeholder={`Элемент ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removePoint(index)}
                style={styles.removeButton}
                disabled={formData.points.length === 1}
                title="Удалить элемент"
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
            + Добавить элемент
          </button>
        </div>

        {/* Цены (prices) */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Цены</label>
          <div style={styles.sectionDescription}>
            Варианты цен (например: "3000₽/мес", "Бесплатно", "30000₽" и т.д.)
          </div>
          
          {formData.prices.map((price, index) => (
            <div key={`price-${index}`} style={styles.row}>
              <input
                type="text"
                value={price}
                onChange={(e) => handlePriceChange(index, e.target.value)}
                style={styles.input}
                placeholder={`Цена ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removePrice(index)}
                style={styles.removeButton}
                disabled={formData.prices.length === 1}
                title="Удалить цену"
              >
                ✕
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addPrice}
            style={styles.addButton}
          >
            + Добавить цену
          </button>
        </div>

        {/* Кнопки */}
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
            onClick={() => navigate('/packets')}
            style={styles.cancelButton}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px',
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#34495e',
    fontSize: '16px',
  },
  sectionDescription: {
    fontSize: '13px',
    color: '#7f8c8d',
    marginBottom: '15px',
    fontStyle: 'italic',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    transition: 'border-color 0.3s',
    ':focus': {
      borderColor: '#3498db',
      outline: 'none',
    },
  },
  row: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
    alignItems: 'center',
  },
  removeButton: {
    padding: '12px 15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    minWidth: '45px',
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
    marginTop: '10px',
    ':hover': {
      backgroundColor: '#2980b9',
    },
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
  },
  submitButton: {
    flex: 2,
    padding: '15px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
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
    padding: '15px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
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
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
  },
};

export default PacketForm;