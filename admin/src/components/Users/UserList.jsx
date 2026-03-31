import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    setLoading(true);
    try {
      // Можно добавить поиск на бэкенде, а пока фильтруем на фронте
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUsers(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (!window.confirm('Сделать этого пользователя администратором?')) return;

    try {
      await userAPI.activateUser(userId);
      fetchUsers(); // Обновляем список
    } catch (error) {
      alert('Ошибка: ' + error.response?.data?.error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Удалить этого пользователя?')) return;

    try {
      await userAPI.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      alert('Ошибка удаления: ' + error.response?.data?.error);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span style={styles.adminBadge}>👑 Админ</span>;
    }
    return <span style={styles.userBadge}>👤 Пользователь</span>;
  };

  if (loading && users.length === 0) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Загрузка пользователей...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Управление пользователями</h2>
        <Link to="/users/new" style={styles.addButton}>
          + Добавить пользователя
        </Link>
      </div>

      <div style={styles.searchBox}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по имени или email..."
          style={styles.searchInput}
        />
        <button onClick={handleSearch} style={styles.searchButton}>
          🔍 Найти
        </button>
        <button onClick={fetchUsers} style={styles.clearButton}>
          Очистить
        </button>
      </div>

      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Всего пользователей:</span>
          <span style={styles.statValue}>{users.length}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Администраторов:</span>
          <span style={styles.statValue}>
            {users.filter(u => u.role === 'admin').length}
          </span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Обычных пользователей:</span>
          <span style={styles.statValue}>
            {users.filter(u => u.role === 'user').length}
          </span>
        </div>
      </div>

      {users.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>👥</div>
          <h3>Пользователей не найдено</h3>
          <p>Добавьте первого пользователя</p>
          <Link to="/users/new" style={styles.emptyButton}>
            + Добавить пользователя
          </Link>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Имя</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Роль</th>
                <th style={styles.th}>Дата регистрации</th>
                <th style={styles.th}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{user.id}</td>
                  <td style={styles.td}>
                    <div style={styles.userInfo}>
                      <div style={styles.userName}>{user.name}</div>
                      {currentUser?.id === user.id && (
                        <span style={styles.currentUserBadge}>Вы</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    {getRoleBadge(user.role)}
                  </td>
                  <td style={styles.td}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <Link to={`/users/edit/${user.id}`} style={styles.editButton}>
                        ✏️ Редактировать
                      </Link>
                      {user.role !== 'admin' && currentUser?.role === 'admin' && (
                        <button
                          onClick={() => handleMakeAdmin(user.id)}
                          style={styles.makeAdminButton}
                        >
                          👑 Сделать админом
                        </button>
                      )}
                      {currentUser?.id !== user.id && currentUser?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={styles.deleteButton}
                        >
                          🗑️ Удалить
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  addButton: {
    backgroundColor: '#2ecc71',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  searchBox: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
  },
  searchInput: {
    flex: 1,
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
  },
  searchButton: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  clearButton: {
    padding: '12px 24px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  stats: {
    display: 'flex',
    gap: '30px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '5px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#3498db',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #eee',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tr: {
    borderBottom: '1px solid #eee',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  td: {
    padding: '16px',
    verticalAlign: 'middle',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userName: {
    fontWeight: '500',
    fontSize: '16px',
  },
  currentUserBadge: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  adminBadge: {
    backgroundColor: '#f39c12',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  userBadge: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#f39c12',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center',
  },
  makeAdminButton: {
    padding: '8px 16px',
    backgroundColor: '#9b59b6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
};

export default UserList;