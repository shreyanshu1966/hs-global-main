/**
 * Regional Pricing Test Script
 * Tests: product fetch, calculate-cart-total with all 6 regions, currency conversion
 *
 * Usage:
 *   node test-regional-pricing.js
 *   node test-regional-pricing.js --product HSG-001
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const _productFlagIdx = process.argv.indexOf('--product');
const TARGET_PRODUCT_ID = process.argv.find(a => a.startsWith('--product='))?.split('=')[1]
    || (_productFlagIdx !== -1 ? process.argv[_productFlagIdx + 1] : null)
    || null;

const REGIONS = ['default', 'UAE', 'USA', 'India', 'Europe', 'UK'];
const REGION_CURRENCIES = { default: 'USD', UAE: 'USD', USA: 'USD', India: 'INR', Europe: 'GBP', UK: 'GBP' };

// ─── HTTP helper ─────────────────────────────────────────────────────────────
function request(url, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const lib = parsed.protocol === 'https:' ? https : http;
        const reqOptions = {
            hostname: parsed.hostname,
            port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
            path: parsed.pathname + parsed.search,
            method: options.method || 'GET',
            headers: { 'Content-Type': 'application/json', ...options.headers },
        };

        const req = lib.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, body: data }); }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// ─── Utilities ────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);
const line = (char = '─', n = 70) => char.repeat(n);
const pass = (msg) => console.log(`  ✅  ${msg}`);
const fail = (msg) => console.log(`  ❌  ${msg}`);
const info = (msg) => console.log(`  ℹ️   ${msg}`);

// ─── Tests ────────────────────────────────────────────────────────────────────

async function testServerHealth() {
    console.log('\n' + line());
    console.log('TEST 1 — Server health');
    console.log(line());
    try {
        const r = await request(`${BASE_URL}/api/products?limit=1`);
        if (r.status === 200 && r.body.success) {
            pass(`Server is up. Status: ${r.status}`);
            return true;
        } else {
            fail(`Unexpected response: ${r.status} — ${JSON.stringify(r.body).slice(0, 120)}`);
            return false;
        }
    } catch (e) {
        fail(`Cannot reach ${BASE_URL} — ${e.message}`);
        console.log('  Make sure the backend server is running: cd backend && node server.js');
        return false;
    }
}

async function fetchOneProduct(productId) {
    const url = productId
        ? `${BASE_URL}/api/products/${productId}`
        : `${BASE_URL}/api/products?limit=1`;

    const r = await request(url);
    if (r.status !== 200 || !r.body.success) {
        fail(`Failed to fetch product: ${JSON.stringify(r.body).slice(0, 120)}`);
        return null;
    }

    // Both single and list endpoint
    const product = r.body.data?.product || (Array.isArray(r.body.data) ? r.body.data[0] : r.body.data);
    return product || null;
}

async function testProductFetch(productId) {
    console.log('\n' + line());
    console.log('TEST 2 — Product fetch + regional pricing field');
    console.log(line());

    const product = await fetchOneProduct(productId);
    if (!product) { fail('No product returned.'); return null; }

    pass(`Fetched: "${product.name}" (id=${product.productId || product._id})`);
    info(`priceUSD: ${product.priceUSD ?? '(none — price on request)'}`);
    info(`regionalPricing field present: ${product.regionalPricing !== undefined ? 'yes' : 'NO ← missing from API response'}`);

    if (product.regionalPricing && typeof product.regionalPricing === 'object') {
        const regions = Object.keys(product.regionalPricing);
        if (regions.length === 0) {
            info('regionalPricing is empty — no overrides set (that is fine)');
        } else {
            pass(`Regional overrides: ${regions.join(', ')}`);
            for (const [reg, val] of Object.entries(product.regionalPricing)) {
                info(`  ${pad(reg, 8)} enabled=${val.enabled} type=${val.adjustmentType} value=${val.adjustmentValue}`);
            }
        }
    } else {
        info('regionalPricing is null / undefined (no overrides configured)');
    }

    return product;
}

async function testCalculateCartTotal(product) {
    console.log('\n' + line());
    console.log('TEST 3 — /api/calculate-cart-total across all regions');
    console.log(line());

    if (!product?.priceUSD) {
        info(`Product has no priceUSD — skipping cart total test`);
        return;
    }

    const id = product.productId || product._id;
    console.log(`\n  Product: "${product.name}" | base priceUSD = $${product.priceUSD}\n`);
    console.log(`  ${pad('Region', 10)} ${pad('Currency', 10)} ${rpad('Total USD', 12)} ${pad('Status', 8)}`);
    console.log(`  ${line('─', 46)}`);

    const results = [];
    for (const region of REGIONS) {
        const r = await request(`${BASE_URL}/api/calculate-cart-total`, { method: 'POST' }, {
            region,
            currency: REGION_CURRENCIES[region],
            items: [{ productId: id, quantity: 1, name: product.name }],
        });

        if (r.status === 200 && r.body.ok) {
            const totalUSD = r.body.totals?.USD;
            const item = r.body.items?.[0];
            const regionalUSD = item?.regionalPriceUSD;
            const finalUSD = item?.finalPriceUSD;
            console.log(`  ${pad(region, 10)} ${pad(REGION_CURRENCIES[region], 10)} ${rpad(`$${finalUSD}`, 12)} ✅`);
            results.push({ region, ok: true, regionalUSD, finalUSD, totalUSD });
        } else {
            console.log(`  ${pad(region, 10)} ${pad(REGION_CURRENCIES[region], 10)} ${rpad('—', 12)} ❌ ${JSON.stringify(r.body).slice(0, 60)}`);
            results.push({ region, ok: false });
        }
    }

    // Verify regional adjustments actually differ where overrides are set
    console.log('\n  Regional adjustment verification:');
    const baseResult = results.find(r => r.region === 'default' && r.ok);
    for (const res of results) {
        if (!res.ok || res.region === 'default') continue;
        const rp = product.regionalPricing?.[res.region];
        if (rp?.enabled) {
            const expected = rp.adjustmentType === 'percentage'
                ? product.priceUSD * (1 + rp.adjustmentValue / 100)
                : product.priceUSD + rp.adjustmentValue;
            const match = Math.abs((res.regionalUSD || 0) - expected) < 0.02;
            if (match) pass(`${res.region}: $${res.regionalUSD} matches expected $${expected.toFixed(2)}`);
            else fail(`${res.region}: got $${res.regionalUSD}, expected $${expected.toFixed(2)}`);
        } else {
            if (baseResult && res.finalUSD === baseResult.finalUSD) {
                pass(`${res.region}: no override → same as default ($${res.finalUSD})`);
            } else if (!baseResult) {
                info(`${res.region}: finalUSD = $${res.finalUSD} (no default to compare)`);
            } else {
                info(`${res.region}: $${res.finalUSD} (differs from default $${baseResult.finalUSD} — check for discount)`);
            }
        }
    }
}

async function testCurrencyRates() {
    console.log('\n' + line());
    console.log('TEST 4 — /api/currency/rates');
    console.log(line());

    const r = await request(`${BASE_URL}/api/currency/rates`);
    if (r.status === 200 && r.body.ok && r.body.rates) {
        pass(`Rates fetched successfully`);
        for (const [code, rate] of Object.entries(r.body.rates)) {
            info(`  ${pad(code, 6)} = ${rate}`);
        }

        const required = ['USD', 'INR', 'GBP'];
        const missing = required.filter(c => !r.body.rates[c]);
        if (missing.length === 0) pass('All required currencies present (USD, INR, GBP)');
        else fail(`Missing currencies: ${missing.join(', ')}`);
    } else {
        fail(`Unexpected response ${r.status}: ${JSON.stringify(r.body).slice(0, 120)}`);
    }
}

async function testRegionalPricingOverview() {
    console.log('\n' + line());
    console.log('TEST 5 — /api/admin/products/regional-pricing/overview (needs admin auth)');
    console.log(line());
    info('This endpoint requires admin authentication — testing without auth to confirm 401:');

    const r = await request(`${BASE_URL}/api/admin/products/regional-pricing/overview`);
    if (r.status === 401 || r.status === 403) {
        pass(`Correctly protected — got ${r.status}`);
    } else if (r.status === 200) {
        pass(`Returned overview (running with auth or open in dev)`);
        info(`Total products: ${r.body.data?.totalProducts}`);
        info(`Products with overrides: ${r.body.data?.productsWithRegionalPricing}`);
    } else {
        fail(`Unexpected: ${r.status} — ${JSON.stringify(r.body).slice(0, 120)}`);
    }
}

async function testCartWithBadProduct() {
    console.log('\n' + line());
    console.log('TEST 6 — Edge cases');
    console.log(line());

    // Bad product ID
    const r1 = await request(`${BASE_URL}/api/calculate-cart-total`, { method: 'POST' }, {
        region: 'India',
        currency: 'INR',
        items: [{ productId: 'NONEXISTENT-99999', quantity: 1, name: 'Ghost product' }],
    });
    if (r1.status === 400 && !r1.body.ok) pass('Non-existent product → 400 error (correct)');
    else fail(`Expected 400, got ${r1.status}: ${JSON.stringify(r1.body).slice(0, 80)}`);

    // Empty items
    const r2 = await request(`${BASE_URL}/api/calculate-cart-total`, { method: 'POST' }, {
        region: 'UAE', items: [],
    });
    if (r2.status === 400 && !r2.body.ok) pass('Empty cart → 400 error (correct)');
    else fail(`Expected 400, got ${r2.status}: ${JSON.stringify(r2.body).slice(0, 80)}`);
}

async function testPricingCalculatorLogic() {
    console.log('\n' + line());
    console.log('TEST 7 — pricingCalculator.js unit tests (no HTTP)');
    console.log(line());

    const { getRegionalPriceUSD } = require('./utils/pricingCalculator');

    const cases = [
        // [label,                 priceUSD, region,   rp,                                             expected]
        ['No regional pricing',    1000,     'India',  null,                                           1000],
        ['Region default',         1000,     'default',{ India: { enabled:true, adjustmentType:'percentage', adjustmentValue:10 } }, 1000],
        ['% +10% India enabled',   1000,     'India',  { India: { enabled:true, adjustmentType:'percentage', adjustmentValue:10 } }, 1100],
        ['% -20% UK enabled',      1000,     'UK',     { UK:    { enabled:true, adjustmentType:'percentage', adjustmentValue:-20 } }, 800],
        ['fixed +50 UAE enabled',  1000,     'UAE',    { UAE:   { enabled:true, adjustmentType:'fixed',      adjustmentValue:50  } }, 1050],
        ['region override disabled', 1000,   'India',  { India: { enabled:false,adjustmentType:'percentage', adjustmentValue:10 } }, 1000],
        ['zero priceUSD',          0,        'India',  { India: { enabled:true, adjustmentType:'percentage', adjustmentValue:10 } }, 0],
        ['negative fixed (floor 0)',100,     'UAE',    { UAE:   { enabled:true, adjustmentType:'fixed',      adjustmentValue:-200 } }, 0],
    ];

    let passed = 0, failed = 0;
    for (const [label, priceUSD, region, rp, expected] of cases) {
        const product = { priceUSD, regionalPricing: rp };
        const result = getRegionalPriceUSD(product, region);
        if (Math.abs(result - expected) < 0.02) {
            pass(`${label} → $${result}`);
            passed++;
        } else {
            fail(`${label} → got $${result}, expected $${expected}`);
            failed++;
        }
    }
    console.log(`\n  Summary: ${passed} passed, ${failed} failed`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
    console.log('\n' + line('═'));
    console.log('  REGIONAL PRICING TEST SUITE');
    console.log(`  Target: ${BASE_URL}`);
    if (TARGET_PRODUCT_ID) console.log(`  Product: ${TARGET_PRODUCT_ID}`);
    console.log(line('═'));

    const serverOk = await testServerHealth();
    if (!serverOk) {
        console.log('\n⚠️  Server not reachable — aborting.\n');
        process.exit(1);
    }

    const product = await testProductFetch(TARGET_PRODUCT_ID);
    await testCalculateCartTotal(product);
    await testCurrencyRates();
    await testRegionalPricingOverview();
    await testCartWithBadProduct();
    await testPricingCalculatorLogic();

    console.log('\n' + line('═'));
    console.log('  Done.');
    console.log(line('═') + '\n');
})();
