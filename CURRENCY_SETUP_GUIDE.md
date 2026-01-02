# 🚀 Quick Setup - Dynamic Currency System

## ✅ What You Need

1. **CurrencyAPI.com Account** (Free)
2. **API Key** from CurrencyAPI.com
3. **MongoDB** (already running)

---

## 📝 Setup Steps

### **Step 1: Get API Key**

1. Visit https://currencyapi.com/
2. Click "Sign Up" (free account)
3. Verify your email
4. Go to Dashboard
5. Copy your API key

### **Step 2: Add to Environment**

Open `backend/.env` and add:

```env
CURRENCY_API_KEY=your_api_key_here
```

**Example**:
```env
CURRENCY_API_KEY=cur_live_abc123xyz456def789
```

### **Step 3: Restart Backend**

```bash
# Stop current server (Ctrl+C)
cd backend
npm start
```

### **Step 4: Test**

```bash
# Test the endpoint
curl http://localhost:3000/api/currency/rates
```

**Expected Response**:
```json
{
  "ok": true,
  "source": "api",
  "rates": {
    "USD": 0.012,
    "EUR": 0.011,
    "GBP": 0.0095,
    ...
  },
  "base": "INR",
  "lastUpdated": "2026-01-02T..."
}
```

---

## ✅ Verification

### **1. Check Backend Console**

You should see:
```
🔄 [Currency] Cache stale or missing. Fetching fresh rates...
✅ [Currency] Created new rates in DB
```

### **2. Check MongoDB**

```javascript
// In MongoDB Compass or Shell
db.currencies.find({ base: 'INR' })
```

Should show:
```javascript
{
  _id: ObjectId("..."),
  base: "INR",
  rates: {
    USD: 0.012,
    EUR: 0.011,
    // ... more currencies
  },
  lastUpdated: ISODate("2026-01-02T...")
}
```

### **3. Test Frontend**

1. Open your website
2. Click LocationSelector (globe icon)
3. Change currency
4. Prices should update correctly

---

## 🎯 How It Works

### **First Request**
```
Browser → Backend → External API → MongoDB → Browser
                     (fetch rates)   (store)   (serve)
```

### **Subsequent Requests (< 24h)**
```
Browser → Backend → MongoDB → Browser
                     (cache)   (serve)
```

### **After 24 Hours**
```
Browser → Backend → External API → MongoDB → Browser
                     (refresh)      (update)  (serve)
```

---

## ⚠️ Troubleshooting

### **Error: "CURRENCY_API_KEY is missing"**

**Solution**: Add API key to `.env` file and restart server

### **Error: "Invalid response from Currency API"**

**Possible causes**:
1. Invalid API key
2. API rate limit exceeded
3. Network issue

**Solution**: Check API key, verify account status on CurrencyAPI.com

### **Rates not updating**

**Solution**: Delete cache to force refresh
```javascript
// MongoDB
db.currencies.deleteOne({ base: 'INR' })
```

---

## 📊 Free Tier Limits

**CurrencyAPI.com Free Plan**:
- ✅ 300 requests/month
- ✅ 150+ currencies
- ✅ Daily updates

**Your Usage**:
- 🔄 ~30 requests/month (1 per day)
- ✅ Well within limits!

---

## 🎉 Done!

Your currency system is now:
- ✅ Auto-updating every 24 hours
- ✅ Storing rates in MongoDB
- ✅ Using real-time exchange rates
- ✅ Reliable with multiple fallbacks

**No more manual updates needed!** 🚀

---

## 📚 Next Steps

1. **Monitor**: Check backend console for update logs
2. **Verify**: Test currency switching on frontend
3. **Relax**: System maintains itself automatically!

---

**Questions?** Check `DYNAMIC_CURRENCY_SYSTEM.md` for detailed documentation.
