import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <h1>Админ панель</h1>
      </div>
      
      <div style={styles.userInfo}>
        <span style={styles.userName}>
          👤 {user?.name} ({user?.email})
        </span>
        <button onClick={onLogout} style={styles.logoutButton}>
          Выйти
        </button>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    backgroundColor: '#2c3e50',
    color: 'white',
    height: '60px',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: '14px',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Header;