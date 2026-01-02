# 💱 New Currency System Documentation

## ✅ What Changed

### **Old System (REMOVED)**
- ❌ Complex multi-step conversion: INR → USD → User Currency
- ❌ LocalizationContext with location detection
- ❌ External currency API dependency
- ❌ Inconsistent pricing across components
- ❌ Hard to maintain and debug

### **New System (IMPLEMENTED)**
- ✅ Simple direct conversion: INR → User Currency
- ✅ Centralized CurrencyContext
- ✅ Static exchange rates (reliable, fast)
- ✅ Consistent pricing everywhere
- ✅ Easy to maintain and extend

---

## 📁 File Structure

### **Backend**
```
backend/
└── routes/
    └── currencyRoutes.js  (Simplified - static rates)
```

### **Frontend**
```
frontend/src/
├── contexts/
│   └── CurrencyContext.tsx  (NEW - Central currency management)
├── components/
│   ├── CurrencySelector.tsx  (NEW - Currency dropdown)
│   ├── ProductCard.tsx  (UPDATED)
│   ├── CartDrawer.tsx  (UPDATED)
│   └── ...
└── pages/
    ├── ProductDetails.tsx  (UPDATED)
    ├── Checkout.tsx  (UPDATED)
    └── ...
```

---

## 🔧 Backend API

### **Endpoint**: `GET /api/currency/rates`

**Response**:
```json
{
  "ok": true,
  "source": "static",
  "rates": {
    "USD": 0.012,
    "INR": 1,
    "EUR": 0.011,
    "GBP": 0.0095,
    "AED": 0.044,
    "SAR": 0.045,
    "AUD": 0.018,
    "CAD": 0.016,
    "SGD": 0.016,
    "JPY": 1.8
  },
  "base": "INR",
  "timestamp": "2026-01-02T..."
}
```

**Exchange Rates** (1 INR = X Currency):
- 1 INR = 0.012 USD (~83 INR per USD)
- 1 INR = 0.011 EUR
- 1 INR = 0.0095 GBP
- 1 INR = 0.044 AED
- etc.

---

## 🎯 Frontend Usage

### **1. CurrencyContext**

**Location**: `frontend/src/contexts/CurrencyContext.tsx`

**Provides**:
```typescript
{
  currency: string;              // Current currency code (e.g., 'INR', 'USD')
  exchangeRates: ExchangeRates;  // All exchange rates
  loading: boolean;              // Loading state
  setCurrency: (code: string) => void;  // Change currency
  convertFromINR: (amountINR: number) => number;  // Convert INR to user currency
  formatPrice: (amountINR: number) => string;  // Format with symbol
  getCurrencySymbol: () => string;  // Get current currency symbol
}
```

**Example**:
```tsx
import { useCurrency } from '../contexts/CurrencyContext';

const MyComponent = () => {
  const { formatPrice, currency, setCurrency } = useCurrency();
  
  const priceINR = 161999;  // Product price in INR
  
  return (
    <div>
      <p>Price: {formatPrice(priceINR)}</p>
      {/* Output: "$1,943.99" if currency is USD */}
      {/* Output: "₹161,999.00" if currency is INR */}
    </div>
  );
};
```

### **2. Component Updates**

#### **ProductCard.tsx**
```tsx
const { formatPrice } = useCurrency();

const displayPrice = useMemo(() => {
  if (product.category === 'furniture' && specs?.priceINR) {
    return formatPrice(specs.priceINR);  // Direct conversion
  }
  if ((product as any).priceINR) {
    return formatPrice((product as any).priceINR);
  }
  return "₹2,499/m²";
}, [product, specs, formatPrice]);
```

#### **CartDrawer.tsx**
```tsx
const { formatPrice, getCurrencySymbol, convertFromINR } = useCurrency();

const subtotal = useMemo(() => {
  return state.items.reduce((sum, item) => {
    const priceInINR = extractPriceInINR(item.price);
    const convertedPrice = convertFromINR(priceInINR);
    return sum + convertedPrice * item.quantity;
  }, 0);
}, [state.items, convertFromINR]);
```

#### **ProductDetails.tsx**
```tsx
const { formatPrice } = useCurrency();

if (resolved?.priceINR) {
  displayPrice = formatPrice(resolved.priceINR);  // Direct conversion
}
```

#### **Checkout.tsx**
```tsx
const { formatPrice, getCurrencySymbol, convertFromINR } = useCurrency();

const subtotalINR = useMemo(() => {
  return state.items.reduce((sum, item) => {
    const priceInINR = extractPriceInINR(item.price);
    return sum + priceInINR * item.quantity;
  }, 0);
}, [state.items]);

const subtotal = useMemo(() => convertFromINR(subtotalINR), [subtotalINR, convertFromINR]);
```

### **3. Currency Selector**

**Location**: `frontend/src/components/CurrencySelector.tsx`

**Usage**:
```tsx
import { CurrencySelector } from './components/CurrencySelector';

// In Header or Navbar
<CurrencySelector />
```

**Features**:
- Dropdown with all available currencies
- Shows currency symbol and code
- Highlights current selection
- Persists selection in localStorage

---

## 💾 Data Flow

### **Price Storage**
- All prices stored in **INR** (Indian Rupees)
- Product data: `priceINR: 161999`
- Cart items: `price: "161999"` (string)

