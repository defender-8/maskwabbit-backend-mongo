const express = require('express');
const { body } = require('express-validator');

const { isAuth, isSuperAdmin, isAdmin } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');

const controller = require('../controllers/product-category');

const router = express.Router();

const validBody = [
  body('title', 'Title is required').not().isEmpty().trim(),
  body('description', 'Description is required').not().isEmpty().trim(),
];

// GET
router.get(
  '/admin/product-categories',
  isAuth, isAdmin,
  controller.getProdCats,
);

router.get(
  '/product-categories',
  controller.getProdCats,
);

router.get(
  '/admin/product-categories/:id',
  isAuth, isAdmin,
  controller.getProdCat,
);

router.get(
  '/product-categories/:id',
  controller.getProdCat,
);

// POST
router.post(
  '/admin/product-categories/new',
  isAuth, isAdmin, imageUpload('prod-cat').single('image'), validBody,
  controller.postProdCat,
);

// PUT
router.put(
  '/admin/product-categories/:id',
  isAuth, isAdmin, imageUpload('prod-cat').single('image'), validBody,
  controller.putProdCat,
);

// DELETE
router.delete(
  '/admin/product-categories/:id',
  isAuth, isAdmin,
  controller.deleteProdCat,
);

module.exports = router;

