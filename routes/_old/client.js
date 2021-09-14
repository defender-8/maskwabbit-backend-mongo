const express = require('express');
const { body } = require('express-validator');

const { isAuth, isAdmin } = require('../../middleware/auth');

const controller = require('../../controllers/client');

const router = express.Router();

// GET
router.get('/admin/clients', isAuth, isAdmin, controller.getUsers);
router.get('/clients/:id', isAuth, controller.getUser);

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
router.put('/clients/:id', isAuth, [
    body('firstName', 'firstName is required').not().isEmpty().trim(),
    body('lastName', 'lastName is required').not().isEmpty().trim(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
  ],
  controller.putUser);

// DELETE
router.delete('/admin/clients/:id', isAuth, isAdmin, controller.deleteUser);

module.exports = router;

