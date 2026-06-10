const mongoose = require('mongoose');

const navItemSchema = new mongoose.Schema({
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
}, { _id: false });

const sectionSchema = new mongoose.Schema({
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    items: [navItemSchema],
}, { _id: false });

const navbarConfigSchema = new mongoose.Schema({
    categoryId: { type: String, required: true, unique: true, trim: true },
    categoryName: { type: String, required: true, trim: true },
    sections: [sectionSchema],
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('NavbarConfig', navbarConfigSchema);
