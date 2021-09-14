const express = require('express');
const { body } = require('express-validator');

const { isAuth, isAdmin } = require('../../middleware/auth');
const { imageUpload } = require('../../middleware/upload');

const controller = require('../../controllers/category');

const router = express.Router();

const validBody = [
  body('title', 'Title is required').not().isEmpty().trim(),
  body('description', 'Description is required').not().isEmpty().trim(),
];

// GET
router.get(
  '/admin/categories',
  isAuth, isAdmin,
  controller.getCategories,
);

router.get(
  '/categories',
  controller.getCategories,
);

router.get(
  '/admin/categories/:id',
  isAuth, isAdmin,
  controller.getCategory,
);

router.get(
  '/categories/:id',
  controller.getCategory,
);

// POST
router.post(
  '/admin/categories/new',
  isAuth, isAdmin, imageUpload('category').single('image'), validBody,
  controller.postCategory,
);

// PUT
router.put(
  '/admin/categories/:id',
  isAuth, isAdmin, imageUpload('category').single('image'), validBody,
  controller.putCategory,
);

// DELETE
router.delete(
  '/admin/categories/:id',
  isAuth, isAdmin,
  controller.deleteCategory,
);

module.exports = router;

