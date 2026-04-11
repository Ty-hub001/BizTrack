const db = require('../db');

// GET all tasks for a project
const getTasks = (req, res) => {
  const query = `
    SELECT tasks.* FROM tasks
    INNER JOIN projects ON tasks.project_id = projects.id
    WHERE tasks.project_id = ? AND projects.user_id = ?
  `;
  db.query(query, [req.params.projectId, req.userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json(results);
  });
};

// CREATE task
const createTask = (req, res) => {
  const { title, status, assigned_to } = req.body;
  const query = `
    INSERT INTO tasks (project_id, title, status, assigned_to) 
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [req.params.projectId, title, status, assigned_to], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(201).json({ message: 'Task created', id: result.insertId });
  });
};

// UPDATE task
const updateTask = (req, res) => {
  const { title, status, assigned_to } = req.body;
  const query = `
    UPDATE tasks SET title=?, status=?, assigned_to=?
    WHERE id=? AND project_id=?
  `;
  db.query(query, [title, status, assigned_to, req.params.id, req.params.projectId], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ message: 'Task updated' });
  });
};

// DELETE task
const deleteTask = (req, res) => {
  const query = 'DELETE FROM tasks WHERE id = ? AND project_id = ?';
  db.query(query, [req.params.id, req.params.projectId], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json({ message: 'Task deleted' });
  });
};

module.exports = { getTasks, createTask, updateTask, deleteTask };