### **Price Display**
```
Product Price (INR)
      ↓
convertFromINR()
      ↓
User Currency
      ↓
formatPrice()
      ↓
"$1,943.99"
```

### **Example Flow**

**Product**: Luxury Marble Table
**Price in Database**: ₹161,999

**User in USA (USD)**:
1. `priceINR = 161999`
2. `convertFromINR(161999)` → `161999 * 0.012 = 1943.99`
3. `formatPrice(161999)` → `"$1,943.99"`

**User in India (INR)**:
1. `priceINR = 161999`
2. `convertFromINR(161999)` → `161999 * 1 = 161999`
3. `formatPrice(161999)` → `"₹161,999.00"`

**User in UK (GBP)**:
1. `priceINR = 161999`
2. `convertFromINR(161999)` → `161999 * 0.0095 = 1538.99`
3. `formatPrice(161999)` → `"£1,538.99"`

---

## 🔄 Currency Switching

**User Action**: Selects EUR from currency dropdown

**What Happens**:
1. `setCurrency('EUR')` called
2. Currency saved to localStorage
3. Context state updates
4. All components re-render with new currency
5. Prices automatically update

**Before** (USD):
- Product: $1,943.99
- Cart Total: $3,887.98

**After** (EUR):
- Product: €1,780.99
- Cart Total: €3,561.98

---

## 🎨 UI Components

### **Currency Selector**
- **Location**: Header/Navbar
- **Design**: Dropdown with globe icon
- **Features**:
  - Shows current currency
  - Lists all available currencies
  - Hover to show dropdown
  - Click to select

### **Price Display**
- **Format**: `{symbol}{amount}`
- **Examples**:
  - `$1,943.99` (USD)
  - `₹161,999.00` (INR)
  - `€1,780.99` (EUR)
  - `£1,538.99` (GBP)

---

## 🚀 Benefits

### **Performance**
- ✅ No external API calls (faster)
- ✅ Static rates (reliable)
- ✅ Cached in localStorage (persistent)

### **Simplicity**
- ✅ One-step conversion (easier to understand)
- ✅ Centralized logic (single source of truth)
- ✅ Consistent across all pages

### **Maintainability**
- ✅ Easy to update rates (single file)
- ✅ Easy to add currencies (just add to array)
- ✅ Easy to debug (simple flow)

---

## 📝 How to Update Exchange Rates

**File**: `backend/routes/currencyRoutes.js`

```javascript
const EXCHANGE_RATES = {
  USD: 0.012,    // Update this value
  INR: 1,        // Always 1 (base currency)
  EUR: 0.011,    // Update this value
  GBP: 0.0095,   // Update this value
  // ... add more currencies
};
```

**Steps**:
1. Open `backend/routes/currencyRoutes.js`
2. Update the `EXCHANGE_RATES` object
3. Restart backend server
4. Frontend will automatically fetch new rates

---

## 🧪 Testing

### **Test Currency Conversion**
```tsx
const { convertFromINR, formatPrice } = useCurrency();

// Test 1: INR to USD
console.log(convertFromINR(100000)); // Should be ~1200 USD

// Test 2: Format price
console.log(formatPrice(161999)); // Should be "$1,943.99" (if USD)

// Test 3: Switch currency
setCurrency('EUR');
console.log(formatPrice(161999)); // Should be "€1,780.99"
```

### **Test Components**
1. **ProductCard**: Check price displays correctly
2. **CartDrawer**: Check total calculates correctly
3. **Checkout**: Check payment amount is in INR
4. **CurrencySelector**: Check dropdown works

---

## ⚠️ Important Notes

### **Payment Processing**
- **Always process payments in INR** (Razorpay requirement)
- Display prices in user's currency
- Convert back to INR for payment

```tsx
// Display to user
const displayTotal = formatPrice(subtotalINR); // "$1,943.99"

// Send to payment gateway
const paymentAmount = subtotalINR; // 161999 (INR)
```

### **Price Storage**
- **Never store converted prices**
- Always store in INR
- Convert on-the-fly for display

### **Decimal Places**
- Most currencies: 2 decimal places
- JPY (Japanese Yen): 0 decimal places (handled automatically)

---

## 🔧 Troubleshooting

### **Prices not updating**
- Check if CurrencyProvider is wrapping the app
- Check if useCurrency hook is being called
- Clear localStorage and refresh

### **Wrong currency symbol**
- Check CURRENCY_SYMBOLS in CurrencyContext
- Verify currency code is correct

### **API not loading**
- Check backend server is running
- Check API endpoint: `http://localhost:3000/api/currency/rates`
- Check browser console for errors

---

## 📚 Quick Reference

### **Convert INR to User Currency**
```tsx
const { convertFromINR } = useCurrency();
const userPrice = convertFromINR(priceINR);
```

### **Format Price with Symbol**
```tsx
const { formatPrice } = useCurrency();
const displayPrice = formatPrice(priceINR);
```

### **Get Current Currency**
```tsx
const { currency, getCurrencySymbol } = useCurrency();
console.log(currency); // "USD"
console.log(getCurrencySymbol()); // "$"
```

### **Change Currency**
```tsx
const { setCurrency } = useCurrency();
setCurrency('EUR');
```

---

## ✨ Summary

**Old System**: INR → USD → User Currency (3 steps, complex)
**New System**: INR → User Currency (1 step, simple)

**Result**: Faster, simpler, more reliable currency conversion across the entire application! 🎉
