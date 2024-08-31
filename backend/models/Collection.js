const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: String,
  items: [{ name: String, description: String }],
  rankers: [{
    email: String,
    accessCode: String,
    hasSubmitted: { type: Boolean, default: false },
    rankings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Collection', CollectionSchema);
