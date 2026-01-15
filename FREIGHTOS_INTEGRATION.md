# Freightos API Integration Guide

## Overview

This document explains how the Freightos API is integrated into the HS Global Export checkout process for real-time freight rate estimation.

## What is Freightos?

Freightos is a global freight shipping marketplace that provides:
- **Real-time freight quotes** from multiple carriers
- **Ocean and air freight** options
- **Competitive pricing** through carrier comparison
- **Transparent transit times** and service levels

## Integration Architecture

### Backend Components

#### 1. **Shipping Service** (`backend/services/shippingService.js`)
- Handles all shipping calculations
- Integrates with Freightos API
- Provides fallback rates when API is unavailable
- Calculates weight and volume based on product categories

#### 2. **Shipping Controller** (`backend/controllers/shippingController.js`)
- Exposes REST API endpoints
- Validates request data
- Returns shipping estimates to frontend

#### 3. **API Routes** (`backend/routes/shipping.js`)
- `POST /api/shipping/estimate` - Get shipping cost estimate
- `GET /api/shipping/rates` - Get available shipping rates by region

### Frontend Components

#### 1. **ShippingEstimator Component** (`frontend/src/components/ShippingEstimator.tsx`)
- Interactive shipping calculator
- Service type selector (Ocean/Air freight)
- Real-time cost updates
- Detailed breakdown display

#### 2. **Checkout Integration** (`frontend/src/pages/Checkout.tsx`)
- Embedded shipping estimator
- Automatic calculation when address is complete
- Total price includes shipping cost

## Configuration

### Environment Variables

Add these to your `backend/.env` file:

```bash
# Freightos API Configuration
FREIGHTOS_API_KEY=your_freightos_api_key_here
FREIGHTOS_API_URL=https://api.freightos.com/v1
```

### Getting Freightos API Credentials

