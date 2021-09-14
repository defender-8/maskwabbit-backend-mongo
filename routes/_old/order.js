const express = require('express');
const bodyParser = require('body-parser');
const { body } = require('express-validator');

const { isAuth, isAdmin } = require('../../middleware/auth');

const controller = require('../../controllers/order');

const router = express.Router();

// GET
router.get('/admin/orders', isAuth, isAdmin, controller.getOrders);
router.get('/admin/orders/:id', isAuth, isAdmin, controller.getOrder);
router.get('/orders/:id', isAuth, controller.getUserOrders);

// POST
router.post('/checkout', isAuth,/* [
    body('firstName', 'firstName is required').not().isEmpty().trim(),
    body('lastName', 'lastName is required').not().isEmpty().trim(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
  ],*/
  controller.postCheckout);

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), controller.postOrder);

// PUT
router.put('/admin/orders/:id', isAuth, isAdmin, [
    body('status', 'Status is required').not().isEmpty(),
  ],
  controller.putOrder);

// DELETE
router.delete('/admin/orders/:id', isAuth, isAdmin, controller.deleteOrder);


module.exports = router;

