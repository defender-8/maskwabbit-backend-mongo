const express = require('express');

const { isAuth, isAdmin } = require('../middleware/auth');
const { tempImageUpload } = require('../middleware/upload');

const router = express.Router();

// temp upload
router.post(
  '/admin/upload',
  isAuth, isAdmin, tempImageUpload.single('image'),
  (req, res, next) => {
    res.json({
      imagePath: req.file.path,
    });
  });

module.exports = router;

