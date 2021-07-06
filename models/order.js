const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const orderSchema = new Schema({
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Client',
  },
  status: {
    type: String,
    required: true,
    default: 'New',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.plugin(AutoIncrement, { inc_field: 'number' });

module.exports = model('Order', orderSchema);
