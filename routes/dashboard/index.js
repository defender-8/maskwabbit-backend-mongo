const express = require('express');

const { isAuth, isAdmin } = require('../../middleware/auth');
const { tempImageUpload } = require('../../middleware/upload');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/admins', require('./admin'));
router.use('/clients', require('./client'));
router.use('/categories', require('./category'));
router.use('/products', require('./product'));
router.use('/orders', require('./order'));

// temp upload
router.post(
  '/upload',
  isAuth, isAdmin, tempImageUpload.single('image'),
  (req, res, next) => {
    res.json({
      imagePath: req.file.path,
    });
  });

module.exports = router;


