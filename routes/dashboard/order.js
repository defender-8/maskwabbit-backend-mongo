const express = require('express');
const { body } = require('express-validator');

const { isAuth, isAdmin } = require('../../middleware/auth');

const controller = require('../../controllers/order');

const router = express.Router();

router.get('', isAuth, isAdmin, controller.get);
router.get('/:id', isAuth, isAdmin, controller.getById);

router.put('/:id', isAuth, isAdmin, [
    body('status', 'Status is required').not().isEmpty(),
  ],
  controller.put);

router.delete('/:id', isAuth, isAdmin, controller.delete);


module.exports = router;

