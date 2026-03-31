import React, { useState, useEffect } from 'react';
import { messageAPI } from '../../services/api';
import { currentURL } from '../../url/url';

const CENTERS = {
  HAPPY_MALL: 'ТРЦ Happy Молл',
  VICTORY_PLAZA: 'ТЦ Победа плаза'
};

const MessagesList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(CENTERS.HAPPY_MALL);
  const [stats, setStats] = useState({});
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    // Загружаем сообщения для активной вкладки
    fetchMessages(activeTab);
    // Загружаем статистику для всех центров
    fetchAllCentersStats();
  }, [activeTab]);

  // Загружаем сообщения для конкретного центра
  const fetchMessages = async (center) => {
    setLoading(true);
    try {
      const response = await messageAPI.getAll({
        center: center,
        sort_by: 'created_at',
        sort_order: 'DESC'
      });
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем статистику для ВСЕХ центров
  const fetchAllCentersStats = async () => {
    try {
      const allStats = {};
      
      // Для каждого центра делаем запрос на общее количество и непрочитанные
      for (const key in CENTERS) {
        const center = CENTERS[key];
        
        // Получаем все сообщения для центра
        const allResponse = await messageAPI.getAll({
          center: center
        });
        
        // Получаем только непрочитанные сообщения для центра
        const unreadResponse = await messageAPI.getAll({
          center: center,
          is_read: false
        });
        
        const totalCount = allResponse.data.data ? allResponse.data.data.length : 0;
        const unreadCount = unreadResponse.data.data ? unreadResponse.data.data.length : 0;
        
        allStats[center] = {
          total: totalCount,
          unread: unreadCount
        };
      }
      
      setStats(allStats);
      
    } catch (error) {
      console.error('Error fetching all centers stats:', error);
    }
  };

  // Обработчик смены вкладки
  const handleTabChange = async (center) => {
    setActiveTab(center);
    setSelectedMessages([]); // Сбрасываем выделение при смене вкладки
  };

  const handleMarkAsRead = async (id) => {
    try {
      await messageAPI.updateReadStatus(id, true);
      
      // Обновляем локальное состояние
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, is_read: true, read_at: new Date() } : msg
      ));
      
      // Обновляем статистику
      setStats(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          unread: Math.max(0, prev[activeTab].unread - 1)
        }
      }));
      
    } catch (error) {
      alert('Ошибка обновления: ' + error.response?.data?.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить это сообщение?')) {
      try {
        await messageAPI.delete(id);
        
        // Получаем сообщение перед удалением
        const messageToDelete = messages.find(msg => msg.id === id);
        
        // Обновляем локальное состояние
        const newMessages = messages.filter(msg => msg.id !== id);
        setMessages(newMessages);
        
        // Обновляем статистику
        setStats(prev => ({
          ...prev,
          [activeTab]: {
            total: newMessages.length,
            unread: messageToDelete && !messageToDelete.is_read 
              ? Math.max(0, prev[activeTab].unread - 1)
              : prev[activeTab].unread
          }
        }));
        
        // Снимаем выделение если было выбрано
        setSelectedMessages(prev => prev.filter(msgId => msgId !== id));
        
      } catch (error) {
        alert('Ошибка удаления: ' + error.response?.data?.error);
      }
    }
  };

