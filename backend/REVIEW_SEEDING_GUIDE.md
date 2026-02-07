# 🌟 Review Seeding Script - Complete Guide

## 📋 Overview
This master script generates realistic, diverse, and non-repetitive reviews for all products in your database. It creates authentic-looking reviews from international buyers with different buyer personas and regional characteristics.

## 🚀 Quick Start

### Option 1: Windows Batch File (Recommended)
```bash
# Navigate to backend folder
cd backend

# Run the batch file
run-seed-reviews.bat
```

### Option 2: Direct Node.js
```bash
# Navigate to backend folder  
cd backend

# Run the script
node seed-reviews.js
```

## ✨ Features

### 🌍 **Diverse International Reviewers**
- **25 realistic reviewer profiles** from different regions:
  - USA, UK, Italy, UAE, Singapore, India, Japan, Australia, etc.
- **Buyer personas include:**
  - Interior Designers
  - Homeowners 
  - Architects
  - Contractors
  - Developers
  - Hotel Owners

### 🎯 **Smart Review Generation**
- **3-8 reviews per product** (randomly distributed)
- **Intelligent rating distribution (ONLY GOOD REVIEWS):**
  - 70% → 5-star reviews
  - 30% → 4-star reviews  
  - 0% → 3-star or below (disabled for positive brand image)
- **Non-repetitive content** with template tracking
- **Realistic timestamps** (1 week to 3 months old)

### 📝 **Authentic Review Content**
- **Product-specific templates** for furniture vs. slabs
- **Buyer-type specific language** (architect vs. homeowner tone)
- **Material-aware content** (mentions granite, marble, etc.)
- **Regional context** (shipping to different countries)
- **Professional vs. personal perspectives**

### 🔧 **Technical Features**
- **Unique review validation** (no duplicate templates per product)
- **Realistic email generation** (region-appropriate domains)
- **Smart specification extraction** from product data  
- **Helpful vote simulation** (higher ratings get more helpful votes)
- **Status management** (90% approved, 70% verified)

## 📊 Sample Output

After running, you'll see something like:
```
🌱 Starting review seeding process...
======================================
📦 Found 45 products to generate reviews for
🗑️ Clearing existing reviews...
✅ Removed 0 existing reviews
📝 Generating 5 reviews for: Black Galaxy Coffee Table
📝 Generating 7 reviews for: Italian Carrara Marble Slab
...
💾 Inserting 267 reviews into database...
✅ Review seeding completed successfully!
==========================================
📊 Generated 267 total reviews
📈 Rating distribution:
   5 stars: 187 reviews
   4 stars: 80 reviews
✅ Verified reviews: 187
✅ Approved reviews: 240
```

## 🎨 Sample Generated Reviews

### Furniture Review (5-star, Interior Designer)
```
Title: "Absolutely Outstanding!"
Rating: ⭐⭐⭐⭐⭐
Reviewer: Sarah Johnson (USA) - Interior Designer
Verified: ✅

"Absolutely stunning piece! The Black Galaxy granite finish is exceptional and the 
craftsmanship is top-notch. My clients are thrilled with how this coffee table 
transformed their space. Perfect proportions and the quality is evident in every detail."

Helpful: 12 people found this helpful
```

### Slab Review (4-star, Architect)  
```
Title: "Great Quality"
Rating: ⭐⭐⭐⭐
Reviewer: Rajesh Patel (India) - Architect  
Verified: ✅

"Solid construction and beautiful finish! This marble was perfect for our high-end 
residential project. The polished finish is professional grade and installation was 
straightforward. Client is very happy with the premium quality."

Helpful: 8 people found this helpful
```

## ⚙️ Customization Options

You can modify the script behavior by editing variables at the top of `seed-reviews.js`:

### Review Quantity
```javascript
// Change this line to adjust reviews per product
const numberOfReviews = Math.floor(Math.random() * 6) + 3; // 3 to 8 reviews
```

### Rating Distribution  
```javascript
// Modify this array to change rating probabilities
const ratingDistribution = [5, 5, 5, 5, 5, 5, 5, 4, 4, 4]; // Current: 70% 5-star, 30% 4-star
```

### Verification Rates
```javascript
// Adjust verification and approval rates  
verified: Math.random() > 0.3, // 70% verified
status: Math.random() > 0.1 ? 'approved' : 'pending', // 90% approved
```

## 🛠️ Advanced Configuration

### Adding New Reviewer Profiles
Add to the `reviewerProfiles` array:
```javascript
{ name: 'Your Name', region: 'Country', buyerType: 'profession' }
```

### Creating Custom Review Templates
Add to the `reviewTemplates` object under appropriate category/rating/buyerType:
```javascript
"Your custom review template with {material} and {product} placeholders"
```

### Regional Email Domains
Modify the `domains` object in `generateEmail` function to add country-specific email providers.

## 📈 Database Impact

### What Gets Created:
- **Reviews Collection**: New documents with all review data
- **Indexes**: Automatic indexes for performance (productId, rating, status)  
- **Statistics**: Aggregated rating data for each product

### What Gets Cleared:
- **Previous Reviews**: All existing reviews are deleted (can be disabled)
- **Statistics Reset**: Product rating averages will be recalculated

## 🚨 Important Notes

### Before Running:
1. **Backup your database** if you have existing reviews you want to keep
2. **Ensure MongoDB is running** and accessible
3. **Verify .env file** contains correct MONGODB_URI
4. **Run product migration first** if you haven't already

### After Running:
1. **Check product pages** to see reviews displayed
2. **Verify review statistics** are calculating correctly  
3. **Test review functionality** (sorting, filtering)

## 🔍 Troubleshooting

### Common Issues:

**"No products found"**
- Run the product migration script first: `node migrate-products.js`

**"MongoDB Connection Error"** 
- Check your .env file has MONGODB_URI
- Ensure MongoDB service is running
- Verify database connection string

**"Permission errors"**
- Ensure you have write access to the database
- Check that the database user has proper permissions

**"Template exhaustion warnings"**
- This is normal for products with many reviews
- The script handles this gracefully with slight modifications

## 📝 Script Files Created

| File | Purpose |
|------|---------|
| `seed-reviews.js` | Main seeding script |
| `run-seed-reviews.bat` | Windows batch file for easy execution |
| `review-config.env` | Configuration file for easy customization |
| `REVIEW_SEEDING_GUIDE.md` | This documentation |

## 🎯 Next Steps

1. **Run the script** to generate reviews
2. **Check your product pages** to see the reviews in action  
3. **Customize as needed** by modifying templates or reviewer profiles
4. **Set up review management** in your admin panel for future reviews
5. **Monitor review analytics** to track engagement

## 📞 Support

If you encounter any issues or need to modify the script for your specific requirements, the code is well-commented and modular for easy customization.

Happy reviewing! 🌟