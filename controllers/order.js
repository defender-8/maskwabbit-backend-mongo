const { validationResult } = require('express-validator');
const stripe = require('stripe')(
  'sk_test_51HS2HWBJqP6DJlTVKK4pV8TfmkStEMjvfAvvSQrvUN7xYqrVx0Nub5eguiQnwwSaN562RWD36Ynjbgmg1v2fQDjf00lNhBtTv8');

const Order = require('../models/order');
const Product = require('../models/product');

const endpointSecret = 'whsec_QzPtqgjHDTJJALVl0V3PjBZjfQezCw3m';

exports.get = async (req, res, next) => {
  const { page, sorter, filters, search } = req.query;
  let { currentPage, pageSize } = page;

  currentPage = +currentPage;
  pageSize = +pageSize;

  const conditions = search.length ? { number: +search } : {};

  if (filters.status) {
    conditions.status = filters.status;
  }

  try {
    const orders = await Order.find(conditions)
      .sort(sorter)
      .skip(((currentPage - 1) * pageSize))
      .limit(pageSize);

    const total = await Order.countDocuments(conditions);

    res.status(200).json({ orders, total });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserOrders = async (req, res, next) => {
  const id = req.params.id;

  try {
    const orders = await Order.find({ user: id })
      .populate('user', 'fullName email')
      .populate('products.product', 'title price image');
    res.status(200).json({ orders });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const order = await Order.findById(id)
      .populate('user', 'fullName email')
      .populate('products.product', 'title price image');
    res.status(200).json({ order });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postCheckout = async (req, res, next) => {
  const validationErrors = validationResult(req);
  const { cartItems, cartTotal } = req.body;

  const CLIENT_DOMAIN = 'http://localhost:3001';
  const SERVER_DOMAIN = 'http://localhost:8080';

  const metaCartItems = cartItems.map(ci => [ci.product._id, ci.quantity]);

  try {
    if (!validationErrors.isEmpty()) {
      const err = new Error('Validation failed, entered data is incorrect!');
      err.statusCode = 422;
      err.valErrArr = validationErrors.array();
      throw err;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cartItems.map(ci => {
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: ci.product.title,
              images: [`${SERVER_DOMAIN}/${ci.product.image}`],
            },
            unit_amount: Math.round(ci.product.price * 100),
          },
          quantity: ci.quantity,
        };
      }),
      metadata: {
        'cartItemsStr': `${metaCartItems}`,
        'cartTotal': `${cartTotal}`,
        'userId': `${req.userId}`,
      },
      mode: 'payment',
      success_url: `${CLIENT_DOMAIN}/checkout/success`,
      cancel_url: `${CLIENT_DOMAIN}/checkout`,
    });

    res.json({ id: session.id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.post = async (req, res, next) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];

  let event;

  // Verify events came from Stripe
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Fulfilling order', session);

      const { cartItemsStr, cartTotal, userId } = session.metadata;

      const cartItemsOneArr = cartItemsStr.split(',');

      const cartItems = [];

      for (let i = 0; i < cartItemsOneArr.length - 1; i += 2) {
        cartItems[i / 2] = {
          product: cartItemsOneArr[i],
          quantity: +cartItemsOneArr[i + 1],
        };
      }

      const order = new Order({
        products: cartItems,
        total: +cartTotal,
        user: userId,
      });

      const newOrder = await order.save();

      if (order === newOrder) {
        for (let ci of cartItems) {
          const product = await Product.findById(ci.product);
          product.amount = product.amount - ci.quantity;
          await product.save();
        }
      }

      res.status(200).json({
        message: 'Successfully Ordered!',
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.put = async (req, res, next) => {
  const validationErrors = validationResult(req);

  const { ...values } = req.body;
  const id = req.params.id;

  try {
    if (!validationErrors.isEmpty()) {
      const err = new Error('Validation failed, entered data is incorrect!');
      err.statusCode = 422;
      err.valErrArr = validationErrors.array();
      throw err;
    }

    const order = await Order.findById(id);
    await order.updateOne({ ...values });
    const orderUpdated = await Order.findById(id)
      .populate('user', 'fullName email')
      .populate('products.product', 'title price image');
    res.status(200).json({
      order: orderUpdated,
      message: 'Order is saved!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  const id = req.params.id;

  try {
    await Order.deleteOne({ _id: id });
    res.status(200).json({ message: 'Order is removed' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Deleting is failed';
    }
    next(err);
  }
};
