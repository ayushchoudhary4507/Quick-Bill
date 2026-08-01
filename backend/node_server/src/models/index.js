/**
 * Models index — exports all Mongoose models.
 * SaleItem is embedded inside Sale, not a separate collection.
 */
const User = require('./User');
const Product = require('./Product');
const Sale = require('./Sale');       // includes embedded SaleItem
const Payment = require('./Payment');

module.exports = { User, Product, Sale, Payment };
