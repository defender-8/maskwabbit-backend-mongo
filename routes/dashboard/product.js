const express = require('express');
const { body } = require('express-validator');

const { isAuth, isAdmin } = require('../../middleware/auth');
const { imageUpload } = require('../../middleware/upload');

const controller = require('../../controllers/product');

const router = express.Router();

const validBody = [
  body('title', 'Title is required').not().isEmpty().trim(),
  body('description').trim(),
  body('categories', 'Category is required').not().isEmpty(),
  body('price').not().isEmpty().withMessage('Price is required').isFloat().withMessage(
    'Price must be a number'),
  body('amount').not().isEmpty().withMessage('Amount is required').isInt().withMessage(
    'Amount must be a number'),
];

router.get('/', isAuth, isAdmin, controller.get);
router.get('/:id', isAuth, isAdmin, controller.getById);

router.post(
  '/new',
  isAuth, isAdmin, imageUpload('product').single('image'), validBody,
  controller.post,
);

router.put(
  '/:id',
  isAuth, isAdmin, imageUpload('product').single('image'), validBody,
  controller.put,
);

router.delete('/:id', isAuth, isAdmin, controller.delete);

module.exports = router;

