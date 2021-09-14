const path = require('path');

const express = require('express');
const { mongoConnect } = require('./utils/db');
const bodyParser = require('body-parser');

const clientRouter = require('./routes/client');
const dashboardRouter = require('./routes/dashboard');


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

app.use(clientRouter);
app.use('/dashboard', dashboardRouter);

app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const validationErrorArr = err.valErrArr;
  res.status(status).json({ message: err.message, validationErrorArr });
});

mongoConnect(async () => {
  app.listen('8080');
});
