# 💱 Dynamic Currency System with Auto-Update

## ✅ System Overview

Your currency system now features:
- ✅ **24-hour automatic updates** from external API
- ✅ **Database caching** for performance
- ✅ **Multiple fallback levels** for reliability
- ✅ **INR as base currency** (1 INR = X other currency)

---

## 🔄 How It Works

### **Update Cycle**

```
First Request → Fetch from API → Store in DB → Serve from cache (24h)
                                      ↓
After 24h → Cache expires → Fetch fresh rates → Update DB → Serve new rates
```

### **Fallback Hierarchy**

```
1. Database Cache (< 24h old) ✅ FASTEST
   ↓ (if expired or missing)
2. External API ✅ FRESH DATA
   ↓ (if API fails)
3. Stale Database Cache ⚠️ OLD BUT WORKING
   ↓ (if DB empty)
4. Hardcoded Rates ⚠️ LAST RESORT
```

---

## 🗄️ Database Structure

### **Currency Collection**

```javascript
{
  _id: ObjectId,
  base: "INR",           // Base currency
  rates: {               // Map of currency codes to rates
    USD: 0.012,         // 1 INR = 0.012 USD
    EUR: 0.011,         // 1 INR = 0.011 EUR
    GBP: 0.0095,        // 1 INR = 0.0095 GBP
    // ... more currencies
  },
  lastUpdated: ISODate("2026-01-02T...")
}
```

### **Cache Duration**
- **24 hours** (86,400,000 milliseconds)
- Automatically refreshes when expired
- No manual intervention needed

---

## 🔧 Backend Implementation

### **Files**

1. **`backend/models/Currency.js`**
   - MongoDB schema for currency data
   - Base: INR
   - Rates: Map of currency codes to conversion rates
   - LastUpdated: Timestamp for cache validation

2. **`backend/controllers/currencyController.js`**
   - Handles rate fetching and caching
   - 24-hour cache validation
   - Multiple fallback levels
   - External API integration

3. **`backend/routes/currencyRoutes.js`**
   - Route: `GET /api/currency/rates`
   - Returns current exchange rates

### **API Endpoint**

**GET** `/api/currency/rates`

**Response**:
```json
{
  "ok": true,
  "source": "cache",  // or "api", "stale_cache_fallback", "hardcoded_fallback"
  "rates": {
    "USD": 0.012,
    "INR": 1,
    "EUR": 0.011,
    "GBP": 0.0095,
    // ... more currencies
  },
  "base": "INR",
  "lastUpdated": "2026-01-02T17:00:00.000Z"
}
```

**Sources**:
- `cache` - Served from database (< 24h old) ✅
- `api` - Fresh data from external API ✅
- `stale_cache_fallback` - Old cache (API key missing) ⚠️
- `stale_error_fallback` - Old cache (API error) ⚠️
- `hardcoded_fallback` - Static rates (DB empty) ⚠️

---

## 🌐 External API

### **Provider**: CurrencyAPI.com

**Endpoint**: `https://api.currencyapi.com/v3/latest`

**Configuration**:
```javascript
const EXTERNAL_API_URL = 'https://api.currencyapi.com/v3/latest';
const apiKey = process.env.CURRENCY_API_KEY;

// Request
fetch(`${EXTERNAL_API_URL}?apikey=${apiKey}&base_currency=INR`)
```

### **Environment Variable**

Add to `.env`:
```env
CURRENCY_API_KEY=your_api_key_here
```

