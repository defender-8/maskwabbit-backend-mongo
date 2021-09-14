const express = require('express');
const { body } = require('express-validator');

const { isAuth, isSuperAdmin, isAdmin } = require('../../middleware/auth');

const controller = require('../../controllers/_user');

const router = express.Router();

// GET
router.get('/admin/super-admins', isAuth, isSuperAdmin, controller.getSuperAdmins);
router.get('/admin/admins', isAuth, isSuperAdmin, controller.getAdmins);
router.get('/admin/clients', isAuth, isAdmin, controller.getClients);
router.get('/admin/users/:id', isAuth, isAdmin, controller.getUser);
router.get('/users/:id', isAuth, controller.getUser);

// POST
router.post('/admin/users/new', isAuth, isSuperAdmin, [
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

router.post('/change-password', isAuth, [
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
router.put('/admin/users/:id', isAuth, isAdmin, [
    body('firstName', 'firstName is required').not().isEmpty().trim(),
    body('lastName', 'lastName is required').not().isEmpty().trim(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
    /*body('password',
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
      .trim(),*/
  ],
  controller.putUser);

router.put('/users/:id', isAuth, [
    body('firstName', 'firstName is required').not().isEmpty().trim(),
    body('lastName', 'lastName is required').not().isEmpty().trim(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
    /*body('password',
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
      .trim(),*/
  ],
  controller.putUser);

// DELETE
router.delete('/admin/users/:id', isAuth, isAdmin, controller.deleteUser);

module.exports = router;

