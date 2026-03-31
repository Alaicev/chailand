import React, { useState, useEffect } from 'react';
import { prizeAPI, packetAPI, imageAPI, galleryAPI, messageAPI} from '../../services/api';
import { pagesName } from '../../pagesName';

const Dashboard = () => {
  const [stats, setStats] = useState({
    prizes: 0,
    packets: 0,
    images: 0,
    galerey: 0,
    message : 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [prizesRes, packetsRes, imagesRes, galleryRes, messageRes] = await Promise.all([
        prizeAPI.getAll(),
        packetAPI.getAll(),
        imageAPI.getAll(),
        galleryAPI.getAll(),
        messageAPI.getAll()
      ]);
      setStats({
        prizes: prizesRes.data.count || 0,
        packets: packetsRes.data.count || 0,
        images: imagesRes.data.images?.length || 0,
        galerey: galleryRes.data.count || galleryRes.data.images?.length || 0,
        message: messageRes.data.meta.notRead || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка статистики...</div>;
  }

  return (
    <div>
      <h2>Дашборд</h2>
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3>🏆 {pagesName.prise}</h3>
          <p style={styles.statNumber}>{stats.prizes}</p>
        </div>
        
        <div style={styles.statCard}>
          <h3>📦{pagesName.pacets}</h3>
          <p style={styles.statNumber}>{stats.packets}</p>
        </div>
        
        <div style={styles.statCard}>
          <h3>🖼️{pagesName.imagesCarusel}</h3>
          <p style={styles.statNumber}>{stats.images}</p>
        </div>
        <div style={styles.statCard}>
          <h3>🖼️{pagesName.galerey}</h3>
          <p style={styles.statNumber}>{stats.galerey}</p>
        </div>
        <div style={styles.statCard}>
          <h3>🖼️{pagesName.message}</h3>
          <p style={styles.statNumber}>{stats.message}</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#3498db',
    margin: '10px 0',
  },
};

export default Dashboard;