**Get API Key**:
1. Visit https://currencyapi.com/
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env` file

**Free Tier**:
- 300 requests/month
- Perfect for 24-hour updates (30 requests/month)

---

## 📊 Update Schedule

### **Automatic Updates**

| Time | Action |
|------|--------|
| **First Request** | Fetch from API → Store in DB |
| **0-24 hours** | Serve from database cache |
| **After 24 hours** | Cache expires → Fetch fresh rates |
| **Every 24 hours** | Automatic refresh cycle |

### **Example Timeline**

```
Day 1, 10:00 AM - First request → Fetch from API → Cache valid until Day 2, 10:00 AM
Day 1, 2:00 PM  - Request → Serve from cache (fast)
Day 1, 8:00 PM  - Request → Serve from cache (fast)
Day 2, 9:00 AM  - Request → Serve from cache (fast)
Day 2, 11:00 AM - Request → Cache expired → Fetch fresh rates → New cache valid until Day 3, 11:00 AM
```

---

## 🎯 Frontend Integration

### **CurrencyContext**

The frontend automatically fetches rates on load and every 30 minutes:

```typescript
useEffect(() => {
  const fetchRates = async () => {
    const response = await fetch('http://localhost:3000/api/currency/rates');
    const data = await response.json();
    if (data.ok && data.rates) {
      setExchangeRates(data.rates);
    }
  };
  
  fetchRates();
  const interval = setInterval(fetchRates, 30 * 60 * 1000); // 30 min
  return () => clearInterval(interval);
}, []);
```

**Why 30 minutes on frontend?**
- Backend cache is 24 hours
- Frontend checks every 30 minutes for updates
- If backend has fresh data, frontend gets it
- Ensures users see updated rates without page refresh

---

## 🔒 Reliability Features

### **1. Database Caching**
- Stores rates in MongoDB
- Reduces API calls
- Faster response times
- Works offline (uses stale cache)

### **2. Stale Cache Fallback**
- If API fails, uses old rates
- Better than no rates
- Logs warning for monitoring

### **3. Hardcoded Fallback**
- Last resort if everything fails
- Ensures system always works
- Static rates in controller

### **4. Error Handling**
- Catches all API errors
- Graceful degradation
- Detailed logging

---

## 📝 Monitoring

### **Console Logs**

```javascript
✅ [Currency] Serving from cache
🔄 [Currency] Cache stale or missing. Fetching fresh rates...
✅ [Currency] Updated existing rates in DB
❌ [Currency] Failed to fetch rates: [error]
⚠️ [Currency] Using stale cache due to error
⚠️ [Currency] Using hardcoded fallback
```

### **Check Cache Status**

```javascript
// In MongoDB
db.currencies.find({ base: 'INR' })

// Response shows:
{
  base: "INR",
  rates: { ... },
  lastUpdated: ISODate("2026-01-02T...")
}
```

### **Force Refresh**

```javascript
// Delete cache to force fresh fetch
db.currencies.deleteOne({ base: 'INR' })

// Next request will fetch from API
```

---

## 🚀 Setup Instructions

### **1. Install Dependencies**
```bash
npm install
```

### **2. Add API Key**
```env
# .env file
CURRENCY_API_KEY=your_api_key_here
```

### **3. Start Server**
```bash
npm start
```

### **4. Verify**
```bash
# Test endpoint
curl http://localhost:3000/api/currency/rates

# Should return rates with source: "api" or "cache"
```

---

## 🎯 Benefits

### **Performance**
- ⚡ Fast response (database cache)
- ⚡ Reduced API calls (24h cache)
- ⚡ No rate limits (300 requests/month is plenty)

### **Reliability**
- 🛡️ Multiple fallback levels
- 🛡️ Always works (even if API fails)
- 🛡️ Stale data better than no data

### **Accuracy**
- 📊 Real-time rates (updated daily)
- 📊 Professional API source
- 📊 INR as base (perfect for your use case)

### **Cost**
- 💰 Free tier (300 requests/month)
- 💰 Only ~30 requests/month needed
- 💰 Plenty of headroom

---

## 🔧 Maintenance

### **Update Frequency**
- Current: 24 hours
- To change: Edit `CACHE_DURATION` in controller
- Example: 12 hours = `12 * 60 * 60 * 1000`

### **Add More Currencies**
- Automatic from API (supports 150+ currencies)
- Just add to frontend `CURRENCY_SYMBOLS` if needed

### **Monitor Usage**
- Check CurrencyAPI.com dashboard
- View request count
- Upgrade if needed (unlikely)

---

## ✅ Summary

**Your currency system now:**
- ✅ Updates automatically every 24 hours
- ✅ Stores rates in MongoDB database
- ✅ Uses INR as base currency
- ✅ Has multiple fallback levels
- ✅ Works even if API fails
- ✅ Fast and reliable
- ✅ Free (within limits)

**No manual intervention needed!** The system maintains itself. 🎉

---

## 📚 Quick Reference

### **Check Current Rates**
```bash
curl http://localhost:3000/api/currency/rates
```

### **Force Refresh**
```javascript
// MongoDB
db.currencies.deleteOne({ base: 'INR' })
```

### **View Logs**
```bash
# Backend console shows:
✅ [Currency] Serving from cache
🔄 [Currency] Fetching fresh rates...
```

### **Get API Key**
https://currencyapi.com/ → Sign up → Dashboard → Copy API key

---

**Status**: ✅ **PRODUCTION READY WITH AUTO-UPDATE**
