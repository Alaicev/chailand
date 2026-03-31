import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { packetAPI } from '../../services/api';

const PacketList = () => {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackets();
  }, []);

  const fetchPackets = async () => {
    try {
      const response = await packetAPI.getAll();
      setPackets(response.data.packets || []);
    } catch (error) {
      console.error('Error fetching packets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить этот пакет?')) {
      try {
        await packetAPI.delete(id);
        setPackets(packets.filter(packet => packet.id !== id));
      } catch (error) {
        alert('Ошибка удаления: ' + error.response?.data?.error);
      }
    }
  };

  if (loading) {
    return <div>Загрузка пакетов...</div>;
  }

  return (
    <div>
      <div style={styles.header}>
        <h2>Список пакетов</h2>
        <Link to="/packets/new" style={styles.addButton}>
          + Добавить пакет
        </Link>
      </div>

      {packets.length === 0 ? (
        <div style={styles.empty}>
          Пакетов не найдено
        </div>
      ) : (
        <div style={styles.grid}>
          {packets.map((packet) => (
            <div key={packet.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{packet.name}</h3>
                <div style={styles.actions}>
                  <Link to={`/packets/edit/${packet.id}`} style={styles.editButton}>
                    ✏️
                  </Link>
                  <button 
                    onClick={() => handleDelete(packet.id)} 
                    style={styles.deleteButton}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div style={styles.cardContent}>
                {/* Блок с элементами (points) */}
                {packet.points && packet.points.length > 0 && (
                  <div style={styles.section}>
                    <strong style={styles.sectionTitle}>Включает:</strong>
                    <ul style={styles.list}>
                      {packet.points.map((point) => (
                        <li key={point.id} style={styles.listItem}>
                          • {point.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Блок с ценами (prices) */}
                {packet.prices && packet.prices.length > 0 && (
                  <div style={styles.section}>
                    <strong style={styles.sectionTitle}>Цены:</strong>
                    <ul style={styles.list}>
                      {packet.prices.map((price) => (
                        <li key={price.id} style={styles.listItem}>
                          💰 {price.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div style={styles.meta}>
                  <small>ID: {packet.id}</small>
                  {packet.created_at && (
                    <small>{new Date(packet.created_at).toLocaleDateString()}</small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addButton: {
    backgroundColor: '#2ecc71',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #eee',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#f39c12',
    color: 'white',
    borderRadius: '4px',
    textDecoration: 'none',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cardContent: {
    padding: '15px',
  },
  section: {
    marginTop: '10px',
    '&:first-child': {
      marginTop: 0,
    },
  },
  sectionTitle: {
    display: 'block',
    marginBottom: '5px',
    color: '#34495e',
  },
  list: {
    margin: 0,
    paddingLeft: '20px',
  },
  listItem: {
    marginBottom: '3px',
    fontSize: '14px',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
    fontSize: '12px',
    color: '#7f8c8d',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#7f8c8d',
    fontSize: '18px',
  },
};

export default PacketList;