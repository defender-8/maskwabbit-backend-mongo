const express = require('express');

const { body } = require('express-validator');

const Admin = require('../../models/admin');

// const { isAdminNotAuth } = require('../../middleware/auth');

const controller = require('../../controllers/auth');

const router = express.Router();

router.post('/sign-in', /*isAdminNotAuth, */[
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password',
      'Passwords must be 8-20 characters long and include at least 1 lowercase letter, 1 capital letter, 1 number and 1 of special symbols !@#$%^&*-_')
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z](?=.*[!@#$%^&*-_])[\w!@#$%^&*-_]{8,20}$/)
      .trim(),
  ],
  controller.signIn(Admin));

router.post('/password-reset', /*isAdminNotAuth, */[
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_dots: false }),
  ],
  controller.resetPassword(Admin));

router.post('/password-reset/:token', [
    body('password',
      'Passwords must be 8-20 characters long and include at least 1 lowercase letter, 1 capital letter, 1 number and 1 of special symbols !@#$%^&*-_')
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z](?=.*[!@#$%^&*-_])[\w!@#$%^&*-_]{8,20}$/)
      .trim(),
  ],
  controller.changePassword(Admin));

module.exports = router;
