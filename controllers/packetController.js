const pool = require('../config/database.js');

class PacketController {
  async getAllPackets(req, res) {
    try {
      const result = await pool.query('SELECT * FROM pacets ORDER BY id DESC');
      
      const packets = result.rows.map(packet => {
        // Обработка texts (пункты)
        const points = packet.texts 
          ? packet.texts.split('|').map(item => item.trim()).filter(item => item !== '')
          : [];
        
        // Обработка prise (цены)
        const prices = packet.prise 
          ? packet.prise.split('|').map(item => item.trim()).filter(item => item !== '')
          : [];

        // Обработка extra (дополнительно)
        const extras = packet.extra 
          ? packet.extra.split('|').map(item => item.trim()).filter(item => item !== '')
          : [];
        
        return {
          ...packet,
          points: points.map((text, index) => ({
            id: `${packet.id}-points-${index}`,
            text: text,
            order: index + 1
          })),
          prices: prices.map((price, index) => ({
            id: `${packet.id}-prices-${index}`,
            value: price,
            order: index + 1
          })),
          extras: extras.map((extra, index) => ({
            id: `${packet.id}-extras-${index}`,
            text: extra,
            order: index + 1
          }))
        };
      });
      
      res.json({ success: true, count: packets.length, packets });
    } catch (error) {
      console.error('Get packets error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPacketById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM pacets WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Packet not found' });
      }
      
      const packet = result.rows[0];
      
      const points = packet.texts 
        ? packet.texts.split('|').map(item => item.trim()).filter(item => item !== '')
        : [];
      const prices = packet.prise 
        ? packet.prise.split('|').map(item => item.trim()).filter(item => item !== '')
        : [];
      const extras = packet.extra 
        ? packet.extra.split('|').map(item => item.trim()).filter(item => item !== '')
        : [];
      
      res.json({
        success: true,
        packet: {
          ...packet,
          points: points.map((text, index) => ({
            id: `${packet.id}-points-${index}`,
            text: text,
            order: index + 1
          })),
          prices: prices.map((price, index) => ({
            id: `${packet.id}-prices-${index}`,
            value: price,
            order: index + 1
          })),
          extras: extras.map((extra, index) => ({
            id: `${packet.id}-extras-${index}`,
            text: extra,
            order: index + 1
          }))
        }
      });
    } catch (error) {
      console.error('Get packet error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createPacket(req, res) {
    try {
      const { name, points, prices, extras } = req.body;
      
      if (!name) {
        return res.status(400).json({ success: false, error: 'Name is required' });
      }
      
      const texts = Array.isArray(points) 
        ? points.map(item => item.toString().trim()).filter(item => item !== '').join('|')
        : '';
      const prise = Array.isArray(prices) 
        ? prices.map(item => item.toString().trim()).filter(item => item !== '').join('|')
        : '';
      const extra = Array.isArray(extras) 
        ? extras.map(item => item.toString().trim()).filter(item => item !== '').join('|')
        : '';
      
      const result = await pool.query(
        `INSERT INTO pacets (name, texts, prise, extra) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, texts, prise, extra`,
        [name, texts, prise, extra]
      );
      
      const createdPacket = result.rows[0];
      
      const createdPoints = texts ? texts.split('|').map(item => item.trim()).filter(item => item !== '') : [];
      const createdPrices = prise ? prise.split('|').map(item => item.trim()).filter(item => item !== '') : [];
      const createdExtras = extra ? extra.split('|').map(item => item.trim()).filter(item => item !== '') : [];
      
      res.status(201).json({
        success: true,
        message: 'Packet created successfully',
        packet: {
          ...createdPacket,
          points: createdPoints.map((text, index) => ({
            id: `${createdPacket.id}-points-${index}`,
            text: text,
            order: index + 1
          })),
          prices: createdPrices.map((price, index) => ({
            id: `${createdPacket.id}-prices-${index}`,
            value: price,
            order: index + 1
          })),
          extras: createdExtras.map((extra, index) => ({
            id: `${createdPacket.id}-extras-${index}`,
            text: extra,
            order: index + 1
          }))
        }
      });
    } catch (error) {
      console.error('Create packet error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updatePacket(req, res) {
    try {
      const { id } = req.params;
      const { name, points, prices, extras } = req.body;
      
      const existing = await pool.query('SELECT * FROM pacets WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Packet not found' });
      }
      
      const updateData = {
        name: name !== undefined ? name : existing.rows[0].name,
        texts: Array.isArray(points) 
          ? points.map(item => item.toString().trim()).filter(item => item !== '').join('|')
          : (points === null ? '' : existing.rows[0].texts),
        prise: Array.isArray(prices) 
          ? prices.map(item => item.toString().trim()).filter(item => item !== '').join('|')
          : (prices === null ? '' : existing.rows[0].prise),
        extra: Array.isArray(extras) 
          ? extras.map(item => item.toString().trim()).filter(item => item !== '').join('|')
          : (extras === null ? '' : existing.rows[0].extra)
      };
      
      const result = await pool.query(
        `UPDATE pacets 
         SET name = $1, texts = $2, prise = $3, extra = $4
         WHERE id = $5 
         RETURNING *`,
        [updateData.name, updateData.texts, updateData.prise, updateData.extra, id]
      );
      
      const updatedPacket = result.rows[0];
      
      const updatedPoints = updateData.texts 
        ? updateData.texts.split('|').map(item => item.trim()).filter(item => item !== '')
        : [];
      const updatedPrices = updateData.prise 
        ? updateData.prise.split('|').map(item => item.trim()).filter(item => item !== '')
        : [];
      const updatedExtras = updateData.extra 
        ? updateData.extra.split('|').map(item => item.trim()).filter(item => item !== '')
        : [];
      
      res.json({
        success: true,
        message: 'Packet updated successfully',
        packet: {
          ...updatedPacket,
          points: updatedPoints.map((text, index) => ({
            id: `${updatedPacket.id}-points-${index}`,
            text: text,
            order: index + 1
          })),
          prices: updatedPrices.map((price, index) => ({
            id: `${updatedPacket.id}-prices-${index}`,
            value: price,
            order: index + 1
          })),
          extras: updatedExtras.map((extra, index) => ({
            id: `${updatedPacket.id}-extras-${index}`,
            text: extra,
            order: index + 1
          }))
        }
      });
    } catch (error) {
      console.error('Update packet error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deletePacket(req, res) {
    try {
      const { id } = req.params;
      const existing = await pool.query('SELECT * FROM pacets WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Packet not found' });
      }
      await pool.query('DELETE FROM pacets WHERE id = $1', [id]);
      res.json({ success: true, message: 'Packet deleted successfully', deletedPacket: existing.rows[0] });
    } catch (error) {
      console.error('Delete packet error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new PacketController();