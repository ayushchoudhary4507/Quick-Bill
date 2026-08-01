const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    product_name: {
      type: String, // snapshot of product name at time of sale
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number, // snapshot of unit price at time of sale
      required: true,
    },
  },
  { _id: true, versionKey: false }
);

const saleSchema = new mongoose.Schema(
  {
    total_amount: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [saleItemSchema],
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
