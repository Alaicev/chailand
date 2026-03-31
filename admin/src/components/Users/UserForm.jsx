import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUser = async () => {
    try {
      // Для получения пользователя по ID нужно создать соответствующий endpoint
      // Пока используем существующий или пропускаем
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Не удалось загрузить пользователя');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Имя обязательно');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email обязателен');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Введите корректный email');
      return false;
    }
    
    if (!isEditMode && !formData.password) {
      setError('Пароль обязателен');
      return false;
    }
    
    if (formData.password && formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };
      
      // Добавляем пароль только при создании
      if (!isEditMode) {
        userData.password = formData.password;
      }
      
      // Только админ может менять роль
      if (currentUser?.role === 'admin' && isEditMode) {
        userData.role = formData.role;
      }
      
      if (isEditMode) {
        // Обновление пользователя
        await userAPI.updateUser(id, userData);
        alert('Пользователь обновлен!');
      } else {
        // Создание пользователя
        await userAPI.register(userData);
        alert('Пользователь создан!');
      }
      
      navigate('/users');
      
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async () => {
    if (!window.confirm('Сделать этого пользователя администратором?')) return;
    
    try {
      await userAPI.activateUser(id);
      alert('Пользователь теперь администратор!');
      navigate('/users');
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>{isEditMode ? 'Редактировать пользователя' : 'Создать нового пользователя'}</h2>
        <button onClick={() => navigate('/users')} style={styles.backButton}>
          ← Назад к списку
        </button>
      </div>
      
      <div style={styles.card}>
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>Имя *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={styles.input}
              placeholder="Введите имя пользователя"
              disabled={loading}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={styles.input}
              placeholder="example@domain.com"
              disabled={loading || isEditMode} // Email нельзя менять при редактировании
            />
          </div>
          
          {!isEditMode && (
            <>
              <div style={styles.formGroup}>
                <label htmlFor="password" style={styles.label}>Пароль *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!isEditMode}
                  style={styles.input}
                  placeholder="Минимум 6 символов"
                  disabled={loading}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="confirmPassword" style={styles.label}>Подтвердите пароль *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isEditMode}
                  style={styles.input}
                  placeholder="Повторите пароль"
                  disabled={loading}
                />
              </div>
            </>
          )}
          
          {isEditMode && currentUser?.role === 'admin' && (
            <div style={styles.formGroup}>
              <label htmlFor="role" style={styles.label}>Роль</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={styles.select}
                disabled={loading}
              >
                <option value="user">👤 Пользователь</option>
                <option value="admin">👑 Администратор</option>
              </select>
            </div>
          )}
          
          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? 'Сохранение...' : (isEditMode ? 'Обновить' : 'Создать')}
            </button>
            
            {isEditMode && currentUser?.role === 'admin' && formData.role !== 'admin' && (
              <button
                type="button"
                onClick={handleMakeAdmin}
                style={styles.makeAdminButton}
                disabled={loading}
              >
                👑 Сделать админом
              </button>
            )}
            
            <button
              type="button"
              onClick={() => navigate('/users')}
              style={styles.cancelButton}
              disabled={loading}
            >
              Отмена
            </button>
          </div>
        </form>
        
        {isEditMode && (
          <div style={styles.tips}>
            <h4>Примечания:</h4>
            <ul style={styles.tipsList}>
              <li>Email пользователя нельзя изменить</li>
              <li>Для смены пароля пользователь должен использовать "Забыли пароль"</li>
              <li>Администраторы могут управлять всеми пользователями</li>
              <li>Обычные пользователи видят только свои данные</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
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
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    borderLeft: '4px solid #e74c3c',
  },
  form: {
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
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: 'white',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '30px',
  },
  submitButton: {
    padding: '15px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  makeAdminButton: {
    padding: '15px',
    backgroundColor: '#9b59b6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '15px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  tips: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  tipsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#7f8c8d',
  },
};

export default UserForm;