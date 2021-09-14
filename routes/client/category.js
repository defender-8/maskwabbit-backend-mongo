const express = require('express');

const controller = require('../../controllers/category');

const router = express.Router();

router.get('/categories', controller.get);

router.get('/categories/:id', controller.getById);

module.exports = router;

