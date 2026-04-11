const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');

router.get('/', verifyToken, getClients);
router.get('/:id', verifyToken, getClient);
router.post('/', verifyToken, createClient);
router.put('/:id', verifyToken, updateClient);
router.delete('/:id', verifyToken, deleteClient);

module.exports = router;