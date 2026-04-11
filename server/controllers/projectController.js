const db = require('../db');

// GET all projects for logged in user
const getProjects = (req, res) => {
  const query = `
    SELECT projects.*, clients.name AS client_name 
    FROM projects 
    LEFT JOIN clients ON projects.client_id = clients.id
    WHERE projects.user_id = ? 
    ORDER BY projects.created_at DESC
  `;
  db.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json(results);
  });
};

// GET single project
const getProject = (req, res) => {
  const query = 'SELECT * FROM projects WHERE id = ? AND user_id = ?';
  db.query(query, [req.params.id, req.userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json(results[0]);
  });
};

// CREATE project
const createProject = (req, res) => {
  const { client_id, title, description, status, start_date, due_date } = req.body;
  const query = `
    INSERT INTO projects (user_id, client_id, title, description, status, start_date, due_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [req.userId, client_id, title, description, status, start_date, due_date], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(201).json({ message: 'Project created', id: result.insertId });
  });
};

// UPDATE project
const updateProject = (req, res) => {
  const { client_id, title, description, status, start_date, due_date } = req.body;
  const query = `
    UPDATE projects 
    SET client_id=?, title=?, description=?, status=?, start_date=?, due_date=? 
    WHERE id=? AND user_id=?
  `;
  db.query(query, [client_id, title, description, status, start_date, due_date, req.params.id, req.userId], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ message: 'Project updated' });
  });
};

// DELETE project
const deleteProject = (req, res) => {
  const query = 'DELETE FROM projects WHERE id = ? AND user_id = ?';
  db.query(query, [req.params.id, req.userId], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ message: 'Project deleted' });
  });
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };