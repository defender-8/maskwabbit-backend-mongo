const express = require('express');
const bodyParser = require('body-parser');
const { body } = require('express-validator');

const { isAuth } = require('../../middleware/auth');

const controller = require('../../controllers/order');

const router = express.Router();

router.get('/orders/:id', isAuth, controller.getUserOrders);

router.post('/checkout', isAuth,/* [
    body('firstName', 'firstName is required').not().isEmpty().trim(),
    body('lastName', 'lastName is required').not().isEmpty().trim(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
  ],*/
  controller.postCheckout);

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), controller.post);

module.exports = router;

