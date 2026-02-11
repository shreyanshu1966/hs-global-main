# 🎯 Discount Management Page - Quick Start Guide

## 📍 How to Access

### From Admin Panel:
1. Navigate to `/admin`
2. Look for the **"Discount Management"** quick action card at the top
3. Click **"Manage Discounts"** button

### Direct Access:
- URL: `/admin/discounts`
- Protected route (requires admin authentication)

---

## 🎨 Page Features

### 📊 Analytics Dashboard
**4 Key Metrics Cards:**
- **Active Discounts** (🟢 Green) - Currently running discounts
- **Scheduled Discounts** (🟡 Yellow) - Discounts starting in the future
- **Expired Discounts** (🔴 Red) - Past discounts still enabled (needs cleanup)
- **Average Discount** (🔵 Blue) - Mean percentage across all products

### ⚠️ Expiring Soon Alert
- Displays discounts ending within 3 days
- Shows product name, discount percentage, and days remaining
- Orange alert box for high visibility
- Helps prevent unexpected discount expirations

### 🔍 Search & Filter
- **Search Bar**: Filter products by name or product ID
- **Status Filter Dropdown**:
  - All Discounts (show everything)
  - Active Only (currently running)
  - Scheduled Only (future discounts)
  - Expired Only (cleanup candidates)

### 🧹 Cleanup Function
- **"Cleanup X Expired"** button appears when expired discounts exist
- Disables all expired discounts in one click
- Confirmation prompt before execution
- Updates analytics in real-time after cleanup

### 📋 Products Table

**Columns:**
1. **Product** - Image, name, and product ID
2. **Category** - Furniture or Slabs badge
3. **Discount** - Percentage and description
4. **Price** - Final price, original price (strikethrough), savings amount
5. **Period** - Start and end dates
6. **Status** - Color-coded discount status badge

**Status Indicators:**
- 🟢 **GREEN** - Active (>3 days remaining)
- 🟠 **ORANGE** - Expiring Soon (≤3 days)
- 🟡 **YELLOW** - Scheduled (future start date)
- 🔴 **RED** - Expired (past end date)

### 📄 Pagination
- Shows X of Y products
- Previous/Next navigation
- Current page indicator
- Configurable page size (default: 20 per page)

---

## 🔧 Usage Scenarios

### Scenario 1: Regular Maintenance
**Frequency:** Daily or Weekly

1. Access discount management page
2. Check "Expired" count in analytics
3. Click "Cleanup Expired" if count > 0
4. Review "Expiring Soon" alert
5. Plan replacements for expiring discounts

### Scenario 2: Campaign Planning
**Before launching sale:**

1. Filter by "Scheduled Only"
2. Verify start/end dates
3. Check discount percentages
4. Ensure descriptions are accurate

### Scenario 3: Performance Analysis
**Monthly review:**

1. Check average discount percentage
2. Compare active vs total discounts
3. Identify high-performing discount ranges
4. Adjust strategy based on analytics

### Scenario 4: Emergency Cleanup
**When many discounts expire:**

1. Navigate to discount management
2. Note expired count (red card)
3. Click "Cleanup X Expired"
4. Confirm action
5. Verify analytics update

---

## 💡 Pro Tips

### Best Practices:
1. **Run cleanup weekly** to keep data clean
2. **Monitor expiring soon** to avoid gaps in promotions
3. **Use filters** to focus on specific discount states
4. **Check analytics regularly** to understand discount trends
5. **Plan ahead** - schedule discounts before current ones expire

### Keyboard Shortcuts:
- Type in search box to instantly filter
- Tab to navigate between controls
- Enter to submit forms/actions

### Visual Cues:
- **Orange badges** = Urgent (expiring soon)
- **Red badges** = Action needed (expired)
- **Yellow badges** = Future plans (scheduled)
- **Green badges** = All good (active)

---

## 🔗 Integration with Other Features

### Product Management:
- Edit individual product discounts in Product form
- Bulk apply discounts from Products tab
- Preview discounts before saving

### Analytics Dashboard:
- Overall discount metrics in main admin analytics
- Revenue impact from discounted products
- Customer engagement with sales

### Order System:
- Discounts preserved in order history
- Customer sees discount in cart/checkout
- Order details show original discount info

---

## 🛠️ Troubleshooting

### "No discounted products found"
**Possible causes:**
- No products have discounts enabled
- Current filter excludes all products
- Search query too specific

**Solution:**
- Change filter to "All Discounts"
- Clear search box
- Create discounts in Product management

### Analytics not updating
**Solution:**
- Click "Refresh" button
- Check network connection
- Verify admin authentication

### Cleanup not working
**Possible causes:**
- No expired discounts exist
- Server error

**Solution:**
- Check console for errors
- Verify backend is running
- Contact system administrator

---

## 📊 Data Refresh

### Automatic Refresh:
- Analytics load on page mount
- Updates after cleanup action
- Refreshes when filter changes
- Reloads on page navigation

### Manual Refresh:
- Click "Refresh" button
- Useful after bulk product edits
- Ensures latest data displayed

---

## 🚀 Next Steps

After using Discount Management page:

1. **Review insights** - Understand discount performance
2. **Plan campaigns** - Schedule future sales
3. **Clean data** - Remove expired entries
4. **Optimize strategy** - Adjust percentages based on analytics
5. **Monitor trends** - Track average discounts over time

---

## 📱 Responsive Design

The page is fully responsive:
- **Desktop** - Full table with all columns
- **Tablet** - Optimized layout with essential info
- **Mobile** - Stacked cards for easy scrolling

---

## 🔐 Security

- **Protected Route** - Requires admin authentication
- **Token-based API** - Secure backend communication
- **Confirmation Prompts** - Prevents accidental actions
- **Validation** - All inputs validated client & server-side

---

## 📈 Performance

- **Optimized Queries** - Indexed database fields
- **Pagination** - Limits results per page
- **Lazy Loading** - Components load on demand
- **Efficient Updates** - Only changed data refreshed

---

**Need Help?** 
- Check [Comprehensive Discount Management Guide](COMPREHENSIVE_DISCOUNT_MANAGEMENT.md)
- Review console logs for errors
- Contact development team

---

**Last Updated**: February 11, 2026  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production
