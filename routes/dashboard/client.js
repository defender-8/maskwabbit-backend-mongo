const express = require('express');

const { isAuth, isAdmin } = require('../../middleware/auth');

const controller = require('../../controllers/client');

const router = express.Router();

router.get('/', isAuth, isAdmin, controller.get);
router.get('/:id', isAuth, isAdmin, controller.getById);

router.delete('/:id', isAuth, isAdmin, controller.delete);

module.exports = router;

