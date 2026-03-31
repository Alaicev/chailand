import React from 'react';
import { NavLink } from 'react-router-dom';
import { pagesName } from '../../pagesName';

const Sidebar = () => {
  const navItems = [
    { to: '/', label: 'Дашборд', icon: '📊' },
    { to: '/prizes', label: pagesName.prise, icon: '🏆' },
    { to: '/packets', label: pagesName.pacets, icon: '📦' },
    { to: '/images', label: pagesName.imagesCarusel, icon: '🖼️' },
    { to: '/gallery', label: pagesName.galerey, icon: '🖼️' },
    { to: '/users', label: pagesName.users, icon: '👥' }, // Добавляем
    { to: '/message', label: pagesName.message, icon: '👥' }, // Добавляем


  ];

  return (
    <nav style={styles.sidebar}>
      <ul style={styles.navList}>
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeLink : {}),
              })}
            >
              <span style={styles.icon}>{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: '#34495e',
    color: 'white',
    padding: '20px 0',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 20px',
    color: '#ecf0f1',
    textDecoration: 'none',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  activeLink: {
    backgroundColor: '#3498db',
    fontWeight: 'bold',
  },
  icon: {
    marginRight: '10px',
    fontSize: '18px',
  },
};

export default Sidebar;