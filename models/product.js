const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  categories: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    }
  ],
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

module.exports = model('Product', productSchema);
