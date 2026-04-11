const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/verifyToken');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.get('/', verifyToken, getTasks);
router.post('/', verifyToken, createTask);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);

module.exports = router;