const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.getWarehouses);
router.post('/', controller.createWarehouse);
router.get('/:id', controller.getWarehouseById);
router.get('/:id/locations', controller.getWarehouseLocations);

module.exports = router;
