const { Schema, model } = require('mongoose');

const productCategorySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  /*products: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
  ],*/
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Admin',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model('ProductCategory', productCategorySchema, 'product-categories');
