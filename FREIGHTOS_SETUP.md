# Quick Setup Guide - Freightos Integration

## Step 1: Add API Credentials

Edit `backend/.env` and add:

```bash
# Freightos API Configuration
FREIGHTOS_API_KEY=your_freightos_api_key_here
FREIGHTOS_API_URL=https://api.freightos.com/v1
```

**Note:** If you don't have a Freightos API key yet, the system will automatically use fallback rates.

## Step 2: Restart Backend Server

```bash
cd backend
npm install  # Install any missing dependencies
# Then restart your server
```

## Step 3: Test the Integration

### Option A: Test via Frontend (Recommended)
1. Go to your checkout page
2. Add items to cart
3. Fill in complete shipping address
4. The shipping estimator will appear automatically
5. Select Ocean or Air freight
6. See real-time shipping costs

### Option B: Test via API
```bash
# Test the shipping estimate endpoint
curl -X POST http://localhost:3000/api/shipping/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "1",
        "name": "Granite Slab",
        "category": "slabs",
        "quantity": 10,
        "price": "5000"
      }
    ],
    "destination": {
      "country": "United States",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001"
    },
    "serviceType": "ocean"
  }'
```

## What You'll See

### With Freightos API Key:
- Real quotes from actual carriers
- Multiple shipping options
- Accurate transit times
- Carrier names (e.g., Maersk, MSC)

### Without Freightos API Key (Fallback):
- Pre-configured regional rates
- Estimated transit times
- Still fully functional
- No external API dependency

## Features Available

✅ **Real-time shipping cost calculation**
- Automatic updates when address changes
- Based on actual weight and volume

✅ **Service type selection**
- Ocean Freight (economical)
- Air Freight (faster)

✅ **Detailed breakdown**
- Base estimate
- Price range
- Safety buffer (15%)
- Weight and volume info

✅ **Multi-carrier comparison**
- Shows best quote
- Lists alternative options
- Transparent pricing

## Troubleshooting

### Shipping estimator not appearing?
- Make sure all address fields are filled
- Check browser console for errors
- Verify backend server is running

### Getting fallback rates instead of Freightos quotes?
- Check if `FREIGHTOS_API_KEY` is set in `.env`
- Verify API key is valid
- Check backend console logs for API errors

### Costs seem incorrect?
- Verify product categories are set correctly
- Check weight/volume calculations in `shippingService.js`
- Review fallback rates if not using Freightos API

## Next Steps

1. **Get Freightos API Access**
   - Visit https://www.freightos.com
   - Sign up for API access
   - Add your API key to `.env`

2. **Customize Rates**
   - Edit fallback rates in `backend/services/shippingService.js`
   - Adjust weight/volume estimates per product
   - Modify safety buffer percentage

3. **Test Thoroughly**
   - Test with different countries
   - Try both ocean and air freight
   - Verify costs are reasonable

4. **Monitor Usage**
   - Check backend logs
   - Monitor API response times
   - Track fallback vs API usage

## Documentation

For complete documentation, see: `FREIGHTOS_INTEGRATION.md`

## Support

- **Integration Issues**: Check `FREIGHTOS_INTEGRATION.md`
- **Freightos API**: https://docs.freightos.com
- **Code Questions**: Review the service layer in `backend/services/shippingService.js`

---

**That's it!** Your Freightos integration is ready to use. 🚀
