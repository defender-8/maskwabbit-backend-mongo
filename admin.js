const { mongoConnect } = require('./utils/db');
mongoConnect(() => null);

const bcrypt = require('bcryptjs');

const Admin = require('./models/admin');

const firstName = 'Alex';
const lastName = 'Kondratenko';
const fullName = firstName + ' ' + lastName;
const email = 'ak@tcgsi.com';
const password = 'Qwerty_12345';
const role = 'super admin';

async function createAdmin() {
  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new Admin({
      firstName, lastName, fullName, email, password: hashedPw, role,
    });

    console.log(user);

    await user.save();

    console.log('Admin is created!!!');
  } catch (err) {
    console.log(err);
  }
}

createAdmin();
