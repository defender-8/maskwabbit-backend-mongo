const express = require('express');
const { body } = require('express-validator');

const { isAuth, isSuperAdmin, isAdmin } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');

const controller = require('../controllers/product');

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

// GET
router.get(
  '/admin/products',
  isAuth, isAdmin,
  controller.getProducts,
);

router.get(
  '/products',
  controller.getProducts,
);

router.get('/admin/products/:id',
  isAuth, isAdmin,
  controller.getProduct,
);

// POST
router.post(
  '/admin/products/new',
  isAuth, isAdmin, imageUpload('product').single('image'), validBody,
  controller.postProduct,
);

// PUT
router.put(
  '/admin/products/:id',
  isAuth, isAdmin, imageUpload('product').single('image'), validBody,
  controller.putProduct,
);

// DELETE
router.delete(
  '/admin/products/:id',
  isAuth, isAdmin,
  controller.deleteProduct,
);

module.exports = router;

