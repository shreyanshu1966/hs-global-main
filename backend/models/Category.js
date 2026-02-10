const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    isCustom: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const categorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    categoryName: {
        type: String,
        required: true,
        trim: true
    },
    customSubcategories: [subcategorySchema],
    createdBy: {
        type: String,
        default: 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Note: updatedAt is handled manually in static methods

// Static method to get all custom subcategories for a category
categorySchema.statics.getCustomSubcategories = async function(categoryId) {
    const category = await this.findOne({ categoryId });
    return category ? category.customSubcategories : [];
};

// Static method to add a custom subcategory
categorySchema.statics.addCustomSubcategory = async function(categoryId, categoryName, subcategoryName) {
    const subcategoryId = subcategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    let category = await this.findOne({ categoryId });
    
    if (!category) {
        category = new this({
            categoryId,
            categoryName,
            customSubcategories: []
        });
    }
    
    // Check if subcategory already exists
    const existingSubcategory = category.customSubcategories.find(
        sub => sub.name.toLowerCase() === subcategoryName.toLowerCase()
    );
    
    if (!existingSubcategory) {
        category.customSubcategories.push({
            id: subcategoryId,
            name: subcategoryName,
            isCustom: true
        });
        category.updatedAt = Date.now(); // Manually update timestamp
        await category.save();
    }
    
    return category;
};

// Static method to get all categories with their custom subcategories
categorySchema.statics.getAllCategoriesWithCustom = async function() {
    const categories = await this.find({});
    return categories.reduce((acc, cat) => {
        acc[cat.categoryId] = cat.customSubcategories;
        return acc;
    }, {});
};

module.exports = mongoose.model('Category', categorySchema);