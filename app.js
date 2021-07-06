const path = require('path');

const express = require('express');
const { mongoConnect } = require('./utils/db');
const bodyParser = require('body-parser');

const appRoutes = require('./routes/app');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const productRoutes = require('./routes/product');
const prodCatRoutes = require('./routes/product-category');
const orderRoutes = require('./routes/order');

const app = express();

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/img', express.static(path.join(__dirname, 'public/img')));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(appRoutes);
app.use(authRoutes);
app.use(adminRoutes);
app.use(clientRoutes);
app.use(productRoutes);
app.use(prodCatRoutes);
app.use(orderRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const validationErrorArr = err.valErrArr;
  res.status(status).json({ message: err.message, validationErrorArr });
});

mongoConnect(async () => {
  app.listen('8080');
});
