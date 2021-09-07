// Test commit
const express = require('express');
const { body } = require('express-validator');

const { isAuth, isSuperAdmin, isAdmin } = require('../middleware/auth');

const controller = require('../controllers/admin');

const router = express.Router();

// GET
router.get('/admin/admins', isAuth, isSuperAdmin, controller.getUsers);
router.get('/admin/admins/:id', isAuth, isAdmin, controller.getUser);

// POST
router.post('/admin/admins/new', isAuth, isSuperAdmin, [
    body('firstName', 'firstName is required').not().isEmpty().trim(),
    body('lastName', 'lastName is required').not().isEmpty().trim(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password',
      'Passwords must be 8-20 characters long and include at least 1 lowercase letter, 1 capital letter, 1 number and 1 of special symbols !@#$%^&*-_')
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z](?=.*[!@#$%^&*-_])[\w!@#$%^&*-_]{8,20}$/)
      .trim(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      })
      .trim(),
  ],
  controller.postUser);

router.post('/admin/change-password', isAuth, isAdmin, [
    body('currentPassword',
      'Passwords must be 8-20 characters long and include at least 1 lowercase letter, 1 capital letter, 1 number and 1 of special symbols !@#$%^&*-_')
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z](?=.*[!@#$%^&*-_])[\w!@#$%^&*-_]{8,20}$/)
      .trim(),
    body('newPassword',
      'Passwords must be 8-20 characters long and include at least 1 lowercase letter, 1 capital letter, 1 number and 1 of special symbols !@#$%^&*-_')
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z](?=.*[!@#$%^&*-_])[\w!@#$%^&*-_]{8,20}$/)
      .trim(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords have to match!');
        }
        return true;
      })
      .trim(),
  ],
  controller.postChangePassword);

// PUT
router.put('/admin/admins/:id', isAuth, isAdmin, [
    body('firstName', 'firstName is required').not().isEmpty().trim(),
    body('lastName', 'lastName is required').not().isEmpty().trim(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
  ],
  controller.putUser);

// DELETE
router.delete('/admin/admins/:id', isAuth, isAdmin, controller.deleteUser);

module.exports = router;

