const express = require('express');
const { body } = require('express-validator');

const { isAuth, isSuperAdmin, isAdmin } = require('../../middleware/auth');

const controller = require('../../controllers/admin');

const router = express.Router();

router.get('/', isAuth, isSuperAdmin, controller.get);
router.get('/:id', isAuth, isAdmin, controller.getById);

router.post('/new', isAuth, isSuperAdmin, [
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
  controller.post);

router.post('/change-password', isAuth, isAdmin, [
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
  controller.changePassword);

router.put('/:id', isAuth, isAdmin, [
    body('firstName', 'firstName is required').not().isEmpty().trim(),
    body('lastName', 'lastName is required').not().isEmpty().trim(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
  ],
  controller.put);

router.delete('/:id', isAuth, isAdmin, controller.delete);

module.exports = router;