1. **Sign up** at [Freightos.com](https://www.freightos.com)
2. **Request API access** through their developer portal
3. **Get your API key** from the dashboard
4. **Add the key** to your `.env` file

## How It Works

### 1. Weight & Volume Calculation

The system automatically calculates shipping dimensions based on product categories:

```javascript
// Weight estimates (in kg)
- Slabs: 25 kg per unit
- Tiles: 1.5 kg per unit
- Blocks: 500 kg per unit
- Default: 1 kg per unit

// Volume estimates (in m³)
- Slabs: 0.05 m³ per unit
- Tiles: 0.002 m³ per unit
- Blocks: 1.0 m³ per unit
- Default: 0.001 m³ per unit
```

### 2. API Request Flow

```
User fills address → Frontend calls /api/shipping/estimate
                  ↓
Backend calculates weight/volume
                  ↓
Freightos API request (with fallback)
                  ↓
Response with multiple quotes
                  ↓
Best quote selected + 15% buffer
                  ↓
Return to frontend with full breakdown
```

### 3. Freightos API Request Structure

```javascript
{
  origin: {
    country_code: "IN",
    city: "Ahmedabad",
    postal_code: "380051",
    address: "C-108, Titanium Business Park, Makarba"
  },
  destination: {
    country_code: "US",
    city: "New York",
    postal_code: "10001",
    state: "NY"
  },
  shipment: {
    weight: { value: 100, unit: "kg" },
    volume: { value: 2.5, unit: "cbm" },
    cargo_type: "general",
    commodity: "granite_marble_stone",
    packaging: "crate",
    incoterm: "FOB"
  },
  service_type: "ocean", // or "air"
  include_options: true
}
```

### 4. Response Structure

```javascript
{
  ok: true,
  shipping: {
    cost: 1250.50,              // Final charge to customer
    currency: "USD",
    transitDays: "15-25",
    provider: "freightos",
    serviceType: "ocean",
    carrierName: "Maersk Line",
    isFallback: false,
    breakdown: {
      baseEstimate: 1000.00,
      rangeMin: 950.00,
      rangeMax: 1087.00,
      customerCharge: 1250.50,
      bufferAmount: 163.50      // 15% safety buffer
    },
    weight: { total: 100, unit: "kg" },
    volume: { total: 2.5, unit: "m³" },
    allQuotes: [...]            // All available carrier options
  }
}
```

## Features

### ✅ Real-time Rate Calculation
- Automatic updates when destination changes
- Debounced API calls (500ms) to prevent excessive requests

### ✅ Service Type Selection
- **Ocean Freight**: Economical, slower (15-30 days typical)
- **Air Freight**: Faster, more expensive (3-7 days typical)

### ✅ Intelligent Fallback
- If Freightos API is unavailable, uses pre-configured regional rates
- Ensures checkout always works

### ✅ Price Protection
- 15% buffer added to maximum quote
- Protects against price fluctuations
- Covers handling and packaging costs

### ✅ Multi-Carrier Comparison
- Shows best (lowest) quote by default
- Displays alternative carrier options
- Transparent pricing breakdown

## Fallback Rates

When Freightos API is unavailable, the system uses these regional rates:

| Region | Base (USD) | Per Kg | Per m³ | Transit Days |
|--------|-----------|--------|--------|--------------|
| India | $50 | $0.50 | $30 | 3-7 |
| USA | $500 | $2.50 | $150 | 15-25 |
| Canada | $550 | $2.80 | $160 | 15-25 |
| UK | $600 | $3.00 | $180 | 12-20 |
| Europe | $600 | $3.00 | $180 | 12-20 |
| UAE | $400 | $2.00 | $120 | 7-14 |
| Middle East | $400 | $2.00 | $120 | 7-14 |
| Australia | $700 | $3.50 | $200 | 18-28 |
| Singapore | $450 | $2.20 | $130 | 10-18 |
| Asia | $450 | $2.20 | $130 | 10-18 |

## Testing

### Test Without Freightos API
1. Don't set `FREIGHTOS_API_KEY` in `.env`
2. System will use fallback rates automatically
3. All features work normally

### Test With Freightos API
1. Add valid `FREIGHTOS_API_KEY` to `.env`
2. Restart backend server
3. Check console logs for API requests/responses
4. Verify real quotes are returned

### Test Different Scenarios

```bash
# Test ocean freight to USA
POST /api/shipping/estimate
{
  "items": [
    { "id": "1", "category": "slabs", "quantity": 10 }
  ],
  "destination": {
    "country": "United States",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001"
  },
  "serviceType": "ocean"
}

# Test air freight to UK
POST /api/shipping/estimate
{
  "items": [
    { "id": "1", "category": "tiles", "quantity": 100 }
  ],
  "destination": {
    "country": "United Kingdom",
    "city": "London",
    "state": "England",
    "postalCode": "SW1A 1AA"
  },
  "serviceType": "air"
}
```

## User Experience

### Checkout Flow

1. **User adds items to cart**
2. **User proceeds to checkout**
3. **User fills in shipping address**
4. **Shipping estimator appears** (when address is complete)
5. **User selects shipping method** (Ocean/Air)
6. **Real-time cost displayed**
7. **Total updates** with shipping cost
8. **User completes payment**

### Visual Feedback

- **Loading state**: Shows spinner while calculating
- **Error state**: Clear error messages if calculation fails
- **Success state**: Beautiful breakdown of costs
- **Interactive**: Toggle details, compare carriers

## Customization

### Adjust Weight/Volume Estimates

Edit `backend/services/shippingService.js`:

```javascript
calculateTotalWeight(items) {
  // Modify weight per category
  if (item.category === 'slabs') {
    weightPerUnit = 25; // Change this value
  }
}
```

### Adjust Safety Buffer

Edit `backend/services/shippingService.js`:

```javascript
// Change from 15% to your preferred buffer
const bufferMultiplier = 1.15; // 1.20 = 20%, 1.10 = 10%
```

### Add New Regions

Edit fallback rates in `backend/services/shippingService.js`:

```javascript
this.fallbackRates = {
  'Your Region': {
    base: 500,
    perKg: 2.5,
    perCubicMeter: 150,
    transitDays: '15-25'
  }
}
```

## Troubleshooting

### Shipping estimator not showing
- ✅ Check that all address fields are filled
- ✅ Verify `isFormValid` is true
- ✅ Check browser console for errors

### API errors
- ✅ Verify `FREIGHTOS_API_KEY` is set correctly
- ✅ Check API key is valid and active
- ✅ Review backend console logs
- ✅ Ensure API endpoint URL is correct

### Incorrect costs
- ✅ Verify weight/volume calculations
- ✅ Check product categories are set correctly
- ✅ Review fallback rates if API is not used

### Currency conversion issues
- ✅ Update exchange rates in `shippingService.js`
- ✅ Consider using a real-time exchange rate API

## Best Practices

1. **Cache API responses** for same routes (optional enhancement)
2. **Monitor API usage** to stay within rate limits
3. **Log all estimates** for audit trail
4. **Update fallback rates** quarterly
5. **Test with real addresses** before going live
6. **Handle edge cases** (remote locations, heavy items)

## Future Enhancements

- [ ] Add insurance options
- [ ] Support for express shipping
- [ ] Multi-package shipments
- [ ] Customs duty estimation
- [ ] Delivery tracking integration
- [ ] Save favorite shipping methods
- [ ] Compare historical rates
- [ ] Email shipping quotes to customers

## Support

For issues with:
- **Freightos API**: Contact Freightos support
- **Integration code**: Check this documentation
- **Custom requirements**: Modify the service layer

## API Documentation

Official Freightos API docs: https://docs.freightos.com

## Summary

The Freightos integration provides:
- ✅ Real-time freight quotes
- ✅ Multiple carrier options
- ✅ Ocean and air freight
- ✅ Automatic fallback
- ✅ Price protection
- ✅ Beautiful UI
- ✅ Seamless checkout experience

Your customers now get accurate, transparent shipping costs before completing their purchase!
