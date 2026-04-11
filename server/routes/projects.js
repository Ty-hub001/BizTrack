const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController');

router.get('/', verifyToken, getProjects);
router.get('/:id', verifyToken, getProject);
router.post('/', verifyToken, createProject);
router.put('/:id', verifyToken, updateProject);
router.delete('/:id', verifyToken, deleteProject);

module.exports = router;