const exportSelectedAsRead = async () => {
  if (selectedMessages.length === 0) return;
  
  if (window.confirm(`Экспортировать ${selectedMessages.length} выбранных сообщений?`)) {
    try {
      const selectedMessagesData = messages.filter(msg => selectedMessages.includes(msg.id));
      const selectedUnreadCount = selectedMessagesData.filter(msg => !msg.is_read).length;
      
      // Получаем токен из localStorage
      const token = localStorage.getItem('token');
      
      // 1. Получаем файл напрямую через fetch с авторизацией
      const response = await fetch(`${currentURL}/api/messages/exel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // добавляем токен
        },
        body: JSON.stringify(selectedMessages)
      });
      
      // 2. Проверяем успешность
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Требуется авторизация. Войдите в систему.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сервера');
      }
      
      // 3. Скачиваем файл
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `messages_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // 4. Обновляем данные
      await fetchMessages(activeTab);
      setStats(prev => ({
        ...prev,
        [activeTab]: {
          total: prev[activeTab].total - selectedMessages.length,
          unread: Math.max(0, prev[activeTab].unread - selectedUnreadCount)
        }
      }));
      
      // 5. Очищаем выбранные
      setSelectedMessages([]);
      
    } catch (error) {
      alert('Ошибка экспорта: ' + error.message);
    }
  }
};

  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) return;
    
    if (window.confirm(`Удалить ${selectedMessages.length} выбранных сообщений?`)) {
      try {
        // Считаем сколько непрочитанных среди выбранных
        const selectedMessagesData = messages.filter(msg => selectedMessages.includes(msg.id));
        const selectedUnreadCount = selectedMessagesData.filter(msg => !msg.is_read).length;
        
        // Удаляем все выбранные сообщения
        const deletePromises = selectedMessages.map(id => messageAPI.delete(id));
        await Promise.all(deletePromises);
        
        // Обновляем сообщения
        await fetchMessages(activeTab);
        
        // Обновляем статистику
        setStats(prev => ({
          ...prev,
          [activeTab]: {
            total: prev[activeTab].total - selectedMessages.length,
            unread: Math.max(0, prev[activeTab].unread - selectedUnreadCount)
          }
        }));
        
        // Очищаем выбранные
        setSelectedMessages([]);
        
      } catch (error) {
        alert('Ошибка удаления: ' + error.response?.data?.error);
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMessages(messages.map(msg => msg.id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleSelectMessage = (id) => {
    setSelectedMessages(prev => 
      prev.includes(id) 
        ? prev.filter(msgId => msgId !== id)
        : [...prev, id]
    );
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedMessages.length === 0) return;
    
    try {
      const updatePromises = selectedMessages.map(id => 
        messageAPI.updateReadStatus(id, true)
      );
      await Promise.all(updatePromises);
      
      // Обновляем локальное состояние
      const updatedMessages = messages.map(msg => 
        selectedMessages.includes(msg.id) 
          ? { ...msg, is_read: true, read_at: new Date() }
          : msg
      );
      setMessages(updatedMessages);
      
      // Обновляем статистику
      const selectedUnreadCount = messages
        .filter(msg => selectedMessages.includes(msg.id) && !msg.is_read)
        .length;
      
      setStats(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          unread: Math.max(0, prev[activeTab].unread - selectedUnreadCount)
        }
      }));
      
      // Очищаем выбранные
      setSelectedMessages([]);
      
    } catch (error) {
      alert('Ошибка обновления: ' + error.response?.data?.error);
    }
  };

  const openModal = (message) => {
    setSelectedMessage(message);
  };

  const closeModal = () => {
    setSelectedMessage(null);
  };

  const formatPhone = (phone) => {
    // Простая функция форматирования телефона
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9, 11)}`;
    }
    return phone;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Стили
  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      marginBottom: '30px',
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
    },
    tab: {
      flex: 1,
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
      justifyContent: 'space-between',
      alignItems: 'center',
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
    unreadBadge: {
      backgroundColor: '#e74c3c',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold',
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
    bulkActions: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      alignItems: 'center',
    },
    bulkButton: {
      padding: '10px 20px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      padding: '15px',
      textAlign: 'left',
      fontWeight: 'bold',
      color: '#2c3e50',
      borderBottom: '2px solid #e0e0e0',
    },
    tableCell: {
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
    },
    tableRow: {
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#f8f9fa',
      },
    },
    unreadRow: {
      backgroundColor: '#e3f2fd',
      fontWeight: 'bold',
    },
    actionButton: {
      padding: '8px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      marginRight: '5px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    viewButtonStyle: {
      backgroundColor: '#3498db',
      color: 'white',
    },
    deleteButtonStyle: {
      backgroundColor: '#e74c3c',
      color: 'white',
    },
    readButtonStyle: {
      backgroundColor: '#2ecc71',
      color: 'white',
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
      maxWidth: '600px',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      maxHeight: '90%',
      overflowY: 'auto',
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
      padding: '25px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #eee',
    },
    modalStatus: {
      display: 'inline-block',
      padding: '5px 15px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold',
      marginTop: '10px',
    },
    modalBody: {
      padding: '25px',
    },
    modalSection: {
      marginBottom: '25px',
    },
    modalLabel: {
      fontSize: '14px',
      color: '#7f8c8d',
      marginBottom: '5px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    modalValue: {
      fontSize: '18px',
      color: '#2c3e50',
      fontWeight: '500',
    },
    modalComment: {
      fontSize: '16px',
      color: '#2c3e50',
      lineHeight: '1.6',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      borderLeft: '4px solid #3498db',
    },
    modalFooter: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #eee',
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
    },
    checkbox: {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
    },
  };

  if (loading && messages.length === 0) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Загрузка сообщений...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Сообщения от пользователей</h2>
      </div>

      {/* Вкладки центров */}
      <div style={styles.tabs}>
        {Object.keys(CENTERS).map(key => {
          const center = CENTERS[key];
          const isActive = activeTab === center;
          const centerStats = stats[center] || { total: 0, unread: 0 };
          
          return (
            <button
              key={center}
              onClick={() => handleTabChange(center)}
              style={{
                ...styles.tab,
                ...(isActive && styles.activeTab)
              }}
            >
              <div style={styles.tabContent}>
                <span style={styles.tabTitle}>{center}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {centerStats.unread > 0 && (
                    <span style={styles.unreadBadge}>{centerStats.unread}</span>
                  )}
                  <span style={styles.tabCount}>
                    {centerStats.total}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Информация о выбранном центре */}
      <div style={styles.centerInfo}>
        <h3>{activeTab}</h3>
        <p style={styles.centerDescription}>
          {activeTab === CENTERS.HAPPY_MALL && 'Сообщения от посетителей ТРЦ Happy Молл'}
          {activeTab === CENTERS.VICTORY_PLAZA && 'Сообщения от посетителей ТЦ Победа плаза'}
        </p>
        <div style={{ marginTop: '10px', color: '#3498db' }}>
          Всего сообщений: {stats[activeTab]?.total || 0} | 
          Непрочитанных: {stats[activeTab]?.unread || 0}
        </div>
      </div>

      {/* Групповые действия */}
      {selectedMessages.length > 0 && (
        <div style={styles.bulkActions}>
          <input 
            type="checkbox" 
            checked={selectedMessages.length === messages.length}
            onChange={handleSelectAll}
            style={styles.checkbox}
          />
          <span>Выбрано: {selectedMessages.length}</span>

          <button
            onClick={exportSelectedAsRead}
            style={styles.bulkButton}
          >
            Эксортировать
          </button>
          <button
            onClick={handleMarkSelectedAsRead}
            style={styles.bulkButton}
          >
            Отметить как прочитанные
          </button>
          <button
            onClick={handleDeleteSelected}
            style={{ ...styles.bulkButton, ...styles.deleteButton }}
          >
            Удалить выбранные
          </button>

        </div>
      )}

      {/* Таблица сообщений */}
      {messages.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>В этом центре пока нет сообщений</h3>
          <p>Когда посетители оставят сообщение, они появятся здесь</p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>
                <input 
                  type="checkbox" 
                  checked={selectedMessages.length === messages.length && messages.length > 0}
                  onChange={handleSelectAll}
                  style={styles.checkbox}
                />
              </th>
              <th style={styles.tableHeader}>Дата</th>
              <th style={styles.tableHeader}>Имя</th>
              <th style={styles.tableHeader}>Телефон</th>
              <th style={styles.tableHeader}>Статус</th>
              <th style={styles.tableHeader}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr 
                key={message.id} 
                style={{
                  ...styles.tableRow,
                  ...(!message.is_read && styles.unreadRow)
                }}
              >
                <td style={styles.tableCell}>
                  <input 
                    type="checkbox" 
                    checked={selectedMessages.includes(message.id)}
                    onChange={() => handleSelectMessage(message.id)}
                    style={styles.checkbox}
                  />
                </td>
                <td style={styles.tableCell}>
                  {formatDate(message.created_at)}
                </td>
                <td style={styles.tableCell}>
                  {message.full_name}
                </td>
                <td style={styles.tableCell}>
                  {formatPhone(message.phone)}
                </td>
                <td style={styles.tableCell}>
                  {message.is_read ? (
                    <span style={{ color: '#27ae60' }}>✓ Прочитано</span>
                  ) : (
                    <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>● Новое</span>
                  )}
                </td>
                <td style={styles.tableCell}>
                  <button
                    onClick={() => openModal(message)}
                    style={{ ...styles.actionButton, ...styles.viewButtonStyle }}
                  >
                    👁️ Просмотреть
                  </button>
                  <button
                    onClick={() => handleDelete(message.id)}
                    style={{ ...styles.actionButton, ...styles.deleteButtonStyle }}
                  >
                    🗑️ Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Модальное окно просмотра сообщения */}
      {selectedMessage && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={closeModal}>
              ×
            </button>
            <div style={styles.modalHeader}>
              <h3>Сообщение от {selectedMessage.full_name}</h3>
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Дата и время</div>
                <div style={styles.modalValue}>{formatDate(selectedMessage.created_at)}</div>
              </div>
              <span style={{
                ...styles.modalStatus,
                backgroundColor: selectedMessage.is_read ? '#27ae60' : '#e74c3c',
                color: 'white'
              }}>
                {selectedMessage.is_read ? 'Прочитано' : 'Новое'}
              </span>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Имя</div>
                <div style={styles.modalValue}>{selectedMessage.full_name}</div>
              </div>
              
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Телефон</div>
                <div style={styles.modalValue}>{formatPhone(selectedMessage.phone)}</div>
              </div>
              
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Торговый центр</div>
                <div style={styles.modalValue}>{selectedMessage.center}</div>
              </div>
              
              <div style={styles.modalSection}>
                <div style={styles.modalLabel}>Комментарий</div>
                <div style={styles.modalComment}>
                  {selectedMessage.comment || 'Нет комментария'}
                </div>
              </div>
              
              {selectedMessage.read_at && (
                <div style={styles.modalSection}>
                  <div style={styles.modalLabel}>Прочитано</div>
                  <div style={styles.modalValue}>{formatDate(selectedMessage.read_at)}</div>
                </div>
              )}
            </div>
            
            <div style={styles.modalFooter}>
              <button
                onClick={() => {
                  handleMarkAsRead(selectedMessage.id);
                  closeModal();
                }}
                style={{ ...styles.bulkButton, ...styles.readButtonStyle }}
                disabled={selectedMessage.is_read}
              >
                {selectedMessage.is_read ? 'Уже прочитано' : '✓ Отметить как прочитанное'}
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedMessage.id);
                  closeModal();
                }}
                style={{ ...styles.bulkButton, ...styles.deleteButton }}
              >
                🗑️ Удалить сообщение
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesList;