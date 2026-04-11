const db = require('../db');

// GET all clients for logged in user
const getClients = (req, res) => {
  const query = 'SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC';
  db.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json(results);
  });
};

// GET single client
const getClient = (req, res) => {
  const query = 'SELECT * FROM clients WHERE id = ? AND user_id = ?';
  db.query(query, [req.params.id, req.userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Client not found' });
    res.status(200).json(results[0]);
  });
};

// CREATE client
const createClient = (req, res) => {
  const { name, email, phone, company } = req.body;
  const query = 'INSERT INTO clients (user_id, name, email, phone, company) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [req.userId, name, email, phone, company], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(201).json({ message: 'Client created', id: result.insertId });
  });
};

// UPDATE client
const updateClient = (req, res) => {
  const { name, email, phone, company } = req.body;
  const query = 'UPDATE clients SET name=?, email=?, phone=?, company=? WHERE id=? AND user_id=?';
  db.query(query, [name, email, phone, company, req.params.id, req.userId], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ message: 'Client updated' });
  });
};

// DELETE client
const deleteClient = (req, res) => {
  const query = 'DELETE FROM clients WHERE id = ? AND user_id = ?';
  db.query(query, [req.params.id, req.userId], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ message: 'Client deleted' });
  });
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient };