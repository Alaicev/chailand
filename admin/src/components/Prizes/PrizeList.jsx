import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { prizeAPI } from '../../services/api';
import { pagesName } from '../../pagesName';

const PrizeList = () => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    try {
      const response = await prizeAPI.getAll();
      setPrizes(response.data.prizes || []);
    } catch (error) {
      console.error('Error fetching prizes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPrizes();
      return;
    }

    try {
      const response = await prizeAPI.search(searchQuery);
      setPrizes(response.data.prizes || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить этот пункт?')) {
      try {
        await prizeAPI.delete(id);
        setPrizes(prizes.filter(prize => prize.id !== id));
      } catch (error) {
        alert('Ошибка удаления: ' + error.response?.data?.error);
      }
    }
  };

  if (loading) {
    return <div>Загрузка цен...</div>;
  }

  return (
    <div>
      <div style={styles.header}>
        <h2>{pagesName.prise}</h2>
        <Link to="/prizes/new" style={styles.addButton}>
          + Добавить пункт
        </Link>
      </div>

      <div style={styles.searchBox}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск..."
          style={styles.searchInput}
        />
        <button onClick={handleSearch} style={styles.searchButton}>
          🔍
        </button>
        <button onClick={fetchPrizes} style={styles.clearButton}>
          Очистить
        </button>
      </div>

      {prizes.length === 0 ? (
        <div style={styles.empty}>
          Пунктов не найдено
        </div>
      ) : (
        <div style={styles.grid}>
          {prizes.map((prize) => (
            <div key={prize.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{prize.name}</h3>
                <div style={styles.actions}>
                  <Link to={`/prizes/edit/${prize.id}`} style={styles.editButton}>
                    ✏️
                  </Link>
                  <button 
                    onClick={() => handleDelete(prize.id)} 
                    style={styles.deleteButton}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div style={styles.cardContent}>
                <p><strong>Email:</strong> {prize.email}</p>
                
                {prize.points && prize.points.length > 0 && (
                  <div style={styles.points}>
                    <strong>Пункты:</strong>
                    <ul>
                      {prize.points.map((point, index) => (
                        <li key={index}>• {point.text}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div style={styles.meta}>
                  <small>ID: {prize.id}</small>
                  <small>{new Date(prize.created_at).toLocaleDateString()}</small>
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
  searchBox: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
  },
  searchInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  searchButton: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  clearButton: {
    padding: '10px 20px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
  points: {
    marginTop: '10px',
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

export default PrizeList;