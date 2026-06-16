const mongoose = require('mongoose');

const RedirectSchema = new mongoose.Schema(
  {
    from: { type: String, unique: true, required: true, index: true },
    to:   { type: String, required: true },
    code: { type: Number, default: 301 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Redirect', RedirectSchema);
