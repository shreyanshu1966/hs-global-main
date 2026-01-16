# Test Freightos Integration

## Test the Shipping Estimate Endpoint

Run this command to test the shipping estimate API:

```bash
curl -X POST http://localhost:3000/api/shipping/estimate ^
  -H "Content-Type: application/json" ^
  -d "{\"items\": [{\"id\": \"1\", \"name\": \"Granite Slab\", \"category\": \"slabs\", \"quantity\": 10, \"price\": \"5000\"}], \"destination\": {\"country\": \"United States\", \"city\": \"New York\", \"state\": \"NY\", \"postalCode\": \"10001\"}, \"serviceType\": \"ocean\"}"
```

## Expected Response

You should see something like:

```json
{
  "ok": true,
  "shipping": {
    "cost": 862.50,
    "currency": "USD",
    "transitDays": "15-25",
    "provider": "fallback",
    "serviceType": "ocean",
    "isFallback": true,
    "breakdown": {
      "baseEstimate": 625.00,
      "rangeMin": 531.25,
      "rangeMax": 750.00,
      "customerCharge": 862.50,
      "bufferAmount": 112.50
    },
    "weight": {
      "total": 250,
      "unit": "kg"
    },
    "volume": {
      "total": 0.5,
      "unit": "m³"
    }
  }
}
```

## Test in Browser

1. Open your checkout page: http://localhost:5173/checkout
2. Add items to cart
3. Fill in complete shipping address
4. The ShippingEstimator component should appear
5. Toggle between Ocean and Air freight
6. See the shipping cost update

## Troubleshooting

If the backend server is running but not responding:
1. Check if MongoDB is running
2. Check the backend console for errors
3. Verify the .env file has all required variables
4. Try restarting the backend server

## Backend Server Status

The backend should show:
```
Server running on port 3000
Environment: development
MongoDB connected successfully
```

If you don't see these messages, check:
- MongoDB connection string in .env
- All environment variables are set
- No port conflicts (port 3000 is free)
