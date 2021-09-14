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

router.get(  '/', isAuth, isAdmin,  controller.get);
router.get('/:id', isAuth, isAdmin, controller.getById);

router.post(
  '/new',
  isAuth, isAdmin, imageUpload('category').single('image'), validBody,
  controller.post,
);

router.put(
  '/:id',
  isAuth, isAdmin, imageUpload('category').single('image'), validBody,
  controller.put,
);

router.delete('/:id', isAuth, isAdmin, controller.delete);

module.exports = router;

